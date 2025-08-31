import axios from 'axios';

const API_URL = "https://twb-api.e72qzf.easypanel.host/api/v1";

export const supportService = {
  // Crear un nuevo ticket de soporte usando el nuevo endpoint
  createSupportTicket: async (data) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      console.log('Creando ticket de soporte:', data);
      
      // Usar el nuevo endpoint específico para soporte
      const response = await axios.post(`${API_URL}/support/create`, 
        {
          subject: data.subject,
          message: data.message,
          priority: data.priority || 'Media'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Respuesta del servidor:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al crear ticket de soporte:', error);
      
      if (error.response) {
        console.error('Detalles del error de respuesta:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        throw new Error(error.response.data.message || `Error ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        console.error('No se recibió respuesta del servidor');
        throw new Error('No se pudo conectar con el servidor');
      } else {
        console.error('Error al configurar la solicitud:', error.message);
        throw new Error('Error al crear el ticket de soporte');
      }
    }
  },

  // Mantener compatibilidad con el método anterior (deprecated)
  sendSupportRequest: async (data, userId = null) => {
    console.warn('sendSupportRequest está deprecated, usa createSupportTicket en su lugar');
    return await supportService.createSupportTicket(data);
  },

  // Obtener los tickets de soporte del usuario actual
  getUserTickets: async (page = 1, limit = 10, status = null) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No hay token de autenticación para obtener tickets');
        return { data: [] };
      }
      
      let url = `${API_URL}/support/my-tickets?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }
      
      console.log('Obteniendo tickets del usuario:', url);
      
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Tickets obtenidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener tickets de soporte:', error);
      
      if (error.response && error.response.status === 404) {
        // Si el endpoint no existe, devolver array vacío
        console.warn('Endpoint de tickets no disponible');
        return { data: [] };
      }
      
      // Para otros errores, devolver array vacío también
      return { data: [] };
    }
  },

  // Obtener un ticket específico por su ID
  getTicketById: async (ticketId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      console.log('Obteniendo ticket:', ticketId);
      
      const response = await axios.get(`${API_URL}/support/ticket/${ticketId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Ticket obtenido:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener ticket:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener el ticket');
    }
  },

  // Añadir una respuesta a un ticket existente
  addTicketResponse: async (ticketId, message) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      console.log('Añadiendo respuesta al ticket:', ticketId, message);
      
      const response = await axios.post(`${API_URL}/support/ticket/${ticketId}/response`, 
        { message },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Respuesta añadida:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al añadir respuesta:', error);
      throw new Error(error.response?.data?.message || 'Error al añadir la respuesta');
    }
  }
};

export default supportService;