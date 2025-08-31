import React from "react";

export default function PlanSelector({
             plans,
             selectedPlan,
             setSelectedPlan,
             selectedXFactors,
             setSelectedXFactors,
             handleXFactorClick,
             total,
             currentPlan,
             onContinue,
         }) {
    return (
        <>
            {/* Selecciona tu plan */}
            <h2 className="text-center text-xl font-semibold mb-8">
                Selecciona tu plan de membresía
            </h2>
            <div className="flex justify-center gap-6 mb-8 w-full">
                {plans.map((plan) => (
                    <div
                        key={plan.key}
                        className={`bg-white rounded-xl shadow p-6 w-60 flex flex-col items-center cursor-pointer transition-all duration-150 ${selectedPlan === plan.key
                            ? "border-2 border-[#462BDD] scale-105"
                            : "opacity-80 border border-transparent hover:border-2 hover:border-[#1F0E80]"
                        }`
                        }
                        onClick={() => {
                            setSelectedPlan(plan.key);
                            setSelectedXFactors([]);
                        }}
                    >
                        <img
                            src={plan.img}
                            alt={plan.label}
                            className="h-16 mb-3"
                        />

                        <div
                            className={`font-extrabold text-2xl text-center leading-6
                ${selectedPlan === plan.key ? "text-[#276ef1]" : "text-gray-500"}
              `}
                        >
                            {plan.label}
                            <br />
                            <span className={`text-base font-bold ${selectedPlan === plan.key ? "text-[#276ef1]" : "text-gray-500"}`}>
                {plan.months} MESES
              </span>
                        </div>
                        <div className="text-center text-black mt-2 text-[16px] font-medium">
                            {plan.description}
                        </div>
                    </div>
                ))}
            </div>

            {/* XFators (solo si aplica) */}
            {currentPlan?.xfactors && currentPlan.xfactors.length > 0 && (
                <div className="w-full flex flex-col items-center mb-2">
                    <span className="font-bold text-lg mb-1">XFactors opcionales</span>
                    <span className="text-gray-500 mb-3">
                        Selecciona máx {currentPlan.maxXFactors} XFactor{currentPlan.maxXFactors > 1 ? "es" : ""}
                    </span>
                    <div className="flex justify-center gap-6 mb-4">
                        {currentPlan.xfactors.map((xf, idx) => {
                            const selected = selectedXFactors.includes(idx);
                            return (
                                <div
                                    key={idx}
                                    onClick={() => handleXFactorClick(idx)}
                                    className={`
          rounded-xl shadow w-56 h-32 flex flex-row items-center justify-between cursor-pointer border transition-all duration-150 select-none
          ${selected
                                        ? "border-2 border-[#276ef1] scale-105 bg-[#276ef1] text-white"
                                        : "border border-gray-200 bg-white text-black hover:border-[#276ef1] hover:scale-105"
                                    }
        `}
                                    style={{
                                        background: selected ? "#276ef1" : "#fff",
                                        color: selected ? "#fff" : "#000"
                                    }}
                                >
                                    {/* Label grande */}
                                    <div className={`pl-6 text-5xl font-extrabold ${selected ? "" : "text-black"}`}>
                                        {xf.label}
                                    </div>
                                    {/* Precio y descripción pegados a la derecha */}
                                    <div className="flex flex-col items-start pl-3 pr-6">
                                        <div className={`text-2xl font-bold mb-0 ${selected ? "" : "text-black"}`}>
                                            ${xf.price}
                                        </div>
                                        <div className={`text-base mt-1 leading-tight ${selected ? "text-white" : "text-gray-600"}`}>
                                            <div>Capital máx.</div>
                                            <div>{xf.description}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Total a pagar */}
            <div className="text-center my-8">
                <span className="text-xl font-medium">Total a pagar:</span>
                <span className="text-2xl font-extrabold ml-2">${total}
                    <span className="text-lg font-bold">(x{currentPlan.months} meses)</span>
                 </span>
            </div>
            <button
                type="button"
                className="block mx-auto bg-[#276ef1] text-white font-bold text-lg px-12 py-3 rounded-md hover:bg-[#1d4ed8] transition"
                onClick={onContinue}
            >
                Continuar
            </button>
        </>
    );
}
