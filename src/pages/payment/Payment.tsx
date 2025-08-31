import React, { useState, useEffect, useContext } from 'react';
// import toast, { Toaster } from 'react-hot-toast';
import {
    DollarSign,
    Download,
    Eye,
    AlertCircle,
    Clock,
    Banknote,
    CheckCircle,
    X,
    Send,
    Wallet,
    Edit,
    Loader2,
} from "lucide-react";
import { AuthContext } from '../../context/AuthContext';
// import { fetchWithdrawalsByUserId } from '../../services/withdrawalsService';
import userService from '../../services/userService';
import preloadService from '../../services/preloadService';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../../hooks';

// Validación TRON address igual que Onboarding.jsx
function isValidTRC20Address(address) {
    const tronAddressRegex = /^T[A-Za-z1-9]{33}$/;
    return tronAddressRegex.test(address);
}

const Payment = () => {
    const { token, user } = useContext(AuthContext);
    const [commissionData, setCommissionData] = useState([]);
    const [error, setError] = useState<any>(null);

    const { getCurrentUserPayments } = useTransactions();

    useEffect(() => {
        if (token) {
            getPayments();
        }
    }, [token]);

    const getPayments = async () => {
        try {
            const payments = await getCurrentUserPayments();
            setCommissionData(payments.data);
        } catch (error) {
            console.error("Error fetching deposits:", error);
        }
    };

    const translateCommissionType = (type: string) => {
        switch (type) {
            case "MEMBERSHIP_ACQUIRED":
                return "Membresía adquirida";
            default:
                return type;
        }
    };

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-zinc-100">
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-slate-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-zinc-100 overflow-y-auto">
            {/* <Toaster position="top-right" /> */}
            <div className="px-6 py-5">
                <div className="border-b border-zinc-200 pb-4 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
                        <h1 className="text-indigo-950 text-3xl font-bold flex-shrink-0">Mis pagos</h1>
                    </div>
                </div>

                <div className="bg-white rounded-[5px] shadow-[0_8px_24px_rgba(0,0,0,0.07)] border border-zinc-200">
                    <div className="p-5 border-b border-zinc-200">
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">Historial de pagos</h3>
                        <p className="text-base text-gray-800">
                            {commissionData.length > 0
                                ? `Mostrando 1-${commissionData.length} de ${commissionData.length} pagos`
                                : 'Aún no tienes pagos registradas'}
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full table-fixed">
                            <thead>
                                <tr style={{ backgroundColor: '#D6D1E6' }}>
                                    <th className="w-1/4 px-4 py-3 text-center text-xs font-semibold" style={{ color: '#2B2755' }}>ID</th>
                                    <th className="w-1/4 px-4 py-3 text-center text-xs font-semibold" style={{ color: '#2B2755' }}>Monto</th>
                                    <th className="w-1/4 px-4 py-3 text-center text-xs font-semibold" style={{ color: '#2B2755' }}>Saldo antes</th>
                                    <th className="w-1/4 px-4 py-3 text-center text-xs font-semibold" style={{ color: '#2B2755' }}>Saldo después</th>
                                    <th className="w-1/4 px-4 py-3 text-center text-xs font-semibold" style={{ color: '#2B2755' }}>Tipo de compra</th>
                                    <th className="w-1/4 px-4 py-3 text-center text-xs font-semibold" style={{ color: '#2B2755' }}>Creado</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {(!commissionData || commissionData.length === 0) && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-gray-400">
                                            <div className="flex flex-col items-center">
                                                <DollarSign className="w-12 h-12 text-gray-300 mb-2" />
                                                <p>Aún no tienes depósitos registradas</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {commissionData && commissionData.map((commission: any, index: number) => (
                                    <tr key={`${commission.level}-${commission.purchaser?.uId}-${commission.createdAt}-${index}`} className="hover:bg-gray-50">
                                        <td className="w-1/6 px-4 py-3 text-sm text-center">
                                            <span className="inline-flex items-center justify-center min-w-[32px] h-7 px-2 rounded-full text-xs font-semibold border bg-gray-100 text-gray-700">
                                                {commission._id}
                                            </span>
                                        </td>
                                        <td className="w-1/6 px-4 py-3 text-sm font-semibold text-gray-800 text-center">
                                            {parseFloat(commission.amount.$numberDecimal).toLocaleString('es-ES', {
                                                style: 'currency',
                                                currency: 'USD'
                                            })}
                                        </td>
                                        <td className="w-1/6 px-4 py-3 text-sm text-gray-600 text-center">
                                            {parseFloat(commission.balance_before.$numberDecimal).toLocaleString('es-ES', {
                                                style: 'currency',
                                                currency: 'USD'
                                            })}
                                        </td>
                                        <td className="w-1/6 px-4 py-3 text-sm text-gray-600 text-center">
                                            {parseFloat(commission.balance_after.$numberDecimal).toLocaleString('es-ES', {
                                                style: 'currency',
                                                currency: 'USD'
                                            })}
                                        </td>
                                        <td className="w-1/6 px-4 py-3 text-sm text-gray-600 text-center">
                                            {translateCommissionType(commission.type)}
                                        </td>
                                        <td className="w-1/6 px-4 py-3 text-sm text-gray-600 text-center">
                                            {commission.createdAt ? new Date(commission.createdAt).toLocaleString('es-ES', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit'
                                            }) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;