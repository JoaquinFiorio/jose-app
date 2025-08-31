import { useState } from "react";
import { loginApi, registerApi, getUserLogged, changeProfileInfoApi, forgotPassword } from "../api/Api";

export const useAuth = () => {

  const [loading, setLoading] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [user, setUser] = useState<any>(null);

  // ---------- LOGIN ----------
  const login = async (email: string, password: string) => {
    setAuthenticating(true);
    try {
      const response: any = await loginApi(email, password);

      if (!response.success) throw new Error(response.message || "Error al iniciar sesión");

      if (!response.token) throw new Error("No se recibió el token de acceso");

      // Guardar tokens
      localStorage.setItem("token", response.token);
      
      setAuthenticating(false);

      return response;
    } catch (e: any) {
      setAuthenticating(false);
      throw e;
    }
  };

  // ---------- REGISTER ----------
  const register = async (userData: any) => {
    setLoading(true);
    try {
      const response: any = await registerApi(userData);

      if (!response.success) throw new Error(response.message || "Error al registrar usuario");

      setLoading(false);
      
      return response;
    } catch (e: any) {
      setLoading(false);
      throw e;
    }
  };

  // ---------- LOGOUT ----------
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // ---------- GET CURRENT USER ----------
  const getCurrentUser = async () => {
    setLoading(true);
    try {
      
      const response: any = await getUserLogged()

      if (!response.success) throw new Error("Error al obtener usuario actual");

      setUser(response.data);
      setLoading(false);
      return response.data;
    } catch (e: any) {
      setLoading(false);
      throw e;
    }
  };

  // ---------- PASSWORD RESET ----------
  const requestPasswordReset = async (email: string) => {
    try {
      const response: any = await forgotPassword(email);
      
      if (!response.success) throw new Error(response.message || "Error al solicitar reset");

      return response;
    } catch (e: any) {
      throw e;
    }
  };

  const validatePasswordResetToken = async (token: string, email?: string) => {
    try {
      const body: any = { token };
      if (email) body.email = email;

      const response = await fetch(`${API_URL}/users/validate-reset-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Token inválido o expirado");

      return data;
    } catch (e: any) {
      throw e;
    }
  };

  const changeProfileInfo = async (data: any) => {
    try {
      const response: any = await changeProfileInfoApi(data);
      if (!response.success) throw new Error(response.message || "Error al cambiar información del perfil");
      return response;
    } catch (e: any) {
      throw e;
    }
  };

  // ---------- IS AUTHENTICATED ----------
  const isAuthenticated = () => !!localStorage.getItem("token");

  return {
    // estados
    loading,
    authenticating,
    user,
    // funciones
    login,
    register,
    logout,
    getCurrentUser,
    isAuthenticated,
    requestPasswordReset,
    validatePasswordResetToken,
    changeProfileInfo
  };
};
