import axios from 'axios';

const clientesAxios = axios.create({

    baseURL: (import.meta as ImportMeta & { env: { VITE_API_URL: string } }).env.VITE_API_URL,

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
        if (error.response && error.response.status === 401) {
            console.warn("Token invalido o expirado. Cerrando sesion...");

            localStorage.removeItem('token');

            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default clientesAxios;