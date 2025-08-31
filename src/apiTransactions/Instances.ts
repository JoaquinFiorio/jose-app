import axios from 'axios';

const API_URL = "https://staging-twb-transaction-service.app.ordev.tech/api/deposits";
const API = axios.create({ baseURL: API_URL });
API.interceptors.request.use(
    async (config: any) => {
        const token = await localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        const language = localStorage.getItem('language') || 'en';
        config.headers['content-language'] = language;
        return config;
    }
);

const API_URL_PURCHASES = "https://staging-twb-transaction-service.app.ordev.tech/api/purchases";
const API_PURCHASES = axios.create({ baseURL: API_URL_PURCHASES });
API_PURCHASES.interceptors.request.use(
    async (config: any) => {
        const token = await localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        const language = localStorage.getItem('language') || 'en';
        config.headers['content-language'] = language;
        return config;
    }
);

export { API, API_PURCHASES };