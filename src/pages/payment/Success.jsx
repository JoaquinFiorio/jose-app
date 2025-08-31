import React from "react";
import { CheckCircle, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

const Success = () => (
  <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg">
      <div className="p-10 text-center space-y-8">
        <div className="w-20 h-20 bg-[#10B981] rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#2B4C8C] mb-2">¡Pago recibido con éxito!</h1>
            <p className="text-[#374151]">¡Enhorabuena! Tu transacción se ha completado correctamente.</p>
          </div>

          <div className="text-left bg-white border border-gray-100 rounded-lg p-4">
            <p className="text-[#374151] mb-3">Hemos enviado un correo a tu bandeja de entrada:</p>
            <div className="space-y-1 text-sm text-[#6B7280]">
              <p>→ Detalles de el pago realizado</p>
            </div>
          </div>

          <div className="text-left">
            <h3 className="font-semibold text-[#2B4C8C] mb-2">🔐 ¿Y ahora qué?</h3>
            <p className="text-sm text-[#374151]">
              Haz clic en el botón "Continuar" para acceder a tu cuenta.
            </p>
          </div>
        </div>

        <Link
          to="/login"
          className="w-full inline-flex justify-center items-center bg-[#E91E63] hover:bg-[#C2185B] text-white py-3 rounded-md font-medium transition-colors text-base"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Continuar
        </Link>

        <p className="text-xs text-[#6B7280]">¿No ves los correos? Revisa tu carpeta de spam o promociones.</p>
      </div>
    </div>
  </div>
);

export default Success; 