import React from "react";

/**
 * @param {number} activeStep - Índice del paso activo (0 = primero)
 * @param {string[]} steps - Array de nombres de pasos
 */
export default function RegisterSteps({ activeStep = 0, steps = [
    "Crear cuenta",
    "Resumen",
] }) {
    return (
        <div className="flex justify-between w-full max-w-2xl mx-auto">
            {steps.map((txt, i) => (
                <div key={i} className="flex flex-col items-center flex-1"> {/* flex-1 en vez de w-1/4 */}
                    <div className={`rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold
        ${i === activeStep ? "bg-white border-2 border-[#3758F9] text-[#3758F9]" : "bg-gray-100 text-gray-400"}`}>
                        {`0${i + 1}`}
                    </div>
                    <span className={`mt-2 text-xs ${i === activeStep ? "text-[#3758F9] font-semibold" : "text-gray-400"}`}>{txt}</span>
                </div>
            ))}
        </div>

    );
}
