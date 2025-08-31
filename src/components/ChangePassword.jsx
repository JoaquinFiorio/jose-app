import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Loader2, Eye, EyeOff, Lock } from 'lucide-react';
import authService from '../services/authService';
import { useForm } from 'react-hook-form';
import ErrorMessage from './ui/ErrorMessage';

/**
 * Componente ChangePassword
 * 
 * Flujo de uso:
 * 1. Usuario recibe email con link: /change-password?token=abc123&email=user@example.com
 * 2. El componente auto-llena el email desde la URL
 * 3. Valida que el token sea válido antes de permitir cambio
 * 4. Usuario solo necesita ingresar nueva contraseña y confirmarla
 * 
 * Parámetros URL esperados:
 * - token: Token de seguridad enviado por email (requerido para cambio)
 * - email: Email del usuario (se auto-llena en el formulario)
 * 
 * Seguridad:
 * - El token debe ser validado en backend antes de permitir cambio
 * - Token tiene expiración (recomendado: 1 hora)
 * - Solo se permite un uso por token
 */
export default function ChangePassword() {
    const [searchParams] = useSearchParams();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [tokenValidating, setTokenValidating] = useState(false);
    const [tokenValid, setTokenValid] = useState(false);
    const [tokenError, setTokenError] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
        mode: 'onChange',
        defaultValues: {
            email: '',
            newPassword: '',
            totp: '',
        },
    });

    // Extraer parámetros de la URL
    const token = searchParams.get('token');
    const emailFromUrl = searchParams.get('email');

    // Si hay email en la URL, auto-llenar el campo en react-hook-form
    useEffect(() => {
        if (emailFromUrl) {
            setValue('email', emailFromUrl);
        }
    }, [emailFromUrl, setValue]);

    // Usar watch para obtener el valor de la nueva contraseña
    const watchedNewPassword = watch('newPassword', '');
    // Validación de requisitos de contraseña igual que en Register.jsx
    const allPasswordValidRH =
        watchedNewPassword.length >= 6 &&
        /[A-Z]/.test(watchedNewPassword) &&
        /[a-z]/.test(watchedNewPassword) &&
        /[0-9]/.test(watchedNewPassword) &&
        /[^A-Za-z0-9]/.test(watchedNewPassword);

    /**
     * Efecto para manejar parámetros URL y validar token
     */
    useEffect(() => {
        // Si hay email en URL, auto-llenar el campo
        if (emailFromUrl) {
            // setEmail(emailFromUrl); // This line was removed as per the edit hint
        }

        // Si hay token, validarlo
        if (token) {
            validateResetToken();
        } else {
            // Si no hay token, mostrar error
            setTokenError('Token de seguridad requerido. Por favor, usa el enlace enviado a tu email.');
        }
    }, [token, emailFromUrl]);

    /**
     * Valida el token de reset de contraseña
     */
    const validateResetToken = async () => {
        setTokenValidating(true);
        setTokenError('');

        try {
            const response = await authService.validatePasswordResetToken(token, emailFromUrl);
            
            if (response.success) {
                setTokenValid(true);
                console.log('Token válido:', response);
            } else {
                setTokenError(response.message || 'Token inválido o expirado');
                setTokenValid(false);
            }
        } catch (error) {
            console.error('Error validando token:', error);
            setTokenError(error.message || 'Error al validar el token. Por favor, solicita un nuevo enlace.');
            setTokenValid(false);
        } finally {
            setTokenValidating(false);
        }
    };

    /**
     * Maneja el envío del formulario de cambio de contraseña
     */
    const onSubmit = async (data) => {
        setError('');
        setLoading(true);
        // Validar que el token esté presente
        if (!token) {
            setError('Token de seguridad requerido');
            setLoading(false);
            return;
        }
        try {
            const response = await authService.changePasswordWithToken(data.email, data.newPassword, token);
            if (response.success) {
                toast.success('Contraseña cambiada exitosamente');
                setProcessing(true);
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            } else {
                setError(response.message || 'Error al cambiar la contraseña');
            }
        } catch (error) {
            setError(error.message || 'Error al cambiar la contraseña');
            toast.error(error.message || 'Error al cambiar la contraseña');
        } finally {
            setLoading(false);
        }
    };

    // Vista de cargando mientras se valida el token
    if (tokenValidating) {
        return (
            <div className="min-h-screen w-full relative bg-gradient-to-b from-white to-indigo-400 overflow-hidden">
                <div className="min-h-screen flex items-center justify-center relative z-10">
                    <div className="text-center">
                        <div className="animate-spin mb-4 text-indigo-600">
                            <Loader2 className="h-10 w-10" />
                        </div>
                        <p className="text-indigo-800 text-lg font-semibold">Validando enlace de seguridad...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Vista de procesando después del envío exitoso
    if (processing) {
        return (
            <div className="min-h-screen w-full relative bg-gradient-to-b from-white to-indigo-400 overflow-hidden">
                <div className="min-h-screen flex items-center justify-center relative z-10">
                    <div className="text-center">
                        <div className="animate-spin mb-4 text-indigo-600">
                            <Loader2 className="h-10 w-10" />
                        </div>
                        <p className="text-indigo-800 text-lg font-semibold">Procesando cambio...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full relative bg-gradient-to-b from-white to-indigo-400 overflow-hidden">
            
            <div className="container mx-auto px-4 py-4 md:py-8 relative z-10 min-h-[calc(100vh-4rem)] flex flex-col justify-center">
                <div className="flex justify-center mb-4 md:mb-8">
                    <img 
                        className="w-48 md:w-64 h-12 md:h-16" 
                        src="/logo_wb.svg" 
                        alt="Logo Wealthy Bridge" 
                    />
                </div>

                <div className="max-w-[904px] mx-auto bg-white rounded-lg shadow-[0px_4px_19.899999618530273px_0px_rgba(0,0,0,0.20)] p-4 md:p-8">
                    {/* Error de token */}
                    {tokenError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <h3 className="text-red-800 font-semibold">Enlace inválido</h3>
                                    <p className="text-red-700 text-sm mt-1">{tokenError}</p>
                                    <p className="text-red-600 text-sm mt-2">
                                        Si necesitas cambiar tu contraseña, solicita un nuevo enlace desde tu email.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Estado de token válido */}
                    {tokenValid && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <h3 className="text-green-800 font-semibold">Enlace verificado</h3>
                                    <p className="text-green-700 text-sm">Puedes proceder a cambiar tu contraseña de forma segura.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col items-center mb-4 md:mb-8">
                        <h2 className="text-zinc-800 text-lg md:text-2xl font-bold font-['Poppins']">
                            Cambiar contraseña
                        </h2>
                        <p className="text-zinc-600 text-sm font-medium font-['Poppins'] mt-2 text-center">
                            {emailFromUrl ? 
                                `Cambiando contraseña para: ${emailFromUrl}` : 
                                'Ingresa tu nueva contraseña'
                            }
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-4 px-2 md:px-0">
                            {/* Campo Email - Solo lectura si viene de URL */}
                            <div className="space-y-2">
                                <label className="text-zinc-800 text-sm font-medium font-['Poppins']">
                                    Correo electrónico
                                </label>
                                <input
                                    type="email"
                                    {...register('email', {
                                        required: 'El correo electrónico es obligatorio',
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: 'Por favor, ingresa un email válido',
                                        },
                                    })}
                                    readOnly={!!emailFromUrl}
                                    placeholder="Ingresa tu correo electrónico"
                                    className={`w-full pl-5 pr-4 py-2 bg-white rounded-md border border-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-400 ${emailFromUrl ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                />
                                {emailFromUrl && (
                                    <p className="text-sm text-gray-500">
                                        Email verificado desde el enlace de recuperación
                                    </p>
                                )}
                                {errors.email && (
                                    <ErrorMessage>{errors.email.message}</ErrorMessage>
                                )}
                            </div>

                            {/* Campo Nueva Contraseña */}
                            <div className="space-y-2">
                                <label className="text-zinc-800 text-sm font-medium font-['Poppins']">
                                    Nueva contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        {...register('newPassword', {
                                            required: 'La contraseña es obligatoria',
                                            validate: {
                                                minLength: v => v.length >= 6 || 'Al menos 6 caracteres',
                                                upper: v => /[A-Z]/.test(v) || 'Al menos una mayúscula',
                                                lower: v => /[a-z]/.test(v) || 'Al menos una minúscula',
                                                number: v => /[0-9]/.test(v) || 'Al menos un número',
                                                special: v => /[^A-Za-z0-9]/.test(v) || 'Al menos un carácter especial',
                                            },
                                        })}
                                        placeholder="Ingresa tu nueva contraseña"
                                        disabled={!tokenValid && !!token}
                                        className="w-full pl-5 pr-10 py-2 bg-white rounded-md border border-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                        onClick={() => setShowNewPassword((prev) => !prev)}
                                        disabled={!tokenValid && !!token}
                                        aria-label={showNewPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    >
                                        {showNewPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.newPassword && (
                                    <ErrorMessage>{errors.newPassword.message}</ErrorMessage>
                                )}
                            </div>

                            {/* Campo Confirmar Contraseña */}
                            <div className="space-y-2">
                                <label className="text-zinc-800 text-sm font-medium font-['Poppins']">
                                    Código TOTP
                                </label>
                                <div className="relative">
                                    <input
                                        placeholder="Ingresa el código que enviamos a tu célular"
                                        disabled={!tokenValid && !!token}
                                        className="w-full pl-5 pr-10 py-2 bg-white rounded-md border border-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        disabled={!tokenValid && !!token}
                                        aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <ErrorMessage>{errors.confirmPassword.message}</ErrorMessage>
                                )}
                            </div>

                            {/* Mostrar errores */}
                            {error && (
                                <div className="text-red-600 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            {/* Botón de envío */}
                            <button
                                type="submit"
                                className="w-full px-4 md:px-7 py-3 bg-blue-600 rounded-md inline-flex justify-center items-center gap-2.5 hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                disabled={loading || (!tokenValid && !!token) || !allPasswordValidRH}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="animate-spin h-5 w-5 text-white" />
                                        <span className="text-white text-base font-bold font-['Poppins']">
                                            Cargando...
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-white text-base font-bold font-['Poppins'] flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        Cambiar contraseña
                                    </span>
                                )}
                            </button>

                            {/* Información sobre seguridad */}
                            {token && (
                                <div className="text-center">
                                    <p className="text-zinc-600 text-sm">
                                        Este enlace es de un solo uso y expira en 1 hora por seguridad.
                                    </p>
                                </div>
                            )}

                            {/* Link de vuelta al login */}
                            <div className="text-center">
                                <span className="text-zinc-800 text-sm font-medium font-['Poppins']">
                                    ¿Recordaste tu contraseña?{' '}
                                    <Link 
                                        to="/login" 
                                        className="font-semibold text-blue-600 underline hover:text-blue-800 transition-colors"
                                    >
                                        Volver al login
                                    </Link>
                                </span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
} 