import { createReadStream } from 'node:fs';
import { access, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const distDirectory = resolve(fileURLToPath(new URL('./dist/', import.meta.url)));
const indexFile = resolve(distDirectory, 'index.html');
const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
]);

const sendError = (response, status, message) => {
  response.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(message);
};

const isMissingFile = (error) => error?.code === 'ENOENT' || error?.code === 'ENOTDIR';

const handleRequest = async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    sendError(response, 405, 'Method Not Allowed');
    return;
  }

  try {
    const url = new URL(request.url ?? '/', 'http://localhost');
    const decodedPath = decodeURIComponent(url.pathname);
    let filePath = resolve(distDirectory, `.${decodedPath}`);

    if (filePath !== distDirectory && !filePath.startsWith(`${distDirectory}${sep}`)) {
      sendError(response, 404, 'Not Found');
      return;
    }

    let fileInfo;
    try {
      fileInfo = await stat(filePath);
      if (fileInfo.isDirectory()) {
        filePath = resolve(filePath, 'index.html');
        fileInfo = await stat(filePath);
      }
    } catch (error) {
      if (!isMissingFile(error)) throw error;

      if (!request.headers.accept?.includes('text/html')) {
        sendError(response, 404, 'Not Found');
        return;
      }

      filePath = indexFile;
      fileInfo = await stat(filePath);
    }

    if (!fileInfo.isFile()) {
      sendError(response, 404, 'Not Found');
      return;
    }

    response.writeHead(200, {
      'Cache-Control': filePath === indexFile ? 'no-cache' : 'public, max-age=3600',
      'Content-Length': fileInfo.size,
      'Content-Type': contentTypes.get(extname(filePath).toLowerCase()) ?? 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    });

    if (request.method === 'HEAD') {
      response.end();
      return;
    }

    const fileStream = createReadStream(filePath);
    fileStream.on('error', (error) => {
      console.error(`Could not serve ${filePath}:`, error);
      if (response.headersSent) {
        response.destroy(error);
      } else {
        sendError(response, 500, 'Internal Server Error');
      }
    });
    fileStream.pipe(response);
  } catch (error) {
    console.error('Request failed:', error);
    if (!response.headersSent) {
      sendError(response, 500, 'Internal Server Error');
    } else {
      response.destroy(error);
    }
  }
};

await access(indexFile);

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`Invalid PORT value: ${process.env.PORT}`);
}

createServer((request, response) => {
  void handleRequest(request, response);
}).listen(port, '0.0.0.0', () => {
  console.log(`Frontend server listening on port ${port}`);
});
