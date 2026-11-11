import axios from 'axios';

const clientesAxios = axios.create({
    baseURL: ((import.meta as any).env.VITE_API_URL || 'http://localhost:3000') + '/api/v1',
    headers: {
        'Content-Type': 'application/json'
    }
});

clientesAxios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

clientesAxios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const esIntentoDeLogin =
            typeof error.config?.url === 'string' && error.config.url.includes('/auth/login');

        // En el login, un 401 significa credenciales incorrectas: dejamos que la
        // pantalla muestre el toast y NO recargamos (eso borraria el mensaje).
        if (error.response && error.response.status === 401 && !esIntentoDeLogin) {
            console.warn("Token invalido o expirado. Cerrando sesion...");

            localStorage.removeItem('token');

            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default clientesAxios;