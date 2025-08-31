import React, { useState } from 'react';
import { toast } from "react-toastify";

const API_URL = 'http://localhost:3000/api';

const memberships = [
    { name: 'Classic', price: 9.9, desc: 'Acceso básico, sin XFactors', color: 'from-blue-400 to-blue-600' },
    { name: 'Premium', price: 19.9, desc: 'Acceso completo, 2X y 3X', color: 'from-purple-400 to-purple-600' },
    { name: 'Wealth', price: 29.9, desc: 'Acceso completo, 2X, 3X y 5X', color: 'from-yellow-400 to-yellow-600' }
];

const xFactors = [
    { name: '2X', price: 499, desc: 'Capital máximo $20,000 / $50,000' },
    { name: '3X', price: 999, desc: 'Solo Wealth, capital máximo $50,000' },
    { name: '5X', price: 1799, desc: 'Solo Wealth, capital máximo $50,000' }
];

const xFactorRules = {
    Classic: { allowed: [], max: 0 },
    Premium: { allowed: ['2X'], max: 1 },
    Wealth: { allowed: ['2X', '3X', '5X'], max: 2 }
};

export default function MembershipPurchaseForm({ onSuccess }) {
    const [selectedMembership, setSelectedMembership] = useState(null);
    const [selectedXFactors, setSelectedXFactors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [invoiceUrl, setInvoiceUrl] = useState(null);
    const [error, setError] = useState('');

    const rules = xFactorRules[selectedMembership?.name];
    const allowedXFactors = xFactors.filter(xf =>
        rules.allowed.includes(xf.name)
    );

    const handleMembershipChange = (m) => {
        setSelectedMembership(m);
        setSelectedXFactors([]);
        setError('');
    };

    const handleXFactorChange = (factor) => {
        if (!rules.allowed.includes(factor)) return;

        if (selectedXFactors.includes(factor)) {
            setSelectedXFactors(selectedXFactors.filter(f => f !== factor));
        } else {
            if (selectedXFactors.length < rules.max) {
                setSelectedXFactors([...selectedXFactors, factor]);
            } else {
                setError(`Solo puedes elegir hasta ${rules.max} XFactor${rules.max > 1 ? 'es' : ''}.`);
                setTimeout(() => setError(''), 2500);
            }
        }
    };

    const total = selectedMembership?.price +
        selectedXFactors.reduce((sum, xf) => {
            const item = xFactors.find(x => x.name === xf);
            return sum + (item ? item.price : 0);
        }, 0);

    const handlePurchase = async () => {
        if (!selectedMembership) {
            toast.error("Por favor selecciona una membresía");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/v1/memberships/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    membershipType: selectedMembership.name
                })
            });

            if (!response.ok) {
                throw new Error('Error al procesar la compra');
            }

            const data = await response.json();
            toast.success("¡Compra realizada con éxito!");
            onSuccess(data);
        } catch (error) {
            console.error('Error en la compra:', error);
            toast.error(error.message || "Error al procesar la compra");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedMembership(null);
        setSelectedXFactors([]);
        setInvoiceUrl(null);
        setError('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-300 py-12">
            <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full">
                <h1 className="text-3xl font-extrabold text-center mb-6 text-slate-800">
                    Selecciona tu Membresía
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {memberships.map((membership) => (
                        <div
                            key={membership.name}
                            className={`p-6 rounded-lg cursor-pointer transition-all ${
                                selectedMembership?.name === membership.name
                                    ? "ring-2 ring-yellow-500 bg-gradient-to-r " + membership.color
                                    : "bg-white hover:shadow-lg"
                            }`}
                            onClick={() => handleMembershipChange(membership)}
                        >
                            <h3 className="text-xl font-bold mb-2">{membership.name}</h3>
                            <p className="text-2xl font-bold mb-2">${membership.price}</p>
                            <p className="text-sm text-gray-600">{membership.desc}</p>
                        </div>
                    ))}
                </div>

                {/* XFactors con validaciones */}
                <h3 className="mt-4 mb-2 font-semibold text-slate-700">XFactors Opcionales</h3>
                {allowedXFactors.length === 0 ? (
                    <div className="text-gray-400 text-sm mb-2">
                        No disponible para la membresía seleccionada.
                    </div>
                ) : (
                    <div className="flex gap-2 mb-2">
                        {allowedXFactors.map(xf => (
                            <label key={xf.name}
                                   className={`flex-1 cursor-pointer rounded-2xl px-3 py-2 text-center border-2 shadow-sm
                                    ${selectedXFactors.includes(xf.name)
                                       ? 'bg-gradient-to-br from-green-400 to-green-600 border-transparent text-white scale-105'
                                       : 'bg-white border-slate-200 text-slate-800 hover:scale-105 transition-transform'
                                   }
                                    transition-all duration-200`}
                            >
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    value={xf.name}
                                    checked={selectedXFactors.includes(xf.name)}
                                    onChange={() => handleXFactorChange(xf.name)}
                                />
                                <div className="font-bold">{xf.name}</div>
                                <div className="text-xs font-light">${xf.price}</div>
                                <div className="text-[11px] mt-1">{xf.desc}</div>
                            </label>
                        ))}
                    </div>
                )}

                <div className="mt-4 flex justify-between items-center">
                    <span className="font-semibold text-lg">Total:</span>
                    <span className="text-2xl font-bold text-green-700">${total}</span>
                </div>

                {error && (
                    <div className="mt-2 text-red-500 text-sm text-center">{error}</div>
                )}

                <button
                    onClick={handlePurchase}
                    disabled={!selectedMembership || loading}
                    className={`col-span-full mt-4 bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 disabled:opacity-50 ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                    {loading ? "Procesando..." : "Comprar Membresía"}
                </button>

                {invoiceUrl && (
                    <a
                        href={invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-6 text-green-700 font-bold underline text-center"
                        onClick={resetForm}
                    >
                        Ir a pagar con QR (NOWPayments)
                    </a>
                )}
            </div>
        </div>
    );
}
