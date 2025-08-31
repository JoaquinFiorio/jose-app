import { useState } from "react";
import { myPayments, paymentApi, myPurchases } from "../apiTransactions/Api";

export const useTransactions = () => {

  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [user, setUser] = useState<any>(null);

  // ---------- LOGIN ----------
  const payment = async (membership: string) => {
    setPaying(true);
    try {
      const response: any = await paymentApi(membership)

      if (!response.ok) throw new Error(response.message || "Error al comprar la membresía");

      setPaying(false);

      return response;
    } catch (e: any) {
      setPaying(false);
      throw e;
    }
  };

  // ---------- GET CURRENT PAYS ----------
  const getCurrentUserDeposits = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No hay token de autenticación");

      const response: any = await myPayments();

      if (!response.success) throw new Error("Error al obtener usuario actual");

      setLoading(false);

      return response;
    } catch (e: any) {
      setLoading(false);
      throw e;
    }
  };

  const getCurrentUserPayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No hay token de autenticación");

      const response: any = await myPurchases();

      if (!response.success) throw new Error("Error al obtener usuario actual");

      setLoading(false);

      return response;
    } catch (e: any) {
      setLoading(false);
      throw e;
    }
  };

  return {
    // estados
    loading,
    paying,
    user,
    // funciones
    payment,
    getCurrentUserDeposits,
    getCurrentUserPayments
  };
};
