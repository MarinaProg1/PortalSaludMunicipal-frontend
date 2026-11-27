export const DEFAULT_PAGE_SIZE = 10;

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type RecordValue = Record<string, unknown>;

const isRecord = (value: unknown): value is RecordValue =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const firstNumber = (record: RecordValue, keys: string[]): number | undefined => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return undefined;
};

export const parsePaginatedResponse = <T>(
  responseData: unknown,
  requestedPage: number,
  requestedLimit: number,
  collectionKeys: string[] = []
): PaginatedResult<T> => {
  let items: T[] = [];
  let metadata: RecordValue = {};

  if (Array.isArray(responseData)) {
    items = responseData as T[];
  } else if (isRecord(responseData)) {
    const nestedData = responseData.data;
    if (Array.isArray(nestedData)) {
      items = nestedData as T[];
    } else {
      const source = isRecord(nestedData) ? nestedData : responseData;
      const collection = collectionKeys
        .map((key) => source[key])
        .find((value) => Array.isArray(value));
      if (Array.isArray(collection)) items = collection as T[];
      else if (Array.isArray(source.items)) items = source.items as T[];
    }

    const candidate = responseData.pagination ?? responseData.paginacion ?? responseData.meta;
    if (isRecord(candidate)) metadata = candidate;
    else if (isRecord(responseData.data)) {
      const nestedMetadata =
        responseData.data.pagination ??
        responseData.data.paginacion ??
        responseData.data.meta;
      if (isRecord(nestedMetadata)) metadata = nestedMetadata;
    }
    if (Object.keys(metadata).length === 0) metadata = responseData;
  }

  const limit =
    firstNumber(metadata, ['limit', 'limite', 'perPage', 'pageSize']) ?? requestedLimit;
  const page =
    firstNumber(metadata, ['page', 'pagina', 'currentPage', 'paginaActual']) ?? requestedPage;
  const total =
    firstNumber(metadata, ['total', 'totalItems', 'totalRegistros', 'totalResultados']) ??
    items.length;
  const totalPages =
    firstNumber(metadata, ['totalPages', 'totalPaginas', 'pages']) ??
    Math.max(1, Math.ceil(total / limit));

  return { items, page, limit, total, totalPages };
};
