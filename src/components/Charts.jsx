import { useEffect, useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import statisticsService from '../services/statisticsService';
import ReferralCodeBox from "./ReferralCodeBox.jsx";
import { useAuth } from "../context/AuthContext.tsx";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

export default function Charts() {
    const { user } = useAuth();
    const [membershipData, setMembershipData] = useState(null);
    const [incomeData, setIncomeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log('Fetching chart data in component...');
                
                const chartData = await statisticsService.getChartData();
                console.log('Received chart data:', chartData);

                if (!chartData || !chartData.memberships) {
                    throw new Error('Invalid chart data received');
                }

                // Prepare membership data
                const membershipChartData = {
                    labels: [
                        'Classic', 'Premium', 'Wealth',
                        '2X', '3X', '5X'
                    ],
                    datasets: [{
                        data: [
                            chartData.memberships.memberships.Classic || 0,
                            chartData.memberships.memberships.Premium || 0,
                            chartData.memberships.memberships.Wealth || 0,
                            chartData.memberships.xFactors['2X'] || 0,
                            chartData.memberships.xFactors['3X'] || 0,
                            chartData.memberships.xFactors['5X'] || 0
                        ],
                        backgroundColor: [
                            '#3B82F6', '#9333EA', '#FACC15',   // Classic (azul), Premium (morado), Wealth (dorado)
                            '#3B82F6', '#9333EA', '#F472B6'    // XFactors (puedes ajustar si quieres)
                        ],
                        borderColor: [
                            '#3B82F6', '#9333EA', '#FACC15',
                            '#3B82F6', '#9333EA', '#F472B6'
                        ],
                        borderWidth: 2
                    }]
                };

                // Prepare income data
                const incomeChartData = {
                    labels: chartData.income.map(item => item.label),
                    datasets: [{
                        label: 'Ingresos ($)',
                        data: chartData.income.map(item => item.total),
                        backgroundColor: chartData.income.map((_, i) => i % 2 === 0 ? '#C9A14A' : '#232323'),
                        borderRadius: 8,
                        maxBarThickness: 60
                    }]
                };

                setMembershipData(membershipChartData);
                setIncomeData(incomeChartData);
            } catch (error) {
                console.error('Error in Charts component:', error);
                setError(error.message || 'Error al cargar los datos de las gráficas');
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 md:col-span-1">
                <div className="text-center py-10 text-zinc-400">
                    Cargando gráficas...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 md:col-span-1">
                <div className="text-center py-10 text-red-500">
                    {error}
                </div>
            </div>
        );
    }

    if (!membershipData || !incomeData) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 md:col-span-1">
                <div className="text-center py-10 text-zinc-400">
                    No hay datos disponibles para las gráficas
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Gráfica de Paquetes y XFactors */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 flex flex-col items-center justify-center md:col-span-1">
                <h3 className="text-yellow-600 text-lg font-semibold mb-4">Gráfica Paquetes / XFactors</h3>
                <Doughnut 
                    data={membershipData} 
                    options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    padding: 20,
                                    font: {
                                        size: 12
                                    }
                                }
                            }
                        }
                    }}
                />
            </div>

            {/* Código de referido */}
            <ReferralCodeBox referralCode={user?.uId || ""} />
        </>
    );
}
