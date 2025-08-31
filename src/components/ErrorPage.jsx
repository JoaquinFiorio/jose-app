import { Link } from 'react-router-dom';

export default function ErrorPage({ message }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-lg w-11/12 md:w-96 text-center">
                <h2 className="text-3xl font-bold text-red-400 mb-4">Error</h2>
                <p className="text-white mb-6">{message || 'Ocurrió un error inesperado'}</p>
                <Link to="/" className="bg-red-400 hover:bg-red-300 text-indigo-900 font-bold py-3 px-6 rounded-md transition">
                    Volver al Inicio
                </Link>
            </div>
        </div>
    );
}
