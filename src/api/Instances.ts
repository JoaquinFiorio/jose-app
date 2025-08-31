import axios from 'axios';

const API_URL = "https://staging-twb-auth-service.app.ordev.tech/api/auth";
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

export { API };