const API_URL = "https://twb-api.e72qzf.easypanel.host/api/v1";

const membershipService = {
    async getMembershipXFactors(userId, authToken = null) {
        try {
            const token = authToken || localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }
            console.log('[membershipService] Llamando a GET /users/' + userId + '/membership-xfactors');
            const response = await fetch(`${API_URL}/users/${userId}/membership-xfactors`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('[membershipService] Status:', response.status, response.statusText);
            let data;
            try {
                data = await response.clone().json();
                console.log('[membershipService] Respuesta JSON:', data);
            } catch (e) {
                console.error('[membershipService] Error parseando JSON:', e);
            }
            if (!response.ok) {
                const errorData = data || await response.json().catch(() => ({}));
                
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    throw new Error('Sesión expirada');
                }
                
                throw new Error(errorData.message || 'Error al obtener información de membresía y XFactors');
            }

            if (!data.success) {
                throw new Error(data.message || 'Error en la respuesta del servidor');
            }

            return data.data;
        } catch (error) {
            console.error('Error en getMembershipXFactors:', error);
            throw error;
        }
    },

    // Helper method to format membership data for display
    formatMembershipData(membershipData) {
        if (!membershipData) return null;

        const { membership, xFactors, transactions } = membershipData;

        return {
            membership: {
                type: membership?.type || 'Sin membresía',
                startDate: membership?.startDate ? new Date(membership.startDate) : null,
                endDate: membership?.endDate ? new Date(membership.endDate) : null,
                paid: membership?.paid || 0,
                status: membership?.status || 'inactive'
            },
            xFactors: xFactors || [],
            transactions: transactions || []
        };
    },

    // Helper method to check if membership is active
    isMembershipActive(membership) {
        if (!membership || membership.status !== 'active') return false;
        
        const now = new Date();
        const endDate = new Date(membership.endDate);
        
        return now <= endDate;
    },

    // Helper method to get available XFactors
    getAvailableXFactors(xFactors) {
        if (!xFactors || !Array.isArray(xFactors)) return [];
        
        return xFactors.filter(xf => {
            const now = new Date();
            const expiresAt = new Date(xf.expiresAt);
            return !xf.usedAt && now <= expiresAt;
        });
    },

    // Helper method to get used XFactors
    getUsedXFactors(xFactors) {
        if (!xFactors || !Array.isArray(xFactors)) return [];
        
        return xFactors.filter(xf => xf.usedAt);
    },

    // Helper method to get membership type color
    getMembershipTypeColor(membershipType) {
        switch (membershipType?.toLowerCase()) {
            case 'premium':
                return 'blue';
            case 'wealth':
                return 'purple';
            case 'classic':
                return 'yellow';
            default:
                return 'gray';
        }
    },

    // Helper method to format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    // Helper method to get days until expiration
    getDaysUntilExpiration(endDate) {
        if (!endDate) return null;
        
        const now = new Date();
        const expiration = new Date(endDate);
        const diffTime = expiration - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    },

    // Helper method to check if XFactor is expiring soon (within 30 days)
    isXFactorExpiringSoon(expiresAt) {
        if (!expiresAt) return false;
        
        const daysUntilExpiration = this.getDaysUntilExpiration(expiresAt);
        return daysUntilExpiration !== null && daysUntilExpiration <= 30 && daysUntilExpiration > 0;
    },

    async activateXFactor({ xfactorName, broker, server, account, password, amount }) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }
            console.log('[membershipService] Llamando a POST /xfactor/activate con:', { xfactorName, broker, server, account, amount });
            const response = await fetch(`${API_URL}/xfactor/activate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ xfactorName, broker, server, account, password, amount })
            });
            console.log('[membershipService] Status:', response.status, response.statusText);
            let data;
            try {
                data = await response.clone().json();
                console.log('[membershipService] Respuesta JSON:', data);
            } catch (e) {
                console.error('[membershipService] Error parseando JSON:', e);
            }
            if (!response.ok || !data.success) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    throw new Error('Sesión expirada');
                }
                throw new Error(data.message || 'Error al activar XFactor');
            }
            return data;
        } catch (error) {
            console.error('Error en activateXFactor:', error);
            throw error;
        }
    },

    async updateMembership(userId, membershipType) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }
            console.log('[membershipService] Llamando a PUT /users/' + userId + '/membership con:', { membershipType });
            const response = await fetch(`${API_URL}/users/${userId}/membership`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ membershipType })
            });
            console.log('[membershipService] Status:', response.status, response.statusText);
            let data;
            try {
                data = await response.clone().json();
                console.log('[membershipService] Respuesta JSON:', data);
            } catch (e) {
                console.error('[membershipService] Error parseando JSON:', e);
            }
            if (!response.ok || !data.success) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    throw new Error('Sesión expirada');
                }
                throw new Error(data.message || 'Error al actualizar membresía');
            }
            return data;
        } catch (error) {
            console.error('Error en updateMembership:', error);
            throw error;
        }
    },

    async upgradeMembershipWithPayment(userId, membershipType) {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No hay token de autenticación');
        console.log('[membershipService] Llamando a POST /users/' + userId + '/upgrade-membership con:', { membershipType });
        const response = await fetch(`${API_URL}/users/${userId}/upgrade-membership`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ membershipType })
        });
        console.log('[membershipService] Status:', response.status, response.statusText);
        let data;
        try {
            data = await response.clone().json();
            console.log('[membershipService] Respuesta JSON:', data);
        } catch (e) {
            console.error('[membershipService] Error parseando JSON:', e);
        }
        if (!response.ok || !data.success) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                throw new Error('Sesión expirada');
            }
            throw new Error(data.message || 'Error al crear la orden de pago');
        }
        return data; // { invoiceUrl }
    },

    async buyXFactorWithPayment(userId, xfactorName) {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No hay token de autenticación');
        console.log('[membershipService] Llamando a POST /xfactor/' + userId + '/activate-with-payment con:', { xfactorName });
        const response = await fetch(`${API_URL}/xfactor/${userId}/activate-with-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ xfactorName })
        });
        console.log('[membershipService] Status:', response.status, response.statusText);
        let data;
        try {
            data = await response.clone().json();
            console.log('[membershipService] Respuesta JSON:', data);
        } catch (e) {
            console.error('[membershipService] Error parseando JSON:', e);
        }
        if (!response.ok || !data.success) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                throw new Error('Sesión expirada');
            }
            throw new Error(data.message || 'Error al crear la orden de pago de XFactor');
        }
        return { invoiceUrl: data.invoiceUrl };
    },

    async activateBrokerXFactor(xfactorName, xFactorId) {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No hay token de autenticación');
        const cleanName = (xfactorName || '').replace(/"/g, '');
        console.log('[membershipService] Llamando a PATCH /xfactor/' + cleanName + '/broker-active');
        const body = { isBrokerActive: true };
        if (xFactorId) body.xFactorId = xFactorId;
        const response = await fetch(`${API_URL}/xfactor/${cleanName}/broker-active`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });
        console.log('[membershipService] Status:', response.status, response.statusText);
        let data;
        try {
            data = await response.clone().json();
            console.log('[membershipService] Respuesta JSON:', data);
        } catch (e) {
            console.error('[membershipService] Error parseando JSON:', e);
        }
        if (!response.ok || !data.success) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                throw new Error('Sesión expirada');
            }
            throw new Error(data.message || 'Error al activar el broker del XFactor');
        }
        return data;
    }
};

export default membershipService; 