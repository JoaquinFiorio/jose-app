const API_URL = "https://twb-api.e72qzf.easypanel.host/api/v1";
const authService = {
    login: async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al iniciar sesión');
            }

            if (!data.token) {
                throw new Error('No se recibió el token de acceso');
            }

            // Guardar ambos tokens
            localStorage.setItem('token', data.token);

            return data;
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    },


    register: async (userData) => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al registrar usuario');
            }

            return data;
        } catch (error) {
            console.error('Error en registro:', error);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
    },

    getCurrentUser: async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            const response = await fetch(`${API_URL}/auth/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al obtener usuario actual');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error en getCurrentUser:', error);
            throw error;
        }
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    /**
     * Función legacy - mantener por compatibilidad
     * @deprecated Usar changePasswordWithToken para mayor seguridad
     */
    changePassword: async (email, newPassword) => {
        try {
            console.log('Intentando cambio de contraseña para:', { email });
            const response = await fetch(`${API_URL}/users/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, newPassword })
            });

            const data = await response.json();
            console.log('Respuesta del servidor:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Error al cambiar la contraseña');
            }

            return data;
        } catch (error) {
            console.error('Error en changePassword:', error);
            throw error;
        }
    },

    /**
     * Solicita un token de reset de contraseña por email
     * @param {string} email - Email del usuario
     * @returns {Promise} - Respuesta del servidor
     */
    requestPasswordReset: async (email) => {
        try {
            console.log('Solicitando reset de contraseña para:', { email });
            const response = await fetch(`${API_URL}/users/request-password-reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            console.log('Respuesta del servidor:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Error al solicitar reset de contraseña');
            }

            return data;
        } catch (error) {
            console.error('Error en requestPasswordReset:', error);
            throw error;
        }
    },

    /**
     * Valida un token de reset de contraseña
     * @param {string} token - Token de reset
     * @param {string} email - Email del usuario (opcional, para validación adicional)
     * @returns {Promise} - Respuesta del servidor
     */
    validatePasswordResetToken: async (token, email = null) => {
        try {
            console.log('Validando token de reset:', { token: token.substring(0, 10) + '...', email });
            const body = { token };
            if (email) body.email = email;

            const response = await fetch(`${API_URL}/users/validate-reset-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            console.log('Respuesta validación token:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Token inválido o expirado');
            }

            return data;
        } catch (error) {
            console.error('Error en validatePasswordResetToken:', error);
            throw error;
        }
    },

    /**
     * Cambia la contraseña usando un token de reset válido
     * @param {string} email - Email del usuario
     * @param {string} newPassword - Nueva contraseña
     * @param {string} token - Token de reset válido
     * @returns {Promise} - Respuesta del servidor
     */
    changePasswordWithToken: async (email, newPassword, token) => {
        try {
            console.log('Cambiando contraseña con token para:', { email, token: token.substring(0, 10) + '...' });
            const response = await fetch(`${API_URL}/users/change-password-with-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, newPassword, token })
            });

            const data = await response.json();
            console.log('Respuesta del servidor:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Error al cambiar la contraseña');
            }

            return data;
        } catch (error) {
            console.error('Error en changePasswordWithToken:', error);
            throw error;
        }
    }
};

export default authService; 