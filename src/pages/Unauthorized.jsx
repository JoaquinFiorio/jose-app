export default function Unauthorized() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-red-600 mb-2">🚫 Acceso Denegado</h1>
                <p className="text-gray-600">No tienes permisos para ver esta página.</p>
            </div>
        </div>
    );
}
