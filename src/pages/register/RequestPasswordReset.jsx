import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Mail } from 'lucide-react';
import { useAuth } from '../../hooks/auth';
import { useNavigate } from 'react-router';

export default function RequestPasswordReset() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { requestPasswordReset } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Validación básica
        if (!email) {
            setLoading(false);
            return;
        }

        // Validación de formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setLoading(false);
            return;
        }
        
        try {
            // Mostrar toast de éxito con el mensaje del API
            const response = await requestPasswordReset(email);
            if (typeof window !== 'undefined' && window.toast) {
                window.toast.success(
                    response.message || 'Solicitud enviada exitosamente.',
                    {
                        title: 'Solicitud enviada',
                        duration: 6000
                    }
                );
            }
            // Limpiar el formulario después del éxito
            setEmail('');
            navigate('/login');
        } catch (error) {
            // Mostrar toast de error
            if (typeof window !== 'undefined' && window.toast) {
                window.toast.error(
                    error.message || 'Error de red. Intenta nuevamente.',
                    {
                        title: 'Error',
                        duration: 5000
                    }
                );
            }
        } finally {
            setLoading(false);
        }
    };

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
                    <div className="flex flex-col items-center mb-4 md:mb-8">
                        <h2 className="text-zinc-800 text-lg md:text-2xl font-bold font-['Poppins']">
                            Restablecer contraseña
                        </h2>
                    </div>

                    <div className="flex justify-center">
                        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 px-2 md:px-0">
                            <div className="space-y-2">
                                <label className="text-zinc-800 text-sm font-medium font-['Poppins']">
                                    Correo electrónico
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Ingresa tu correo electrónico"
                                    required
                                    className="w-full pl-5 pr-4 py-2 bg-white rounded-md border border-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full md:w-96 px-4 md:px-7 py-3 bg-blue-600 rounded-md inline-flex justify-center items-center gap-2.5 hover:bg-blue-700 transition-colors"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="animate-spin h-5 w-5 text-white" />
                                        <span className="text-white text-base font-bold font-['Poppins']">
                                            Enviando...
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-white text-base font-bold font-['Poppins'] flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Enviar enlace de restablecimiento
                                    </span>
                                )}
                            </button>

                            <div className="text-center">
                                <span className="text-zinc-800 text-sm font-medium font-['Poppins']">
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