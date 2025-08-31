import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import { AuthContext } from '../context/AuthContext.js';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { signIn } = React.useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            window.toast.error("Completa todos los campos");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            window.toast.error("Formato de email inválido");
            return;
        }

        try {
            const response = await signIn({ email, password });

            if (!response) {
                window.toast.error("Error en credenciales");
                return;
            }

            window.toast.success("Has iniciado sesión exitosamente");
            navigate("/home");
        } catch (error) {
            window.toast.error(error.message || "Error al iniciar sesión");
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
                            Iniciar sesión
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

                            <div className="space-y-2">
                                <label className="text-zinc-800 text-sm font-medium font-['Poppins']">
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Ingresa tu contraseña"
                                        required
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
                                <div className="text-right">
                                    <Link
                                        to="/request-password-reset"
                                        className="text-blue-600 text-sm font-medium font-['Poppins'] underline hover:text-blue-800 transition-colors"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </div>
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
                                            Cargando...
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-white text-base font-bold font-['Poppins'] flex items-center gap-2">
                                        <LogIn className="w-4 h-4" />
                                        Ingresar
                                    </span>
                                )}
                            </button>

                            <div className="text-center">
                                <span className="text-zinc-800 text-sm font-medium font-['Poppins']">
                                    ¿No tienes una cuenta?{' '}
                                    <Link
                                        to="/register"
                                        className="font-semibold text-blue-600 underline hover:text-blue-800 transition-colors"
                                    >
                                        Regístrate aquí
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
