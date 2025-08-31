export default function Filters() {
    return (
        <form className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-wrap gap-4 items-center mb-8">

            {/* Membresía */}
            <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-1" htmlFor="membership">Membresía:</label>
                <select
                    id="membership"
                    name="membership"
                    className="rounded-md border border-gray-300 px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                    <option value="">Todas</option>
                    <option value="Classic">Classic</option>
                    <option value="Premium">Premium</option>
                    <option value="Wealth">Wealth</option>
                </select>
            </div>

            {/* Estado */}
            <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-1" htmlFor="status">Estado:</label>
                <select
                    id="status"
                    name="status"
                    className="rounded-md border border-gray-300 px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                    <option value="">Todos</option>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                </select>
            </div>
        </form>
    );
}
