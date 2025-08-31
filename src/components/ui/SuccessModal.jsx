import React, { useEffect } from "react";
import successIcon from "../../assets/welcome.svg";
import { FaTimes } from "react-icons/fa";

/**
 * SuccessModal
 * @param {boolean} open - Si el modal está visible
 * @param {function} onClose - Función para cerrar el modal
 * @param {string} title - Título positivo (ej: '¡Creación exitosa!')
 * @param {string} message - Mensaje descriptivo
 * @param {string} [itemName] - Nombre del elemento creado (opcional)
 * @param {Array} actions - [{ label, onClick, primary }]
 * @param {number} [autoClose] - Milisegundos para cierre automático (opcional)
 */
export default function SuccessModal({
  open,
  onClose,
  title = "¡Creación exitosa!",
  message = "El elemento fue creado correctamente.",
  itemName = "",
  actions = [],
  autoClose = null,
}) {
  useEffect(() => {
    if (!open || !autoClose) return;
    const timer = setTimeout(onClose, autoClose);
    return () => clearTimeout(timer);
  }, [open, autoClose, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-all"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-fade-in flex flex-col items-center p-8">
        {/* Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-700 focus:outline-none"
          aria-label="Cerrar"
        >
          <FaTimes />
        </button>
        {/* Icono de éxito */}
        <img
          src={successIcon}
          alt="Éxito"
          className="h-20 w-20 mb-4 mt-2 select-none"
          draggable={false}
        />
        {/* Título */}
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#276ef1] mb-2 text-center">
          {title}
        </h2>
        {/* Mensaje */}
        <p className="text-lg text-gray-700 mb-4 text-center">
          {message}
          {itemName && (
            <span className="block font-bold text-[#462BDD] mt-1">{itemName}</span>
          )}
        </p>
        {/* Acciones */}
        <div className="flex flex-col md:flex-row gap-3 w-full mt-2">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className={`flex-1 px-5 py-2.5 rounded-lg font-semibold text-base transition focus:outline-none focus:ring-2 focus:ring-[#276ef1] focus:ring-offset-2
                ${action.primary
                  ? "bg-[#276ef1] text-white hover:bg-[#1d4ed8]"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-400"}
              `}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 