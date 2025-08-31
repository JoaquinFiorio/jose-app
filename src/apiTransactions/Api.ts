import { API, API_PURCHASES } from "./Instances";
import { rejectApiError } from "./RejectApiError";

const paymentApi = (membership: any) => {
    return new Promise((resolve, reject) => {
        API.post('/acquire-membership', { membership })
            .then((response: any) => resolve(response.data))
            .catch((error: any) => reject(rejectApiError(error.response.data)));
    });
};

const myPayments = () => {
    return new Promise((resolve, reject) => {
        API.get('/me?page=1&limit=10')
            .then((response: any) => resolve(response.data))
            .catch((error: any) => reject(rejectApiError(error.response.data)));
    });
};

const myPurchases = () => {
    return new Promise((resolve, reject) => {
        API_PURCHASES.get('/me')
            .then((response: any) => resolve(response.data))
            .catch((error: any) => reject(rejectApiError(error.response.data)));
    });
};

export {
    myPayments,
    paymentApi,
    myPurchases
}