import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loader from './Loader';
import ErrorPage from './ErrorPage';

const API_URL = 'http://localhost:3000/api';

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No hay token de autenticación');
                }

                const response = await fetch(`${API_URL}/v1/auth/me`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Error al cargar perfil');
                }

                const data = await response.json();
                setUser(data);
            } catch (error) {
                console.error('Error:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        toast.info('Sesión cerrada');
        navigate('/login');
    };

    if (loading) return <Loader />;
    if (error) return <ErrorPage message={error} />;
    if (!user) return <ErrorPage message="No se encontró el usuario" />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Cerrar Sesión
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Nombre
                                </label>
                                <p className="mt-1 text-lg text-gray-900">{user.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Apellido
                                </label>
                                <p className="mt-1 text-lg text-gray-900">{user.lastName}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <p className="mt-1 text-lg text-gray-900">{user.email}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Membresía
                            </label>
                            <p className="mt-1 text-lg font-semibold text-yellow-600">
                                {user.membershipType}
                            </p>
                        </div>

                        {user.xFactors && user.xFactors.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    XFactors
                                </label>
                                <div className="mt-2 flex gap-2">
                                    {user.xFactors.map((xf, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
                                        >
                                            {xf}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-6 border-t">
                            <button
                                onClick={() => navigate('/edit-profile')}
                                className="w-full md:w-auto px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                            >
                                Editar Perfil
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
