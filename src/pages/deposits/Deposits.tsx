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

const getNormalizedStatus = (commission) => {
    const status = String(commission.status || commission._status || '').toLowerCase();
    const paymentStatus = String(commission.pyment_status || '').toLowerCase();

    if (['waiting', 'pendiente', 'pending'].includes(paymentStatus) || ['waiting', 'pendiente', 'pending'].includes(status)) {
        return 'pending';
    }
    if (['pagado', 'finished', 'paid', 'confirmed'].includes(status)) {
        return 'paid';
    }
    if (['fallido', 'failed', 'expired'].includes(status)) {
        return 'failed';
    }
    if (status === 'approved') {
        return 'approved';
    }
    return status;
};

const translatePurchaseType = (type) => {
    const translations = {
        'Membership': 'Membresía',
        'XFactor': 'XFactor'
    };
    return translations[type] || type;
};

// Función para validar dirección TRC20 (debe empezar con T y tener 34 caracteres)
// Validación TRON address igual que Onboarding.jsx
function isValidTRC20Address(address) {
    const tronAddressRegex = /^T[A-Za-z1-9]{33}$/;
    return tronAddressRegex.test(address);
}

// Formatear monto como 'USD $245.07' (código antes del símbolo, dos decimales)
const formatCurrencyUSD = (amount) => {
    const formatted = Number(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return `USD $${formatted}`;
};

const Deposits = () => {
    const { token, user } = useContext(AuthContext);
    const [commissionData, setCommissionData] = useState([]);
    const [error, setError] = useState<any>(null);

    const [withdrawalOpen, setWithdrawalOpen] = useState(false);
    const [address, setAddress] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [withdrawalError, setWithdrawalError] = useState("");
    const [withdrawalSuccess, setWithdrawalSuccess] = useState("");

    // Estado para manejar el error de dirección no coincidente y el flujo de actualización
    const [showWalletMismatchError, setShowWalletMismatchError] = useState(false);
    const [walletMismatchMessage, setWalletMismatchMessage] = useState("");

    // Estados para el flujo de actualización de wallet
    const [walletUpdateStep, setWalletUpdateStep] = useState('error'); // 'error', 'request-otp', 'verify-otp', 'update-wallet'
    const [otpMessage, setOtpMessage] = useState("");
    const [otpValue, setOtpValue] = useState("");
    const [otpError, setOtpError] = useState("");
    const [walletUpdateError, setWalletUpdateError] = useState("");

    const [userWallet, setUserWallet] = useState('');

    // NUEVO: Estado para mostrar el modal de "debes registrar wallet"
    const [showNoWalletModal, setShowNoWalletModal] = useState(false);

    const { getCurrentUserDeposits } = useTransactions();

    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            getDeposits();
        }
    }, [token]);

    const getDeposits = async () => {
        try {
            const deposits = await getCurrentUserDeposits();
            setCommissionData(deposits.data.deposits);
        } catch (error) {
            console.error("Error fetching deposits:", error);
        }
    };

    // Redirección automática si no hay wallet
    useEffect(() => {
        setUserWallet('12312313');
    }, [userWallet, navigate]);

    const handleAddressChange = (e) => {
        const value = e.target.value;
        setAddress(value);
        setWithdrawalError("");
    };

    // Función para cancelar y resetear todo el flujo
    const handleCancelWalletUpdate = () => {
        setShowWalletMismatchError(false);
        setWalletMismatchMessage("");
        setWithdrawalOpen(false);
        setAddress("");
        setWithdrawalError("");
        setWithdrawalSuccess("");
        setWalletUpdateStep('error');
        setOtpMessage("");
        setOtpValue("");
        setOtpError("");
        setWalletUpdateError("");
        setIsSubmitting(false);
    };

    // Función para verificar OTP (Paso 2)
    const handleVerifyOtp = async () => {
        setOtpError("");
        setWalletUpdateError("");
        setIsSubmitting(true);

        try {
            const tokenData = JSON.parse(atob(token ? token.split('.')[1] : ''));
            const userId = tokenData.id;

            await userService.verifyWalletOtp(userId, address, otpValue);

            setOtpMessage("OTP verificado correctamente. Ahora puedes actualizar tu dirección de wallet.");
            setWalletUpdateStep('update-wallet');

        } catch (error) {
            setOtpError(error.message || "Error al verificar el OTP");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Función para actualizar wallet (Paso 3)
    const handleConfirmWalletUpdate = async () => {
        setWalletUpdateError("");
        setIsSubmitting(true);

        try {
            const tokenData = JSON.parse(atob(token ? token.split('.')[1] : ''));
            const userId = tokenData.id;

            await userService.updateWalletAddress(userId, address);

            if (window.toast && window.toast.success) {
                window.toast.success('¡Dirección de wallet actualizada correctamente!', { duration: 5000 });
            }
            handleCancelWalletUpdate();

        } catch (error) {
            setWalletUpdateError(error.message || "Error al actualizar la dirección de wallet");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Iniciar el flujo de actualización de wallet
    const handleStartWalletUpdate = async () => {
        setOtpError("");
        setWalletUpdateError("");
        setOtpMessage("");
        setIsSubmitting(true);
        // Si la dirección es válida, solicita OTP y pasa directo a 'verify-otp'
        if (!address || !isValidTRC20Address(address)) {
            setOtpError("Debes ingresar una dirección UNI2CHAIN válida antes de solicitar el OTP.");
            setIsSubmitting(false);
            return;
        }
        try {
            const tokenData = JSON.parse(atob(token ? token.split('.')[1] : ''));
            const userId = tokenData.id;
            await userService.requestWalletOtp(userId, address);
            setOtpMessage("Se ha enviado un código de verificación (OTP) a tu correo electrónico. Ingresa el código para continuar.");
            setWalletUpdateStep('verify-otp');
        } catch (error) {
            setOtpError(error.message || "Error al solicitar OTP");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Cambiar handleWithdrawalSubmit para que use address, no userWallet
    const handleWithdrawalSubmit = async () => {
        const errors: any = {};
        // Usar siempre la dirección ingresada manualmente
        const walletToUse = address.trim();
        if (!walletToUse) {
            errors.address = "La dirección de wallet es requerida.";
        } else if (!isValidTRC20Address(walletToUse)) {
            errors.address = "La dirección de wallet debe ser una dirección UNI2CHAIN válida (34 caracteres, empieza con T).";
        }
        if (Object.keys(errors).length === 0) {
            setWithdrawalError("");
            setIsSubmitting(true);
            try {
                console.log('Enviando datos de retiro:', { amount, address: walletToUse });
                setWithdrawalOpen(false);
                setAddress("");
                if (window.toast && window.toast.success) {
                    window.toast.success('Solicitud de retiro enviada correctamente.', { duration: 5000 });
                }
                if (token) {
                    const tokenData = JSON.parse(atob(token.split('.')[1]));
                    const userId = tokenData.id;
                    const commissionCacheKey = `commission_${userId}`;
                    preloadService.cache.delete(commissionCacheKey);
                }
            } catch (err) {
                console.error('Error en retiro:', err);

                // Verificar si el error es por dirección no coincidente
                const errorMessage = err.message || '';
                if (errorMessage.includes('La dirección UNI2CHAIN ingresada no coincide con la registrada en tu perfil')) {
                    setShowWalletMismatchError(true);
                    setWalletMismatchMessage(errorMessage);
                    setWalletUpdateStep('error');
                } else {
                    setWithdrawalError("");
                    setWithdrawalOpen(false);
                    if (window.toast && window.toast.error) {
                        window.toast.error(errorMessage || 'Error al procesar la solicitud de retiro.', { duration: 10000 });
                    }
                }
            } finally {
                setIsSubmitting(false);
            }
        } else {
            const errorMessages = Object.values(errors).filter(Boolean);
            if (errorMessages.length > 0) {
                setWithdrawalError("");
                setWithdrawalOpen(false);
                if (window.toast && window.toast.error) {
                    window.toast.error(errorMessages[0], { duration: 5000 });
                }
            }
        }
    };

    // Función para renderizar el contenido del modal según el paso
    const renderModalContent = () => {
        switch (walletUpdateStep) {
            case 'error':
                return (
                    <>
                        {/* Header */}
                        <div className="w-full p-2.5 border-b flex justify-between items-start">
                            <div className="flex flex-col gap-[5px]">
                                <div className="text-red-600 text-xl font-bold flex items-center gap-2">
                                    Dirección no válida
                                </div>
                                <div className="text-zinc-800 text-sm font-normal">
                                    La dirección ingresada no coincide con tu wallet registrado
                                </div>
                            </div>
                            <button
                                onClick={handleCancelWalletUpdate}
                                className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-800"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Contenido del error */}
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <div className="mt-4">
                                    {/* Icono de alerta grande */}
                                    <div className="flex justify-center mb-6">
                                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                            <AlertCircle className="w-8 h-8 text-red-600" />
                                        </div>
                                    </div>

                                    {/* Mensaje de error */}
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                        <div className="text-red-800 text-sm leading-relaxed">
                                            {walletMismatchMessage}
                                        </div>
                                    </div>

                                    {/* Información adicional */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                        <div className="flex items-start gap-3">
                                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <span className="text-white text-xs font-bold">i</span>
                                            </div>
                                            <div className="text-blue-800 text-sm">
                                                <div className="font-semibold mb-1">¿Qué puedes hacer?</div>
                                                <ul className="space-y-1 text-xs">
                                                    <li>• Actualizar tu dirección UNI2CHAIN registrada en tu perfil.</li>
                                                    <li>• Usar la dirección UNI2CHAIN que ya tienes registrada.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botones de acción */}
                                    <div className="pt-8 flex gap-4 mt-6">
                                        <button
                                            onClick={handleCancelWalletUpdate}
                                            className="w-32 px-4 py-3 bg-gray-200 text-gray-700 rounded-md text-sm flex items-center justify-center gap-2 hover:bg-gray-300 border border-gray-300 font-medium"
                                        >
                                            <X className="w-4 h-4" />
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleStartWalletUpdate}
                                            className="flex-1 px-4 py-3 text-white rounded-md text-sm flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{ backgroundColor: '#5348F5' }}
                                            onMouseEnter={(e: any) => {
                                                if (!isSubmitting) e.target.style.backgroundColor = '#4A3FD4';
                                            }}
                                            onMouseLeave={(e: any) => {
                                                if (!isSubmitting) e.target.style.backgroundColor = '#5348F5';
                                            }}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Enviando...
                                                </>
                                            ) : (
                                                <>
                                                    <Edit className="w-4 h-4" />
                                                    Actualizar mi dirección
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                );

            case 'request-otp':
                // Este paso ya no se usará desde el flujo de error, pero lo dejamos para el flujo normal si se requiere en el futuro
                return null;

            case 'verify-otp':
                return (
                    <>
                        {/* Header */}
                        <div className="w-full p-2.5 border-b flex justify-between items-start">
                            <div className="flex flex-col gap-[5px]">
                                <div className="text-zinc-800 text-xl font-bold">
                                    Verificar código OTP
                                </div>
                                <div className="text-zinc-800 text-sm font-normal">
                                    Ingresa el código de 6 dígitos enviado a tu correo
                                </div>
                            </div>
                            <button
                                onClick={handleCancelWalletUpdate}
                                className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-800"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Contenido de verificación OTP */}
                        <div className="flex-1 flex flex-col">
                            <div className="mt-4">
                                {/* Mensaje de éxito */}
                                {otpMessage && (
                                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="text-green-700 text-sm font-medium">{otpMessage}</div>
                                    </div>
                                )}

                                {/* Campo de OTP */}
                                <div className="px-2.5 py-1 border-b border-slate-300 flex flex-col gap-1.5">
                                    <div>
                                        <span className="text-zinc-800 text-sm font-normal">Código OTP</span>
                                        <span className="text-rose-500 text-sm font-normal"> *</span>
                                    </div>
                                    <input
                                        id="otpInput"
                                        type="text"
                                        maxLength={6}
                                        value={otpValue}
                                        onChange={e => setOtpValue(e.target.value.replace(/\D/g, ''))}
                                        className="w-full text-zinc-800 text-lg font-medium outline-none bg-transparent text-center tracking-widest"
                                        placeholder="000000"
                                        disabled={isSubmitting}
                                    />
                                    {otpValue.length > 0 && otpValue.length !== 6 && (
                                        <div className="text-rose-500 text-xs mt-1">El código debe tener 6 dígitos.</div>
                                    )}
                                </div>

                                {/* Mensajes de error */}
                                {otpError && (
                                    <div className="mt-4 text-red-600 text-sm">{otpError}</div>
                                )}

                                {/* Botones de acción */}
                                <div className="pt-8 flex gap-4 mt-6">
                                    <button
                                        onClick={handleCancelWalletUpdate}
                                        className="w-32 px-4 py-3 bg-gray-200 text-gray-700 rounded-md text-sm flex items-center justify-center gap-2 hover:bg-gray-300 border border-gray-300 font-medium"
                                    >
                                        <X className="w-4 h-4" />
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleVerifyOtp}
                                        className="flex-1 px-4 py-3 text-white rounded-md text-sm flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ backgroundColor: '#5348F5' }}
                                        onMouseEnter={(e: any) => {
                                            if (!isSubmitting && otpValue.length === 6) {
                                                e.target.style.backgroundColor = '#4A3FD4';
                                            }
                                        }}
                                        onMouseLeave={(e: any) => {
                                            if (!isSubmitting && otpValue.length === 6) {
                                                e.target.style.backgroundColor = '#5348F5';
                                            }
                                        }}
                                        disabled={isSubmitting || otpValue.length !== 6}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Verificando...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                Verificar código
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                );

            case 'update-wallet':
                return (
                    <>
                        {/* Header */}
                        <div className="w-full p-2.5 border-b flex justify-between items-start">
                            <div className="flex flex-col gap-[5px]">
                                <div className="text-green-600 text-xl font-bold">
                                    Código verificado correctamente
                                </div>
                                <div className="text-zinc-800 text-sm font-normal">
                                    Confirma la actualización de tu dirección de wallet
                                </div>
                            </div>
                            <button
                                onClick={handleCancelWalletUpdate}
                                className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-800"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Contenido de confirmación */}
                        <div className="flex-1 flex flex-col">
                            <div className="mt-4">
                                {/* Mensaje de éxito del OTP */}
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="text-green-700 text-sm font-medium">{otpMessage}</div>
                                </div>

                                {/* Input editable para la dirección a actualizar, igual que los otros campos de formulario */}
                                <div className="px-2.5 py-1 border-b border-slate-300 flex flex-col gap-1.5 mb-6">
                                    <div>
                                        <span className="text-zinc-800 text-sm font-normal">Dirección UNI2CHAIN (USDT/TRC20)</span>
                                        <span className="text-rose-500 text-sm font-normal"> *</span>
                                    </div>
                                    <input
                                        id="address-update"
                                        type="text"
                                        placeholder="Ej: TQ2...9Xk (34 caracteres)"
                                        value={address}
                                        onChange={handleAddressChange}
                                        className="w-full text-zinc-800 text-lg font-medium outline-none bg-transparent"
                                        maxLength={34}
                                        disabled={isSubmitting}
                                    />
                                    {/* Validación en tiempo real */}
                                    {address && !isValidTRC20Address(address) && (
                                        <div className="text-red-600 text-xs mt-1">
                                            Por favor ingresa una dirección UNI2CHAIN válida (debe empezar con "T" y tener 34 caracteres).
                                        </div>
                                    )}
                                </div>

                                {/* Mensajes de error */}
                                {walletUpdateError && (
                                    <div className="mt-4 text-red-600 text-sm">{walletUpdateError}</div>
                                )}

                                {/* Botones de acción */}
                                <div className="pt-8 flex gap-4 mt-6">
                                    <button
                                        onClick={handleCancelWalletUpdate}
                                        className="w-32 px-4 py-3 bg-gray-200 text-gray-700 rounded-md text-sm flex items-center justify-center gap-2 hover:bg-gray-300 border border-gray-300 font-medium"
                                    >
                                        <X className="w-4 h-4" />
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleConfirmWalletUpdate}
                                        className="flex-1 px-4 py-3 text-white rounded-md text-sm flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ backgroundColor: '#5348F5' }}
                                        onMouseEnter={(e: any) => {
                                            if (!isSubmitting) {
                                                e.target.style.backgroundColor = '#4A3FD4';
                                            }
                                        }}
                                        onMouseLeave={(e: any) => {
                                            if (!isSubmitting) {
                                                e.target.style.backgroundColor = '#5348F5';
                                            }
                                        }}
                                        disabled={isSubmitting || !isValidTRC20Address(address)}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Actualizando...
                                            </>
                                        ) : (
                                            <>
                                                <Wallet className="w-4 h-4" />
                                                Confirmar actualización
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                );

            case 'success':
                return null;

            default:
                return null;
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
                        <h1 className="text-indigo-950 text-3xl font-bold flex-shrink-0">Depósitos</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* <div className="p-5 bg-white rounded-[5px] shadow-[0_8px_24px_rgba(0,0,0,0.07)] border border-zinc-200">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-zinc-800 text-base font-semibold">Total depósitos</div>
                            <DollarSign className="w-6 h-6" style={{ color: '#5348F5' }} />
                        </div>
                        <div className="text-3xl font-extrabold text-gray-900">0</div>
                        <div className="text-base text-gray-800 mt-1">Acumulado total</div>
                    </div>

                    <div className="p-5 bg-white rounded-[5px] shadow-[0_8px_24px_rgba(0,0,0,0.07)] border border-zinc-200">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-zinc-800 text-base font-semibold">Retirado</div>
                            <Download className="w-6 h-6" style={{ color: '#5348F5' }} />
                        </div>
                        <div className="text-3xl font-extrabold text-gray-900">0</div>
                        <div className="text-base text-gray-800 mt-1">Total retirado</div>
                    </div>

                    <div className="p-5 bg-white rounded-[5px] shadow-[0_8px_24px_rgba(0,0,0,0.07)] border border-zinc-200">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-zinc-800 text-base font-semibold">Disponible</div>
                            <Banknote className="w-6 h-6" style={{ color: '#5348F5' }} />
                        </div>
                        <div className="text-3xl font-extrabold text-gray-900">0</div>
                        <div className="text-base text-gray-800 mt-1">Para retiro</div>
                    </div> */}
                </div>

                <div className="mb-8 grid gap-6">
                    <div className="w-full p-6 bg-white rounded-[5px] shadow-[0_8px_24px_rgba(0,0,0,0.07)] border border-zinc-200 flex flex-col justify-between h-full">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0 bg-green-100">
                                <Banknote className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-xl">Solicitar depósito</h3>
                                <p className="text-base text-gray-800">Solicita un depósito para operar dentro de la aplicacion.</p>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                            <button onClick={() => {
                                setAddress("");
                                if (userWallet != '') {
                                    setShowNoWalletModal(true); // Mostrar modal especial si no hay wallet
                                } else {
                                    setWithdrawalOpen(true); // Modal normal si hay wallet
                                }
                            }} className="px-6 py-2 text-white rounded-[5px] text-sm flex items-center justify-center gap-2 sm:w-auto w-full mt-2 text-center"
                                style={{ backgroundColor: '#5348F5' }}
                                onMouseEnter={(e: any) => e.target.style.backgroundColor = '#4A3FD4'}
                                onMouseLeave={(e: any) => e.target.style.backgroundColor = '#5348F5'}>
                                <Download className="w-4 h-4" />
                                Solicitar depósito
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal de retiro normal */}
                {withdrawalOpen && !showWalletMismatchError && userWallet && (
                    <>
                        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => { setWithdrawalOpen(false); setWithdrawalError(""); setWithdrawalSuccess(""); }} aria-hidden="true" />
                        <div className="fixed top-0 right-0 h-full w-[452px] bg-white shadow-2xl z-50 flex flex-col overflow-y-auto">
                            <div className="px-5 py-5 flex flex-col gap-2.5 h-full">
                                {/* Header */}
                                <div className="w-full p-2.5 border-b flex justify-between items-start">
                                    <div className="flex flex-col gap-[5px]">
                                        <div className="text-zinc-800 text-xl font-bold">
                                            Solicitud de depósitos
                                        </div>
                                        <div className="text-zinc-800 text-sm font-normal">
                                            Ingresa el monto y hash de UNI2CHAIN para verificar la transaccioón, el sistema lo hará automáticamente.
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setWithdrawalOpen(false); setWithdrawalError(""); setWithdrawalSuccess(""); }}
                                        className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-800"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                {/* Formulario siempre editable para dirección de wallet */}
                                <form onSubmit={(e) => { e.preventDefault(); handleWithdrawalSubmit(); }} className="w-full flex flex-col gap-2.5 mt-2" noValidate>
                                    {/* Monto a retirar */}
                                    <div className="px-2.5 py-1 border-b border-slate-300 flex flex-col gap-1.5">
                                        <div>
                                            <span className="text-zinc-800 text-sm font-normal">Monto a depositar</span>
                                            <span className="text-rose-500 text-sm font-normal"> *</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                id="amount"
                                                type="number"
                                                placeholder="0.00"
                                                className="w-full text-zinc-800 text-lg font-medium outline-none bg-white"
                                                style={{ backgroundColor: '#fff' }}
                                            />
                                        </div>
                                    </div>
                                    {/* Dirección TRC20 */}
                                    <div className="mt-4 px-2.5 py-1 border-b border-slate-300 flex flex-col gap-1.5">
                                        <div>
                                            <span className="text-zinc-800 text-sm font-normal">Dirección UNI2CHAIN (USDT/TRC20)</span>
                                            <span className="text-rose-500 text-sm font-normal"> *</span>
                                        </div>
                                        <input
                                            id="address"
                                            type="text"
                                            placeholder="Ej: TQ2...9Xk (34 caracteres)"
                                            value={address}
                                            onChange={handleAddressChange}
                                            className="w-full text-zinc-800 text-lg font-medium outline-none bg-transparent"
                                            maxLength={34}
                                        />
                                        {/* Validación en tiempo real */}
                                        {address && !isValidTRC20Address(address) && (
                                            <div className="text-red-600 text-xs mt-1">
                                                Por favor ingresa una dirección UNI2CHAIN válida (debe empezar con "T" y tener 34 caracteres).
                                            </div>
                                        )}
                                    </div>
                                    {/* Mensaje de error o éxito inline */}
                                    {(withdrawalError || withdrawalSuccess) && (
                                        <div className={`mt-2 text-sm ${withdrawalError ? 'text-red-600' : 'text-green-600'}`}>{withdrawalError || withdrawalSuccess}</div>
                                    )}
                                    {/* Botones de acción al final */}
                                    <div className="pt-8 flex gap-4 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => { setWithdrawalOpen(false); setWithdrawalError(""); setWithdrawalSuccess(""); }}
                                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 border border-gray-400 flex items-center justify-center gap-2"
                                        >
                                            <X className="w-4 h-4" /> Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !address.trim()}
                                            className="flex-1 px-4 py-2 text-white rounded-md text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                            style={{
                                                backgroundColor: (isSubmitting || !address.trim()) ? '#9CA3AF' : '#5348F5'
                                            }}
                                            onMouseEnter={(e: any) => {
                                                if (isSubmitting || !address.trim()) return;
                                                e.target.style.backgroundColor = '#4A3FD4';
                                            }}
                                            onMouseLeave={(e: any) => {
                                                if (isSubmitting || !address.trim()) return;
                                                e.target.style.backgroundColor = '#5348F5';
                                            }}
                                        >
                                            <Send className="w-4 h-4" />
                                            {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </>
                )}

                {/* Modal unificado para error de wallet y actualización */}
                {(showWalletMismatchError || showNoWalletModal) && (
                    <>
                        <div className="fixed inset-0 bg-black/50 z-40" onClick={handleCancelWalletUpdate} aria-hidden="true" />
                        <div className="fixed top-0 right-0 h-full w-[452px] bg-white shadow-2xl z-50 flex flex-col overflow-y-auto">
                            <div className="px-5 py-5 flex flex-col gap-2.5 h-full">
                                {/* Contenido del modal */}
                                {showNoWalletModal ? (
                                    <>
                                        {/* Header */}
                                        <div className="w-full p-2.5 border-b flex justify-between items-start">
                                            <div className="flex flex-col gap-[5px]">
                                                <div className="text-red-600 text-xl font-bold flex items-center gap-2">
                                                    Wallet no registrada
                                                </div>
                                                <div className="text-zinc-800 text-sm font-normal">
                                                    Debes registrar una wallet UNI2CHAIN (USDT/TRC20) antes de poder solicitar un retiro.
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setShowNoWalletModal(false)}
                                                className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-800"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {/* Mensaje y acción */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div className="mt-4">
                                                <div className="flex justify-center mb-6">
                                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                                        <AlertCircle className="w-8 h-8 text-red-600" />
                                                    </div>
                                                </div>
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                                    <div className="text-blue-800 text-sm">
                                                        Para poder depósitar, primero debes registrar una wallet UNI2CHAIN en tu perfil.
                                                    </div>
                                                </div>
                                                <div className="pt-8 flex gap-4 mt-6">
                                                    <button
                                                        onClick={() => setShowNoWalletModal(false)}
                                                        className="w-32 px-4 py-3 bg-gray-200 text-gray-700 rounded-md text-sm flex items-center justify-center gap-2 hover:bg-gray-300 border border-gray-300 font-medium"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        onClick={() => navigate('/home')}
                                                        className="flex-1 px-4 py-3 text-white rounded-md text-sm flex items-center justify-center gap-2 font-medium transition-colors"
                                                        style={{ backgroundColor: '#5348F5' }}
                                                        onMouseEnter={(e: any) => e.target.style.backgroundColor = '#4A3FD4'}
                                                        onMouseLeave={(e: any) => e.target.style.backgroundColor = '#5348F5'}
                                                    >
                                                        <Wallet className="w-4 h-4" />
                                                        Ir a registrar wallet
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    renderModalContent()
                                )}
                            </div>
                        </div>
                    </>
                )}

                <div className="bg-white rounded-[5px] shadow-[0_8px_24px_rgba(0,0,0,0.07)] border border-zinc-200">
                    <div className="p-5 border-b border-zinc-200">
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">Historial de depósitos</h3>
                        <p className="text-base text-gray-800">
                            {commissionData.length > 0
                                ? `Mostrando 1-${commissionData.length} de ${commissionData.length} depósitos`
                                : 'Aún no tienes depósitos registradas'}
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full table-fixed">
                            <thead>
                                <tr style={{ backgroundColor: '#D6D1E6' }}>
                                    <th className="w-1/4 px-4 py-3 text-center text-xs font-semibold" style={{ color: '#2B2755' }}>ID</th>
                                    <th className="w-1/4 px-4 py-3 text-center text-xs font-semibold" style={{ color: '#2B2755' }}>Estado</th>
                                    <th className="w-1/4 px-4 py-3 text-center text-xs font-semibold" style={{ color: '#2B2755' }}>Número de Bloque</th>
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
                                            {commission.status}
                                        </td>
                                        <td className="w-1/6 px-4 py-3 text-sm text-gray-600 text-center">
                                            {commission.current_block_number}
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

export default Deposits;