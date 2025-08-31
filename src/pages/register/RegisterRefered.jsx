import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Stepper, Step, StepLabel, StepContent } from '@mui/material';
import { Eye, EyeOff, ArrowLeft, Loader2, ChevronDown, ArrowRight, CreditCard, Check } from 'lucide-react';
import logoClassic from "../../assets/Classic_badge.svg";
import logoPremium from "../../assets/Premium_badge.svg";
import logoWealth from "../../assets/Wealth_badge.svg";
import registerService from '../../services/registerService';
import { useForm } from 'react-hook-form';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { AuthContext } from '../../context/AuthContext.tsx'

// Precios y duración de cada plan
const PLANES = {
    CLASSIC: { price: 249, months: 3, label: 'CLASSIC' },
    PREMIUM: { price: 699, months: 6, label: 'PREMIUM' },
    WEALTH: { price: 1297, months: 12, label: 'WEALTH' },
};

// Lista de países con sus códigos ISO
const COUNTRIES = [
    { name: "Afganistán", code: "AF" },
    { name: "Albania", code: "AL" },
    { name: "Alemania", code: "DE" },
    { name: "Andorra", code: "AD" },
    { name: "Angola", code: "AO" },
    { name: "Argentina", code: "AR" },
    { name: "Australia", code: "AU" },
    { name: "Austria", code: "AT" },
    { name: "Bélgica", code: "BE" },
    { name: "Bolivia", code: "BO" },
    { name: "Brasil", code: "BR" },
    { name: "Canadá", code: "CA" },
    { name: "Chile", code: "CL" },
    { name: "China", code: "CN" },
    { name: "Colombia", code: "CO" },
    { name: "Costa Rica", code: "CR" },
    { name: "Cuba", code: "CU" },
    { name: "Ecuador", code: "EC" },
    { name: "El Salvador", code: "SV" },
    { name: "España", code: "ES" },
    { name: "Estados Unidos", code: "US" },
    { name: "Francia", code: "FR" },
    { name: "Guatemala", code: "GT" },
    { name: "Honduras", code: "HN" },
    { name: "Italia", code: "IT" },
    { name: "México", code: "MX" },
    { name: "Nicaragua", code: "NI" },
    { name: "Panamá", code: "PA" },
    { name: "Paraguay", code: "PY" },
    { name: "Perú", code: "PE" },
    { name: "Portugal", code: "PT" },
    { name: "Reino Unido", code: "GB" },
    { name: "República Dominicana", code: "DO" },
    { name: "Uruguay", code: "UY" },
    { name: "Venezuela", code: "VE" }
].sort((a, b) => a.name.localeCompare(b.name));

