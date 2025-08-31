const API_URL = "https://twb-api.e72qzf.easypanel.host/api/v1";

const registerService = {
    // Registrar usuario (IMPLEMENTACION 17-08-2025)
    register: async (userData, membershipData) => {
        console.log('[registerService - register] Inicializando el registro....');

        // Obtener el objeto completo de membresía
        const membershipObj = membershipData?.fullObject || null;
        console.log('[registerService - register] membershipObj', membershipObj);

        // Crear el cuerpo de la solicitud
        const body = {
            ...userData,
            ...(userData.refered ? { refered: userData.refered } : {}),
            membershipType: membershipData?.name,
            ...(membershipObj ? { membership: membershipObj } : {}),
        };
        console.log('[registerService - register] body', body);

        // Enviar la solicitud al backend
        const response = await fetch(`${API_URL}/network/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        console.log('[registerService - register] data', data);

        // Manejar la respuesta del backend en caso de error
        if (!data.success) throw new Error(data.message || 'Error en el registro');

        return data;
    },

    // Crear pago
    createPayment: async ({ membershipName, userId, price, token }) => {
        const response = await fetch(`${API_URL}/payments/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ membershipId: membershipName, userId, price })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error al crear el pago');
        return data;
    },

    // Consultar estado de pago por payment_id (método original)
    getPaymentStatus: async (paymentId) => {
        const response = await fetch(`${API_URL}/payments/status/${paymentId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error al consultar el estado de pago');
        return data;
    },

    // Consultar estado de pago por invoice_id (método nuevo)
    getPaymentStatusByInvoiceId: async (invoiceId) => {
        const response = await fetch(`${API_URL}/payments/status/invoice/${invoiceId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error al consultar el estado de pago');
        return data;
    },

    // Polling masivo de pagos pendientes (opcional)
    pollAllPendingPayments: async () => {
        const response = await fetch(`${API_URL}/payments/poll-pending`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error al actualizar pagos pendientes');
        return data;
    },

    // Obtener el nombre del referido por uId
    getReferedName: async (uId) => {
        try {
            const res = await fetch(`${API_URL}/users/by-uid/${uId}`);
            const data = await res.json();
            return data;
        } catch {
            return { name: '' };
        }
    }
};

export default registerService; 