const API_URL = "https://twb-api.e72qzf.easypanel.host/api/v1";

const userService = {
  updateUser: async (id, userData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar usuario");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error en updateUser:", error);
      throw error;
    }
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    try {
      if (!email) {
        throw new Error("Email es requerido");
      }

      console.log("Solicitando restablecimiento de contraseña para:", email);
      
      const response = await fetch(`${API_URL}/users/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error("Error en requestPasswordReset:", {
          estado: response.status,
          textoEstado: response.statusText,
          datosError: data
        });

        // Manejar diferentes tipos de errores
        if (response.status === 400) {
          throw new Error(data.message || "Email es requerido");
        }
        if (response.status === 404) {
          throw new Error(data.message || "Usuario no encontrado con ese email");
        }
        
        throw new Error(data.message || "Error al solicitar restablecimiento de contraseña");
      }

      if (!data.success) {
        throw new Error(data.message || "Error al solicitar restablecimiento de contraseña");
      }

      console.log("Restablecimiento de contraseña solicitado exitosamente:", data.message);
      return data;
    } catch (error) {
      console.error("Error en requestPasswordReset:", error);
      throw error;
    }
  },
};

export default userService; 