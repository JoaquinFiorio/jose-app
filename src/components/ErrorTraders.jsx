import React from "react";

export default function ErrorTraders() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-2">
            {/* Título */}
            <h1 className="text-3xl font-bold text-slate-800 mb-4">
                ¡Ups! Algo salió mal
            </h1>
            {/* Mensaje */}
            <p className="text-lg text-slate-600 mb-6">
                Parece que hubo un error al procesar tu solicitud. Por favor, intenta de nuevo más tarde.
            </p>
            {/* Botón de recarga */}
            <button
                onClick={() => window.location.assign('/')}
                className="px-6 py-3 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-colors"
                draggable={false}
            >
                Recargar página
            </button>
            {/* Texto adicional */}
            <p className="text-sm text-slate-500 mt-4">
                Si el problema persiste, contacta a nuestro soporte técnico.
            </p>
        </div>
    );
}
