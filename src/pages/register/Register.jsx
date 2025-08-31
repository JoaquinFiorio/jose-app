import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stepper, Step, StepLabel } from '@mui/material';
import { Eye, EyeOff, ArrowLeft, ArrowRight, CreditCard, Loader2 } from 'lucide-react';
import logoClassic from "../../assets/Classic_badge.svg";
import logoPremium from "../../assets/Premium_badge.svg";
import logoWealth from "../../assets/Wealth_badge.svg";
import { useForm } from 'react-hook-form';
import ErrorMessage from '../../components/ui/ErrorMessage';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth, useTransactions } from '../../hooks';

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

export default function Register() {

    const { register } = useAuth();
    const { payment } = useTransactions();

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedPlan, setSelectedPlan] = useState('CLASSIC');
    const [currentMembership, setCurrentMembership] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        countryCode: '',
        birthDate: '',
        city: '',
        country: ''
    });
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // useForm para el primer paso
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

    // useForm para el segundo paso
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
    const passwordRequirements = [
        {
            label: 'Al menos 6 caracteres',
            test: (pw) => pw.length >= 6,
        },
        {
            label: 'Al menos una mayúscula',
            test: (pw) => /[A-Z]/.test(pw),
        },
        {
            label: 'Al menos una minúscula',
            test: (pw) => /[a-z]/.test(pw),
        },
        {
            label: 'Al menos un número',
            test: (pw) => /[0-9]/.test(pw),
        },
        {
            label: 'Al menos un carácter especial',
            test: (pw) => /[^A-Za-z0-9]/.test(pw),
        },
    ];
    const password = watch('password', '');
    const passwordChecks = passwordRequirements.map(req => req.test(password));
    const allPasswordValid = passwordChecks.every(Boolean);

    // useEffect(() => {
    //     const checkPaymentStatus = async () => {
    //         // Si tenemos invoice_id, usamos el nuevo método
    //         if (invoiceId) {
    //             try {
    //                 const data = await registerService.getPaymentStatusByInvoiceId(invoiceId);
    //                 if (data.success && (data.data.payment_status === 'confirmed' || data.data.payment_status === 'finished')) {
    //                     window.toast?.success('¡Pago confirmado!');
    //                     navigate('/login');
    //                 }
    //             } catch (error) {
    //                 console.error('Error checking payment status by invoice_id:', error);
    //                 // Mensaje de error eliminado
    //             }
    //         }
    //         // Si no tenemos invoice_id pero sí paymentId, usamos el método original como fallback
    //         else if (paymentId) {
    //             try {
    //                 const data = await registerService.getPaymentStatus(paymentId);
    //                 if (data.success && (data.data.payment_status === 'confirmed' || data.data.payment_status === 'finished')) {
    //                     window.toast?.success('¡Pago confirmado!');
    //                     navigate('/');
    //                 }
    //             } catch (error) {
    //                 console.error('Error checking payment status by payment_id:', error);
    //                 // Mensaje de error eliminado
    //             }
    //         }
    //     };

    //     const interval = setInterval(checkPaymentStatus, 30000); // Verificar cada 30 segundos
    //     return () => clearInterval(interval);
    // }, [invoiceId, paymentId, navigate]);

    const handleStep1Submit = (data) => {
        setFormData({
            ...formData,
            name: data.name,
            email: data.email,
            password: data.password,
            confirmPassword: data.confirmPassword,
        });
        setCurrentStep(2);
    };

    const handlePayment = async (data) => {
        setLoading(true);

        const name = formData.name.split(' ')

        try {
            const userData = {
                firstname: name[0] || data.name,
                lastname: name[1] || data.name,
                email: data.email,
                password: data.password,
                phone: data.phone,
                country_code: data.countryCode,
                birthdate: data.birthDate,
                city: data.city,
                country: data.country,
                address: "Calle Los Mosqueteros"
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

            setCurrentMembership(membershipData)

            // Llamar al endpoint unificado de registro
            const result = await register(userData);

            if (!result.success) {
                throw new Error(result.message || 'Error en el registro');
            }

            localStorage.setItem('token', result.token);

            // Guardar datos de pago sin hacer login automático
            navigate('/login')
            window.toast?.success('Registro exitoso.');

        } catch (error) {
            console.error('Error en handlePayment:', error);

            // Manejar específicamente el error de cuenta ya existente
            if (error.message && (
                error.message.toLowerCase().includes('ya existe') ||
                error.message.toLowerCase().includes('already exists') ||
                error.message.toLowerCase().includes('email') ||
                error.message.toLowerCase().includes('registrado')
            )) {
                window.toast?.error('La cuenta ya existe. Por favor, inicia sesión o utiliza un correo electrónico diferente.', {
                    title: 'Cuenta Existente',
                    duration: 8000
                });
            } else if (error.message && error.message.toLowerCase().includes('inválidos')) {
                window.toast?.error('Datos de registro inválidos. Verifica la información ingresada.', {
                    title: 'Datos Inválidos',
                    duration: 6000
                });
            } else if (error.message && error.message.toLowerCase().includes('validación')) {
                window.toast?.error('Datos de validación incorrectos. Verifica todos los campos.', {
                    title: 'Error de Validación',
                    duration: 6000
                });
            } else if (error.message && error.message.toLowerCase().includes('servidor')) {
                window.toast?.error('Error interno del servidor. Inténtalo más tarde.', {
                    title: 'Error del Servidor',
                    duration: 8000
                });
            } else {
                window.toast?.error(error.message || 'Error en el proceso de registro', {
                    title: 'Error de Registro',
                    duration: 6000
                });
            }
        } finally {
            setLoading(false);
        }
    }

    // Cálculo dinámico de precios y meses
    const steps = [
        {
            label: 'Crear cuenta',
            content: (
                <form onSubmit={rhfHandleSubmit(handleStep1Submit)} className="max-w-xl mx-auto space-y-4 px-2 md:px-0">
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
                        {/* Eliminada la lista de requisitos visual, solo se muestra el mensaje de error */}
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

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            {...rhfRegister('terms', { required: 'Debes aceptar los términos y condiciones' })}
                            className="w-5 h-5 bg-white rounded border border-neutral-400"
                        />
                        <label className="text-zinc-800 text-sm font-semibold font-['Poppins']">
                            Acepto los{' '}
                            <button
                                type="button"
                                className="text-blue-600 underline hover:text-blue-800 focus:outline-none"
                                onClick={() => setShowTermsModal(true)}
                            >
                                términos y condiciones de uso
                            </button>
                        </label>
                    </div>
                    {errors.terms && <ErrorMessage>{errors.terms.message}</ErrorMessage>}

                    <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4">
                        <button
                            type="submit"
                            className="w-full md:w-96 px-4 md:px-7 py-3 bg-blue-600 rounded-md inline-flex justify-center items-center gap-2.5 hover:bg-blue-700 transition-colors order-1 md:order-2"
                            disabled={!allPasswordValid}
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
                    const newData = {
                        ...formData,
                        phone: data.phone,
                        countryCode: data.countryCode,
                        birthDate: data.birthDate,
                        country: data.country,
                        city: data.city,
                    };
                    setFormData(newData);
                    handlePayment(newData);
                })} className="max-w-xl mx-auto space-y-4 px-2 md:px-0">
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
                                    if (!value) return true; // El required ya lo maneja
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
                    <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4">
                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full md:w-96 px-4 md:px-7 py-3 bg-blue-600 rounded-md inline-flex justify-center items-center gap-2.5 hover:bg-blue-700 transition-colors order-1 md:order-2"
                        >
                            <span className="text-white text-base font-bold font-['Poppins'] flex items-center gap-2">
                                Crear cuenta
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
    ];

    return (
        <div className="min-h-screen w-full relative bg-gradient-to-b from-white to-indigo-400 overflow-hidden">

            {/* Modal de Términos y Condiciones */}
            {showTermsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg border border-black max-w-2xl w-full p-4 md:p-8 relative max-h-[90vh] overflow-y-auto">
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
                                '& .MuiStepLabel-root .Mui-completed': {
                                    color: '#3758f9',
                                },
                                '& .MuiStepLabel-root .Mui-active': {
                                    color: '#3758f9',
                                },
                                '& .MuiStepLabel-label.Mui-active.MuiStepLabel-alternativeLabel': {
                                    color: '#3758f9',
                                },
                                '& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel': {
                                    color: '#3758f9',
                                },
                                '& .MuiStepIcon-root': {
                                    color: '#e0e0e0',
                                    '&.Mui-active': {
                                        color: '#3758f9',
                                    },
                                    '&.Mui-completed': {
                                        color: '#3758f9',
                                    },
                                },
                                '& .MuiStepConnector-root': {
                                    top: 16,
                                },
                                '& .MuiStepConnector-line': {
                                    borderColor: '#e0e0e0',
                                },
                                '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
                                    borderColor: '#3758f9',
                                },
                                '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
                                    borderColor: '#3758f9',
                                },
                            }}
                        >
                            {steps.map((step) => (
                                <Step key={step.label}>
                                    <StepLabel>{step.label}</StepLabel>
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
                                '& .MuiStepLabel-root .Mui-completed': {
                                    color: '#3758f9',
                                },
                                '& .MuiStepLabel-root .Mui-active': {
                                    color: '#3758f9',
                                },
                                '& .MuiStepIcon-root': {
                                    color: '#e0e0e0',
                                    '&.Mui-active': {
                                        color: '#3758f9',
                                    },
                                    '&.Mui-completed': {
                                        color: '#3758f9',
                                    },
                                },
                                '& .MuiStepConnector-root': {
                                    left: 16,
                                },
                                '& .MuiStepConnector-line': {
                                    borderColor: '#e0e0e0',
                                },
                                '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
                                    borderColor: '#3758f9',
                                },
                                '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
                                    borderColor: '#3758f9',
                                },
                            }}
                        >
                            {steps.map((step) => (
                                <Step key={step.label}>
                                    <StepLabel>{step.label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </div>

                    <div className="mt-4 md:mt-8">
                        {steps[currentStep - 1].content}
                    </div>
                </div>
            </div>
        </div>
    );
}
