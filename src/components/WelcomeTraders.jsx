import React from "react";
import successIcon from "../assets/welcome.svg";

export default function PurchaseSuccess({ orderId, onResendEmail }) {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-2">
            {/* Success Icon */}
            <img
                src={successIcon}
                alt="¡Gracias por tu compra!"
                className="h-36 mb-8"
                draggable={false}
            />
            {/* Success Title */}
            <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-[#232323]">
                ¡Gracias por tu compra!
            </h1>
            {/* Order ID */}
            <p className="text-lg md:text-xl text-[#5b48e7] font-bold mb-4">
                Número de pedido: <span className="font-mono">{orderId}</span>
            </p>
            {/* Next Steps */}
            <p className="max-w-xl text-lg md:text-xl text-[#2d2d2d] mb-6 font-medium">
                Te hemos enviado un email con los detalles y tu acceso.<br />
                Revisa tu bandeja de entrada para comenzar.
            </p>
            {/* Help Button */}
            <button
                onClick={onResendEmail}
                className="text-[#232323] underline font-extrabold text-lg mt-2 inline-block hover:text-[#5b48e7] transition"
            >
                ¿No recibiste el email? Haz clic aquí para reenviarlo
            </button>
        </div>
    );
}
