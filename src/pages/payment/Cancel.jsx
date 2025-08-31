import React from "react";
import { XCircle, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

const Cancel = () => (
  <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg">
      <div className="p-10 text-center space-y-8">
        <div className="w-20 h-20 bg-[#EF4444] rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-10 h-10 text-white" />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#B91C1C] mb-2">Pago cancelado</h1>
            <p className="text-[#374151]">El pago fue cancelado o no se completó.</p>
          </div>

          <div className="text-left bg-white border border-gray-100 rounded-lg p-4">
            <p className="text-[#374151] mb-3">¿Tienes dudas o problemas con tu pago?</p>
            <div className="space-y-1 text-sm text-[#6B7280]">
              <p>→ Puedes intentarlo nuevamente</p>
              <p>→ O contactar a soporte para recibir ayuda</p>
            </div>
          </div>

          <div className="text-left">
            <h3 className="font-semibold text-[#B91C1C] mb-2">❗ ¿Qué hacer ahora?</h3>
            <p className="text-sm text-[#374151]">
              Haz clic en el botón "Iniciar sesión" para volver al inicio o intenta realizar el pago otra vez.
            </p>
          </div>
        </div>

        <Link
          to="/login"
          className="w-full inline-flex justify-center items-center bg-[#E91E63] hover:bg-[#C2185B] text-white py-3 rounded-md font-medium transition-colors text-base"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Iniciar sesión
        </Link>

        <p className="text-xs text-[#6B7280]">Si el problema persiste, contacta a soporte o revisa tu método de pago.</p>
      </div>
    </div>
  </div>
);

export default Cancel; 