import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import logo from "../assets/logo.jpg";
import Footer from "./Footer.jsx";

const API_URL = 'http://localhost:3000/api';

export default function DailyIncentivesTable({ onViewDetail }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [incentives, setIncentives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchIncentives = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/v1/users/${id}/incentives-by-day`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Error al cargar incentivos');
                }

                const data = await response.json();
                setIncentives(data);
            } catch (error) {
                console.error('Error:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchIncentives();
    }, [id]);

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(incentives);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Incentivos");
        XLSX.writeFile(wb, "incentivos.xlsx");
    };

    if (loading) return <div>Cargando...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Header */}
            <header className="bg-gray-900 text-white flex items-center justify-between px-8 py-4 shadow-md">
                <div className="flex items-center gap-4">
                    <div className="bg-white rounded-md p-1">
                        <img src={logo} alt="The Wealthy Bridge Logo" className="h-10 w-auto" />
                    </div>
                    <span className="text-2xl font-bold text-yellow-500 tracking-wide">The Wealthy Bridge</span>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="bg-white/10 rounded-lg px-4 py-2 hover:bg-white/20 transition"
                >
                    ← Volver
                </button>
            </header>

            <div className="bg-gray-50 min-h-screen p-8">
                <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200 max-w-screen-2xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Incentivos por Día
                        </h2>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={exportToExcel}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                            >
                                Exportar Excel
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto border border-gray-300 rounded-lg">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">Fecha</th>
                                <th className="px-4 py-3">Productos Vendidas</th>
                                <th className="px-4 py-3">XFactors Vendidos</th>
                                <th className="px-4 py-3">Comisión Total</th>
                                <th className="px-4 py-3">Acciones</th>
                            </tr>
                            </thead>
                            <tbody className="text-gray-800">
                            {incentives.map((incentive, index) => (
                                <tr key={index} className="border-t">
                                    <td className="px-4 py-3 font-medium">{new Date(incentive.date).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">{incentive.membershipsSold}</td>
                                    <td className="px-4 py-3">{incentive.xFactorsSold}</td>
                                    <td className="px-4 py-3">${incentive.totalCommission}</td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => onViewDetail(incentive.date)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Ver Detalle
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
