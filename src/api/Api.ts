import { API } from "./Instances";
import { rejectApiError } from "./RejectApiError";

const registerApi = (data: any) => {
    return new Promise((resolve, reject) => {
        API.post('/register', data)
            .then((response: any) => resolve(response.data))
            .catch((error: any) => reject(rejectApiError(error.response.data)));
    });
};

const loginApi = (email: any, password: any) => {
    return new Promise((resolve, reject) => {
        API.post('/login', { email, password })
            .then((response: any) => resolve(response.data))
            .catch((error: any) => reject(rejectApiError(error.response.data)));
    });
};

const getUserLogged = () => {
    return new Promise((resolve, reject) => {
        API.get('/me')
            .then((response: any) => resolve(response.data))
            .catch((error: any) => reject(rejectApiError(error.response.data)));
    });
};

const forgotPassword = (email: string) => {
    return new Promise((resolve, reject) => {
        API.post('/restore-password', { email })
            .then((response: any) => resolve(response.data))
            .catch((error: any) => reject(rejectApiError(error.response.data)));
    });
};

const restorePassword = (password: string, id: string | undefined) => {
    return new Promise((resolve, reject) => {
        API.put('/set-password')
            .then((response: any) => resolve(response.data))
            .catch((error: any) => reject(rejectApiError(error.response.data)));
    });
};

const changePassword = (password: string, id: string | undefined) => {
    return new Promise((resolve, reject) => {
        API.put('/password')
            .then((response: any) => resolve(response.data))
            .catch((error: any) => reject(rejectApiError(error.response.data)));
    });
};

const changeProfileInfoApi = (data: any) => {
    return new Promise((resolve, reject) => {
        API.put('/profile', data)
            .then((response: any) => resolve(response.data))
            .catch((error: any) => reject(rejectApiError(error.response.data)));
    });
};

export {
    changeProfileInfoApi,
    changePassword,
    forgotPassword,
    restorePassword,
    loginApi,
    registerApi,
    getUserLogged,
}