export default function RegisterRefered() {
    console.log('[DEBUG] Componente RegisterRefered iniciado');
    
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedPlan, setSelectedPlan] = useState('CLASSIC');
    const [showCoupon, setShowCoupon] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [paymentId, setPaymentId] = useState(null);
    const [paymentData, setPaymentData] = useState(null);
    const [iframeError, setIframeError] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        countryCode: '',
        birthDate: '',
        city: '',
        country: '',
        refered: ''
    });
    const [loading, setLoading] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const { login: authLogin } = React.useContext(AuthContext);
    const params = useParams();
    const [searchParams] = useSearchParams();
    const [referedName, setReferedName] = useState('');

    // Extraer código de referido de la URL
    const referedCodeFromUrl = params.uId || searchParams.get('referral') || searchParams.get('ref') || '';
    
    useEffect(() => {
        if (referedCodeFromUrl) {
            setFormData(prev => ({
                ...prev,
                refered: referedCodeFromUrl
            }));
        }
    }, [referedCodeFromUrl, params.uId]);

    useEffect(() => {
        const checkPaymentStatus = async () => {
            if (paymentId) {
                try {
                    const data = await registerService.getPaymentStatus(paymentId);
                    setPaymentData(data.data);
                    if (data.success && (data.data.payment_status === 'confirmed' || data.data.payment_status === 'finished')) {
                        window.toast?.success('¡Pago confirmado!');
                        navigate('/login');
                    }
                } catch (error) {
                    console.error('Error checking payment status:', error);
                }
            }
        };

        const interval = setInterval(checkPaymentStatus, 5000);
        return () => clearInterval(interval);
    }, [paymentId, navigate]);

    useEffect(() => {
        if (referedCodeFromUrl) {
            registerService.getReferedName(referedCodeFromUrl)
                .then(data => {
                    if (data.name) setReferedName(data.name);
                    else setReferedName('');
                });
        }
    }, [referedCodeFromUrl]);

    // React Hook Form para el primer paso
    const { register: rhfRegister, handleSubmit: rhfHandleSubmit, formState: { errors }, watch } = useForm({
        mode: 'onChange',
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            terms: false,
        },
    });

    // React Hook Form para el segundo paso
    const formStep2 = useForm({
        mode: 'onChange',
        defaultValues: {
            phone: '',
            countryCode: '',
            birthDate: '',
            country: '',
            city: '',
        },
    });
    const { register: rhfRegisterStep2, handleSubmit: rhfHandleSubmitStep2, formState: { errors: errorsStep2 } } = formStep2;

    // Validaciones de requisitos de contraseña
    const password = watch('password', '');

    const handlePlanSelect = (plan) => {
        setSelectedPlan(plan);
    };

    const handleCouponToggle = () => {
        setShowCoupon(!showCoupon);
        if (!showCoupon) {
            setCouponCode('');
        }
    };

    const handleCouponSubmit = () => {
        if (!couponCode.trim()) {
            window.toast?.error('Por favor ingresa un código de cupón');
            return;
        }
        window.toast?.success('Cupón aplicado correctamente');
    };

    const handlePayment = async () => {
        setLoading(true);
        try {
            const userData = {
                ...formData
            };

            // Construir objeto completo de membresía
            const membershipObj = {
                id: selectedPlan + '_id',
                name: PLANES[selectedPlan].label,
                price: PLANES[selectedPlan].price,
                durationMonths: PLANES[selectedPlan].months,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            const membershipData = {
                name: PLANES[selectedPlan].label,
                fullObject: membershipObj
            };

            const xFactorPayload = [];

            // Llamar al endpoint unificado de registro
            const result = await registerService.register(userData, membershipData, xFactorPayload);

            if (!result.success) {
                throw new Error(result.message || 'Error en el registro');
            }

            // Guardar token y loguear al usuario
            const { token, payment } = result.data;
            localStorage.setItem('token', token);
            if (typeof authLogin === 'function') {
                authLogin(token);
            }

            // Usar el ID de pago de la respuesta del registro
            setPaymentId(payment.id);
            setPaymentData(payment);
            setCurrentStep(5);
            window.toast?.success('Registro exitoso. Proceda al pago.');

        } catch (error) {
            window.toast?.error(error.message || 'Error en el proceso de registro');
        } finally {
            setLoading(false);
        }
    };

    // Cálculo dinámico de precios y meses
    const membershipPrice = PLANES[selectedPlan]?.price || 0;
    const membershipMonths = PLANES[selectedPlan]?.months || 0;
    const xFactorPrice = 0;
    const subtotal = membershipPrice + xFactorPrice;

    const steps = [
        {
            label: 'Crear cuenta',
            content: (
                <form onSubmit={rhfHandleSubmit((data) => {
                    setFormData({
                        ...formData,
                        name: data.name,
                        email: data.email,
                        password: data.password,
                        confirmPassword: data.confirmPassword,
                    });
                    setCurrentStep(2);
                })} className="max-w-xl mx-auto space-y-4">
                    <div className="space-y-2">
                        <label className="text-zinc-800 text-sm font-medium font-['Poppins']">
                            Nombre
                        </label>
                        <input
                            type="text"
                            {...rhfRegister('name', { required: 'El nombre es obligatorio' })}
                            placeholder="Ingresa tu nombre"
                            className="w-full pl-5 pr-4 py-2 bg-white rounded-md border border-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-zinc-800 text-sm font-medium font-['Poppins']">
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            {...rhfRegister('email', {
                                required: 'El correo electrónico es obligatorio',
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'Correo electrónico inválido',
                                },
                            })}
                            placeholder="Ingresa tu correo electrónico"
                            className="w-full pl-5 pr-4 py-2 bg-white rounded-md border border-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-zinc-800 text-sm font-medium font-['Poppins']">
                            Contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                {...rhfRegister('password', {
                                    required: 'La contraseña es obligatoria',
                                    validate: {
                                        minLength: v => v.length >= 6 || 'Al menos 6 caracteres',
                                        upper: v => /[A-Z]/.test(v) || 'Al menos una mayúscula',
                                        lower: v => /[a-z]/.test(v) || 'Al menos una minúscula',
                                        number: v => /[0-9]/.test(v) || 'Al menos un número',
                                        special: v => /[^A-Za-z0-9]/.test(v) || 'Al menos un carácter especial',
                                    },
                                })}
                            placeholder="Ingresa tu contraseña"
                            className="w-full pl-5 pr-10 py-2 bg-white rounded-md border border-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                            <button
                                type="button"
                                tabIndex={-1}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-zinc-800 text-sm font-medium font-['Poppins']">
                            Confirmar contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                {...rhfRegister('confirmPassword', {
                                    required: 'Confirma tu contraseña',
                                    validate: v => v === password || 'Las contraseñas no coinciden',
                                })}
                                placeholder="Confirmar contraseña"
                                className="w-full pl-5 pr-10 py-2 bg-white rounded-md border border-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword.message}</ErrorMessage>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-zinc-800 text-sm font-medium font-['Poppins']">Código de Referido</label>
                        <input
                            type="text"
                            name="refered"
                            value={formData.refered}
                            readOnly
                            className="w-full pl-5 pr-4 py-2 bg-gray-100 rounded-md border border-neutral-400 cursor-not-allowed"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            {...rhfRegister('terms', { required: 'Debes aceptar los términos y condiciones' })}
                            className="w-5 h-5 bg-white rounded border border-neutral-400"
                        />
                        <label className="text-zinc-800 text-sm font-semibold font-['Poppins']">
                            Acepto los{' '}
                            <span
                                className="text-blue-600 underline hover:text-blue-800 focus:outline-none cursor-pointer"
                                onClick={() => setShowTermsModal(true)}
                            >
                                términos y condiciones de uso
                            </span>
                        </label>
                    </div>
                    {errors.terms && <ErrorMessage>{errors.terms.message}</ErrorMessage>}

                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="w-full max-w-[400px] px-4 md:px-7 py-3 bg-blue-600 rounded-md inline-flex justify-center items-center gap-2.5 hover:bg-blue-700 transition-colors"
                            disabled={Object.keys(errors).length > 0}
                        >
                            <span className="text-white text-base font-bold font-['Poppins'] flex items-center gap-2">
                                Continuar
                                <ArrowRight className="w-4 h-4" />
                            </span>
                        </button>
                    </div>

                    <div className="text-center">
                        <span className="text-zinc-800 text-sm font-medium font-['Poppins']">
                            ¿Ya tienes una cuenta?{' '}
                            <Link 
                                to="/login" 
                                className="font-semibold text-blue-600 underline hover:text-blue-800 transition-colors"
                            >
                                Inicia sesión
                            </Link>
                        </span>
                    </div>
                </form>
            )
        },
        {
            label: 'Datos personales',
            content: (
                <form onSubmit={rhfHandleSubmitStep2((data) => {
                    setFormData({
                        ...formData,
                        phone: data.phone,
                        countryCode: data.countryCode,
                        birthDate: data.birthDate,
                        country: data.country,
                        city: data.city,
                    });
                    setCurrentStep(3);
                })} className="max-w-xl mx-auto space-y-4">
                    <div className="space-y-2">
                        <label className="text-zinc-800 text-sm font-medium font-['Poppins']">Teléfono</label>
                        <div className="flex gap-2">
                            <div className="w-24">
                                <input
                                    type="text"
                                    {...rhfRegisterStep2('countryCode', {
                                        required: 'El código de país es obligatorio',
                                        minLength: { value: 2, message: 'El código de país debe tener 2 caracteres' },
                                        maxLength: { value: 2, message: 'El código de país debe tener 2 caracteres' },
                                        pattern: { value: /^\d+$/, message: 'El código de país debe ser solo números' }
                                    })}
                                    placeholder="33"
                                    className="w-full pl-5 pr-4 py-2 bg-white rounded-md border border-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                            <input
                                type="tel"
                                {...rhfRegisterStep2('phone', { required: 'El teléfono es obligatorio', pattern: { value: /^\d+$/, message: 'Solo números' } })}
                                placeholder="Ingresa tu teléfono"
                                className="flex-1 pl-5 pr-4 py-2 bg-white rounded-md border border-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                        <div>
                            {errorsStep2.countryCode && <ErrorMessage>{errorsStep2.countryCode.message}</ErrorMessage>}
                            {errorsStep2.phone && <ErrorMessage>{errorsStep2.phone.message}</ErrorMessage>}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-zinc-800 text-sm font-medium font-['Poppins'] mb-1">Fecha de nacimiento</label>
                        <input
                            type="date"
                            {...rhfRegisterStep2('birthDate', { 
                                required: 'La fecha de nacimiento es obligatoria',
                                validate: value => {
                                    if (!value) return true;
                                    const today = new Date();
                                    const birthDate = new Date(value);
                                    let age = today.getFullYear() - birthDate.getFullYear();
                                    const m = today.getMonth() - birthDate.getMonth();
                                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                                        age--;
                                    }
                                    return age >= 18 || 'Debes ser mayor de 18 años para continuar.';
                                }
                            })}
                            className="w-full pl-5 pr-4 py-2 bg-white rounded-md border border-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        {errorsStep2.birthDate && <ErrorMessage>{errorsStep2.birthDate.message}</ErrorMessage>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-zinc-800 text-sm font-medium font-['Poppins']">País</label>
                        <select
                            {...rhfRegisterStep2('country', { required: 'Debes seleccionar un país' })}
                            className="w-full pl-5 pr-4 py-2 bg-white rounded-md border border-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">Selecciona un país</option>
                            {COUNTRIES.map((country) => (
                                <option key={country.code} value={country.code}>
                                    {country.name}
                                </option>
                            ))}
                        </select>
                        {errorsStep2.country && <ErrorMessage>{errorsStep2.country.message}</ErrorMessage>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-zinc-800 text-sm font-medium font-['Poppins']">Ciudad</label>
                        <input
                            type="text"
                            {...rhfRegisterStep2('city', { required: 'La ciudad es obligatoria' })}
                            placeholder="Ingresa tu ciudad"
                            className="w-full pl-5 pr-4 py-2 bg-white rounded-md border border-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        {errorsStep2.city && <ErrorMessage>{errorsStep2.city.message}</ErrorMessage>}
                    </div>
                    <div className="flex flex-col md:flex-row justify-center gap-4">
                        <button
                            type="submit"
                            className="w-full md:w-96 px-4 md:px-7 py-3 bg-blue-600 rounded-md inline-flex justify-center items-center gap-2.5 hover:bg-blue-700 transition-colors order-1 md:order-2"
                        >
                            <span className="text-white text-base font-bold font-['Poppins'] flex items-center gap-2">
                                Continuar
                                <ArrowRight className="w-4 h-4" />
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="w-full md:w-96 px-4 md:px-7 py-3 rounded-md inline-flex justify-center items-center gap-2.5 border border-zinc-300 bg-white hover:bg-zinc-100 transition-colors order-2 md:order-1"
                        >
                            <span className="text-zinc-800 text-sm font-medium font-['Poppins'] flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Regresar al paso anterior
                            </span>
                        </button>
                    </div>
                </form>
            )
        },
        {
            label: 'Elige tu plan',
            content: (
                <div className="max-w-5xl mx-auto space-y-6">
                    <h2 className="text-zinc-800 text-lg font-medium font-['Poppins'] text-center">
                        Selecciona tu plan de membresía
                    </h2>
                    <div className="flex flex-col md:flex-row justify-center items-stretch gap-4 md:gap-8">
                        <div 
                            className={`px-6 md:px-10 bg-white rounded-lg shadow-[0px_5px_12px_0px_rgba(0,0,0,0.10)] outline outline-2 ${selectedPlan === 'CLASSIC' ? 'outline-blue-600' : 'outline-neutral-200'} flex flex-col items-center gap-3 md:gap-5 cursor-pointer`}
                            onClick={() => handlePlanSelect('CLASSIC')}
                        >
                            <div className="flex flex-col items-center w-full mt-4">
                                <img className="w-24 h-24 md:w-32 md:h-32" src={logoClassic} alt="Plan Classic" />
                            </div>
                            <div className="w-full md:w-40 flex flex-col items-center gap-2 md:gap-2.5 mb-4">
                                <div className="flex flex-col items-center">
                                    <div className={`text-2xl md:text-3xl font-extrabold font-['Poppins'] ${selectedPlan === 'CLASSIC' ? 'text-blue-600' : 'text-zinc-600'}`}>Bridge Classic</div>
                                    <div className={`text-sm md:text-base font-bold font-['Poppins'] uppercase ${selectedPlan === 'CLASSIC' ? 'text-blue-600' : 'text-zinc-600'}`}>3 meses</div>
                                </div>
                                <div className="text-center text-zinc-800 text-xs md:text-sm font-medium font-['Poppins']">
                                    Acceso básico a los programas
                                </div>
                            </div>
                        </div>

                        <div 
                            className={`px-6 md:px-10 bg-white rounded-lg shadow-[0px_5px_12px_0px_rgba(0,0,0,0.10)] outline outline-2 ${selectedPlan === 'PREMIUM' ? 'outline-blue-600' : 'outline-neutral-200'} flex flex-col items-center gap-3 md:gap-5 cursor-pointer`}
                            onClick={() => handlePlanSelect('PREMIUM')}
                        >
                            <div className="flex flex-col items-center w-full mt-4">
                                <img className="w-24 h-24 md:w-32 md:h-32" src={logoPremium} alt="Plan Premium" />
                            </div>
                            <div className="w-full md:w-40 flex flex-col items-center gap-2 md:gap-2.5 mb-4">
                                <div className="flex flex-col items-center">
                                    <div className={`text-2xl md:text-3xl font-extrabold font-['Poppins'] ${selectedPlan === 'PREMIUM' ? 'text-blue-600' : 'text-zinc-600'}`}>Bridge Premium</div>
                                    <div className={`text-sm md:text-base font-bold font-['Poppins'] uppercase ${selectedPlan === 'PREMIUM' ? 'text-blue-600' : 'text-zinc-600'}`}>6 meses</div>
                                </div>
                                <div className="text-center">
                                    <span className="text-zinc-800 text-xs md:text-sm font-medium font-['Poppins']">
                                        Acceso completo a los programas
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div 
                            className={`px-6 md:px-10 bg-white rounded-lg shadow-[0px_5px_12px_0px_rgba(0,0,0,0.10)] outline outline-2 ${selectedPlan === 'WEALTH' ? 'outline-blue-600' : 'outline-neutral-200'} flex flex-col items-center gap-3 md:gap-5 cursor-pointer`}
                            onClick={() => handlePlanSelect('WEALTH')}
                        >
                            <div className="flex flex-col items-center w-full mt-4">
                                <img className="w-24 h-24 md:w-32 md:h-32" src={logoWealth} alt="Plan Wealth" />
                            </div>
                            <div className="w-full md:w-40 flex flex-col items-center gap-2 md:gap-2.5 mb-4">
                                <div className="flex flex-col items-center">
                                    <div className={`text-2xl md:text-3xl font-extrabold font-['Poppins'] ${selectedPlan === 'WEALTH' ? 'text-blue-600' : 'text-zinc-600'}`}>Bridge Wealth</div>
                                    <div className={`text-sm md:text-base font-bold font-['Poppins'] uppercase ${selectedPlan === 'WEALTH' ? 'text-blue-600' : 'text-zinc-600'}`}>12 meses</div>
                                </div>
                                <div className="text-center">
                                    <span className="text-zinc-800 text-xs md:text-sm font-medium font-['Poppins']">
                                        Acceso completo premium a los programas
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4">
                        <div className="text-zinc-800 text-lg md:text-2xl font-medium font-['Poppins']">
                            Total a pagar:
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-zinc-800 text-3xl md:text-4xl font-bold font-['Poppins']">
                                ${subtotal.toFixed(2)}
                            </span>
                            <span className="text-zinc-800 text-lg md:text-2xl font-bold font-['Poppins']">
                                (x{membershipMonths} meses)
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-center gap-4">
                        <button
                            onClick={() => setCurrentStep(4)}
                            className="w-full md:w-96 px-4 md:px-7 py-3 bg-blue-600 rounded-md inline-flex justify-center items-center gap-2.5 hover:bg-blue-700 transition-colors order-1 md:order-2"
                        >
                            <span className="text-white text-base font-bold font-['Poppins'] flex items-center gap-2">
                                Continuar
                                <ArrowRight className="w-4 h-4" />
                            </span>
                        </button>
                        <button
                            onClick={() => setCurrentStep(2)}
                            className="w-full md:w-96 px-4 md:px-7 py-3 rounded-md inline-flex justify-center items-center gap-2.5 border border-zinc-300 bg-white hover:bg-zinc-100 transition-colors order-2 md:order-1"
                        >
                            <span className="text-zinc-800 text-sm font-medium font-['Poppins'] flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Regresar al paso anterior
                            </span>
                        </button>
                    </div>
                </div>
            )
        },
        {
            label: 'Resumen',
            content: (
                (() => {
                    // Calcular precios correctamente
                    const membershipPrice = PLANES[selectedPlan]?.price || 0;
                    const xFactorPrice = 0;
                    const subtotal = membershipPrice + xFactorPrice;
                    return (
                        <div className="max-w-5xl mx-auto space-y-6 px-2 md:px-0">
                            <div className="flex flex-col justify-start items-center gap-4">
                                <div className="text-zinc-800 text-lg font-medium font-['Poppins']">
                                    Tu orden de compra
                                </div>
                                <div className="flex flex-col justify-start items-center gap-7">
                                    <div className="flex flex-col lg:flex-row justify-center items-start gap-4 lg:gap-7">
                                        <div className="w-full lg:w-96 h-auto lg:h-[400px] bg-white rounded-lg border border-zinc-200">
                                            <div className="w-full h-14 px-4 md:px-7 py-4 bg-stone-50 rounded-tl-lg rounded-tr-lg flex justify-between items-center">
                                                <div className="text-zinc-800 text-sm md:text-base font-bold font-['Poppins']">
                                                    Producto
                                                </div>                            
                                            </div>
                                            <div className="p-4 md:p-7 space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex justify-start items-center gap-3 md:gap-5">
                                                        <img 
                                                            className="w-8 md:w-12 h-8 md:h-12" 
                                                            src={selectedPlan === 'CLASSIC' ? logoClassic : 
                                                                 selectedPlan === 'PREMIUM' ? logoPremium : 
                                                                 logoWealth} 
                                                            alt={`Plan ${selectedPlan}`} 
                                                        />
                                                        <div className="w-20 md:w-28 inline-flex flex-col justify-start items-start">
                                                            <div className="self-stretch text-zinc-800 text-sm md:text-base font-bold font-['Poppins']">
                                                                Plan {PLANES[selectedPlan].label.charAt(0) + PLANES[selectedPlan].label.slice(1).toLowerCase()}
                                                            </div>
                                                            <div className="text-gray-500 text-xs md:text-sm font-normal font-['Poppins']">
                                                                x {selectedPlan === 'CLASSIC' ? '3' : 
                                                                   selectedPlan === 'PREMIUM' ? '6' : 
                                                                   '12'} meses
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-zinc-800 text-sm md:text-base font-semibold font-['Poppins']">
                                                        ${membershipPrice.toFixed(2)}
                                                    </div>
                                                </div>

                                                <div className="w-full h-px bg-zinc-200"></div>

                                                <div className="inline-flex flex-col justify-start items-start gap-3">
                                                    <div className="inline-flex items-center gap-2">
                                                        <div className="text-zinc-800 text-xs md:text-sm font-semibold font-['Poppins']">
                                                            Promo Code
                                                        </div>
                                                        <button 
                                                            onClick={handleCouponToggle}
                                                            className="w-6 md:w-7 h-6 md:h-7 bg-neutral-700/5 rounded-sm flex items-center justify-center hover:bg-neutral-700/10 transition-colors"
                                                        >
                                                            <ChevronDown 
                                                                className={`w-3 md:w-4 h-3 md:h-4 transition-transform ${showCoupon ? 'rotate-180' : ''}`}
                                                            />
                                                        </button>
                                                    </div>
                                                    <div
                                                        style={{ height: 110, transition: 'opacity 0.3s' }}
                                                        className="w-full flex items-center"
                                                    >
                                                        <div className={`w-full transition-opacity duration-300 ${showCoupon ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                                                            <div className="flex justify-between items-center mb-3">
                                                                <div className="text-gray-900 text-sm md:text-base font-normal font-['Poppins']">
                                                                    Descuento (-)
                                                                </div>
                                                                <div className="text-right text-gray-900 text-sm md:text-base font-medium font-['Poppins']">
                                                                    $0.00
                                                                </div>
                                                            </div>
                                                            <div className="self-stretch flex flex-col md:flex-row md:flex-wrap justify-between items-stretch w-full gap-3 md:gap-4">
                                                                <div className="w-full md:flex-1 flex flex-col justify-start items-start gap-[5px]">
                                                                    <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
                                                                        <div className="self-stretch p-2.5 bg-white rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-200 flex items-center gap-2.5">
                                                                            <input
                                                                                type="text"
                                                                                value={couponCode}
                                                                                onChange={(e) => setCouponCode(e.target.value)}
                                                                                placeholder="Ingresa el código"
                                                                                className="w-full text-xs md:text-sm font-normal font-['Poppins'] text-zinc-800 placeholder-gray-400 focus:outline-none"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <button 
                                                                    onClick={handleCouponSubmit}
                                                                    className="w-full md:w-auto min-w-[120px] px-4 md:px-7 py-2.5 mt-2 md:mt-0 bg-cyan-700 rounded-md flex justify-center items-center gap-2.5 hover:bg-cyan-800 transition-colors"
                                                                >
                                                                    <div className="text-white text-xs md:text-sm font-semibold font-['Poppins'] flex items-center gap-2">
                                                                        <Check className="w-3 md:w-4 h-3 md:h-4" />
                                                                        Aplicar
                                                                    </div>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full lg:w-96 h-auto lg:h-[400px] bg-white rounded-lg border border-zinc-200">
                                            <div className="w-full h-14 px-4 md:px-7 py-4 bg-stone-50 rounded-tl-lg rounded-tr-lg flex justify-between items-center">
                                                <div className="text-zinc-800 text-sm md:text-base font-bold font-['Poppins']">
                                                    Subtotal
                                                </div>
                                                <div className="text-right text-zinc-800 text-sm md:text-base font-medium font-['Poppins']">
                                                    Total
                                                </div>
                                            </div>
                                            <div className="p-4 md:p-7 space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <div className="text-zinc-800 text-sm md:text-base font-semibold font-['Poppins']">
                                                        Subtotal
                                                    </div>
                                                    <div className="text-right text-zinc-800 text-sm md:text-base font-semibold font-['Poppins']">
                                                        ${subtotal.toFixed(2)}
                                                    </div>
                                                </div>

                                                <div className="w-full h-px bg-zinc-200"></div>

                                                <div className="flex justify-between items-center">
                                                    <div className="text-zinc-800 text-sm md:text-base font-semibold font-['Poppins']">
                                                        Total a pagar
                                                    </div>
                                                    <div className="text-right text-zinc-800 text-sm md:text-base font-semibold font-['Poppins']">
                                                        ${subtotal.toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full max-w-[800px] mx-auto flex flex-col gap-4">
                                        <div className="flex flex-col md:flex-row justify-center gap-4 w-full">
                                            <button
                                                onClick={handlePayment}
                                                className="w-full md:w-96 px-4 md:px-7 py-3 bg-blue-600 rounded-md inline-flex justify-center items-center gap-2.5 hover:bg-blue-700 transition-colors order-1 md:order-2"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <div className="flex items-center gap-2">
                                                        <Loader2 className="animate-spin h-5 w-5 text-white" />
                                                        <span className="text-white text-base font-bold font-['Poppins']">
                                                            Procesando...
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-white text-base font-bold font-['Poppins'] flex items-center gap-2">
                                                        <CreditCard className="w-4 h-4" />
                                                        Realizar pago
                                                    </span>
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setCurrentStep(2)}
                                                className="w-full md:w-96 px-4 md:px-7 py-3 rounded-md inline-flex justify-center items-center gap-2.5 border border-zinc-300 bg-white hover:bg-zinc-100 transition-colors order-2 md:order-1"
                                            >
                                                <span className="text-zinc-800 text-sm font-medium font-['Poppins'] flex items-center gap-2">
                                                    <ArrowLeft className="w-4 h-4" />
                                                    Regresar al paso anterior
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })()
            )
        },
        {
            label: 'Realizar Pago',
            content: (
                <div className="max-w-5xl mx-auto space-y-6 px-2 md:px-0">
                    <div className="w-full flex flex-col items-center p-4 md:p-8">
                        <h2 className="text-center text-2xl font-bold mb-4">
                            Realiza tu pago de forma segura
                        </h2>
                        <p className="text-base text-zinc-800 font-medium font-['Poppins'] mb-4 text-center max-w-lg">
                            Escanea el código QR con tu wallet desde el móvil o envía el monto exacto a la dirección que aparece en pantalla.
                        </p>
                        <div className="bg-red-100 border-red-500 text-red-800 p-4 rounded mb-8 max-w-lg w-full">
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Asegúrate de enviar el importe exacto.</li>
                                <li>Tienes <span className="font-bold">20 minutos</span> para completar el pago.</li>
                                <li>No cierres ni actualices la ventana, ya que el pago se invalidará.</li>
                            </ul>
                        </div>
                        
                        {paymentId && !iframeError ? (
                            (() => {
                                const iframeUrl = paymentData?.id 
                                    ? `https://nowpayments.io/embeds/payment-widget?iid=${paymentData.id}`
                                    : paymentData?.invoice_url;
                                return (
                                    <div className="flex justify-center mb-8">
                                        <iframe
                                            src={iframeUrl}
                                            width="100%"
                                            height={696}
                                            frameBorder={0}
                                            scrolling="no"
                                            style={{ 
                                                overflowY: "hidden", 
                                                borderRadius: 12, 
                                                boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
                                                maxWidth: '410px',
                                                minHeight: '500px'
                                            }}
                                            title="Pago con NOWPayments"
                                            onError={() => {
                                                setIframeError(true);
                                                window.toast?.error('No se pudo cargar el widget de pago. Usa el enlace alternativo.', {
                                                    title: 'Error de Carga',
                                                    duration: 8000
                                                });
                                            }}
                                        />
                                    </div>
                                );
                            })()
                        ) : (
                            <div className="w-full flex flex-col items-center p-4 md:p-8">
                                <p>Cargando información de pago...</p>
                                {paymentData?.invoice_url && (
                                    <a
                                        href={paymentData.invoice_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-4 text-blue-600 underline"
                                    >
                                        Abrir pago en una nueva ventana
                                    </a>
                                )}
                                {iframeError && (
                                    <div className="text-red-500 mt-2">
                                        No se pudo cargar el widget. Haz clic en el enlace para continuar con el pago.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center mt-8">
                        <button
                            type="button"
                            onClick={() => setCurrentStep(3)}
                            className="w-full md:w-96 px-4 md:px-7 py-3 rounded-md inline-flex justify-center items-center gap-2.5 border border-zinc-300 bg-white hover:bg-zinc-100 transition-colors"
                        >
                            <span className="text-zinc-800 text-sm font-medium font-['Poppins'] flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Regresar al paso anterior
                            </span>
                        </button>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen w-full relative bg-gradient-to-b from-white to-indigo-400 overflow-hidden">
            
            {/* Modal de Términos y Condiciones */}
            {showTermsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg border border-black max-w-2xl w-full p-8 relative">
                        <h2 className="text-xl font-bold mb-4">Términos y Condiciones</h2>
                        <div className="max-h-96 overflow-y-auto text-sm text-gray-700 mb-6">
                            <p>Al utilizar esta plataforma, aceptas cumplir con los términos y condiciones establecidos por The Wealthy Bridge. El uso indebido, la distribución no autorizada de contenido, o cualquier actividad fraudulenta resultará en la suspensión de la cuenta. Para más detalles, consulta nuestra política de privacidad y condiciones completas en nuestro sitio web.</p>
                            <ul className="list-disc ml-6 mt-2">
                                <li>Debes proporcionar información verídica y actualizada.</li>
                                <li>No está permitido compartir tu cuenta con terceros.</li>
                                <li>El acceso a los servicios está sujeto al pago correspondiente.</li>
                                <li>La empresa se reserva el derecho de modificar estos términos en cualquier momento.</li>
                            </ul>
                        </div>
                        <button
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                            onClick={() => setShowTermsModal(false)}
                            aria-label="Cerrar"
                        >
                            ×
                        </button>
                        <div className="flex justify-end">
                            <button
                                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                onClick={() => setShowTermsModal(false)}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="container mx-auto px-4 py-4 md:py-8 relative z-10">
                <div className="flex justify-center mb-4 md:mb-8">
                    <img 
                        className="w-48 md:w-64 h-12 md:h-16" 
                        src="/logo_wb.svg" 
                        alt="Logo Wealthy Bridge" 
                    />
                </div>
                <div className="max-w-[904px] mx-auto bg-white rounded-lg shadow-[0px_4px_19.899999618530273px_0px_rgba(0,0,0,0.20)] p-4 md:p-8">
                    {/* Stepper Responsive */}
                    <div className="hidden md:block">
                        <Stepper 
                            activeStep={currentStep - 1} 
                            alternativeLabel
                            sx={{
                                '& .MuiStepLabel-root .Mui-completed': { color: '#3758f9' },
                                '& .MuiStepLabel-root .Mui-active': { color: '#3758f9' },
                                '& .MuiStepLabel-label.Mui-active.MuiStepLabel-alternativeLabel': { color: '#3758f9' },
                                '& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel': { color: '#3758f9' },
                                '& .MuiStepIcon-root': {
                                    color: '#e0e0e0',
                                    '&.Mui-active': { color: '#3758f9' },
                                    '&.Mui-completed': { color: '#3758f9' },
                                },
                                '& .MuiStepConnector-root': { top: 16 },
                                '& .MuiStepConnector-line': { borderColor: '#e0e0e0' },
                                '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': { borderColor: '#3758f9' },
                                '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': { borderColor: '#3758f9' },
                            }}
                        >
                            {["Crear cuenta", "Datos personales", "Elige tu plan", "Resumen", "Realizar Pago"].map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </div>
                    {/* Stepper Mobile */}
                    <div className="md:hidden mb-6">
                        <Stepper 
                            activeStep={currentStep - 1} 
                            orientation="vertical"
                            sx={{
                                '& .MuiStepLabel-root .Mui-completed': { color: '#3758f9' },
                                '& .MuiStepLabel-root .Mui-active': { color: '#3758f9' },
                                '& .MuiStepIcon-root': {
                                    color: '#e0e0e0',
                                    '&.Mui-active': { color: '#3758f9' },
                                    '&.Mui-completed': { color: '#3758f9' },
                                },
                                '& .MuiStepConnector-root': { left: 16 },
                                '& .MuiStepConnector-line': { borderColor: '#e0e0e0' },
                                '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': { borderColor: '#3758f9' },
                                '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': { borderColor: '#3758f9' },
                            }}
                        >
                            {["Crear cuenta", "Datos personales", "Elige tu plan", "Resumen", "Realizar Pago"].map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </div>
                    <div className="mt-4 md:mt-8">
                        {currentStep === 1 && referedName && (
                            <div className="w-full flex justify-center my-4">
                                <div className="text-blue-800 text-base font-semibold font-['Poppins']">
                                    Has sido referido por: {referedName}
                                </div>
                            </div>
                        )}
                        {steps[currentStep - 1].content}
                    </div>
                </div>
            </div>
        </div>
    );
}