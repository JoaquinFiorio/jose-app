import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import React from 'react';

export default function PrivateRoute({ children }) {
    const { user, loading } = React.useContext(AuthContext);

    // Mostrar loading mientras AuthContext inicializa
    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-zinc-100">
                <div className="text-center">
                    <div className="text-indigo-950 text-xl font-bold font-['Open_Sans'] mb-2">
                        Cargando...
                    </div>
                    <div className="text-gray-600 text-sm">
                        Verificando autenticación
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

