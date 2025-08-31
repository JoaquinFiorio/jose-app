import React, { useState } from "react";

export default function Resumen({
                                    plan,
                                    xfactors = [],
                                    total,
                                    onBack,
                                    onPay,
                                }) {
    const [coupon, setCoupon] = useState("");
    const [discount, setDiscount] = useState(0);

    // Aquí va tu lógica real de cupones
    const handleApplyCoupon = () => {
        if (coupon.toLowerCase() === "descuento100") {
            setDiscount(100);
        } else {
            setDiscount(0);
        }
    };

    const totalWithDiscount = Math.max(total - discount, 0);

    return (
        <div className="w-full max-w-4xl mx-auto">

            <h2 className="text-2xl font-bold text-center mb-8">Tu orden de compra</h2>
            <div className="flex flex-wrap gap-8 justify-center">
                {/* Tabla de productos */}
                <div className="bg-gray-50 rounded-xl w-full max-w-md flex-1 border  border-[#DFE4EA] overflow-hidden">
                    <table className="w-full text-left border-b border-[#DFE4EA]">
                        <thead>
                        <tr className="bg-gray-100 border-b border-[#DFE4EA]">
                            <th className="p-4 font-bold text-base">Producto</th>
                            <th className="p-4 font-bold text-base text-right">Subtotal</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr className="border-b border-[#DFE4EA]">
                            <td className="p-4 flex items-center gap-3">
                                <img src={plan.img} alt={plan.label} className="h-10" />
                                <div>
                                    <span className="font-bold text-lg">{plan.label} {plan.months ? `(${plan.months} meses)` : ""}</span>
                                    <div className="text-gray-500 text-xs">{plan.description}</div>
                                </div>
                            </td>
                            <td className="p-4 font-semibold text-right align-middle">${plan.price.toFixed(2)}</td>
                        </tr>
                        {xfactors.map((xf, idx) => (
                            <tr className="border-b border-[#DFE4EA]" key={idx}>
                                <td className="p-4 flex items-center gap-3">
                                    <div className="bg-[#276ef1] rounded-md px-3 py-2 text-white font-extrabold text-lg flex items-center justify-center h-10 min-w-[48px]">
                                        {xf.label}
                                    </div>
                                    <div>
                                        <span className="font-bold text-lg">XFactor {xf.label}</span>
                                        <div className="text-gray-500 text-xs">{xf.description || '1 adicional'}</div>
                                    </div>
                                </td>
                                <td className="p-4 font-semibold text-right align-middle">${xf.price.toFixed(2)}</td>
                            </tr>
                        ))}
                        <tr>
                            <td className="p-4 font-semibold">Subtotal</td>
                            <td className="p-4 font-bold text-right">${total.toFixed(2)}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                {/* Sección de cupón y total */}
                <div className="bg-gray-50 rounded-xl border w-full max-w-sm flex-1 border-b border-[#DFE4EA] px-6 py-8 flex flex-col justify-between min-h-[292px]">
                    <div>
                        <div className="mb-4 font-semibold text-base">Cupón de descuento</div>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                className="w-full border rounded-md border-b border-[#DFE4EA] px-4 py-2"
                                placeholder="Ingresa el código"
                                value={coupon}
                                onChange={e => setCoupon(e.target.value)}
                            />
                            <button
                                onClick={handleApplyCoupon}
                                className="bg-[#15777d] text-white font-semibold rounded-md px-5 py-2 hover:bg-[#175d5e] transition"
                            >
                                Aplicar
                            </button>
                        </div>
                        <div className="flex justify-between py-2">
                            <span>Descuento (-)</span>
                            <span className="font-bold">${discount.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="border-t pt-4 mt-6 flex justify-between items-center">
                        <span className="text-lg font-bold">Total a pagar:</span>
                        <span className="text-2xl font-extrabold">${totalWithDiscount.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            {/* Botones */}
            <div className="flex flex-col items-center mt-10">
                <button
                    onClick={() => onPay({ plan, xfactors, totalWithDiscount, coupon, discount })}
                    className="bg-[#276ef1] text-white font-bold text-lg px-16 py-3 rounded-md hover:bg-[#1d4ed8] transition"
                >
                    Realizar pago
                </button>
                <button
                    onClick={onBack}
                    className="mt-4 underline font-semibold text-gray-700 text-base"
                >
                    Volver a un paso
                </button>
            </div>
        </div>
    );
}
