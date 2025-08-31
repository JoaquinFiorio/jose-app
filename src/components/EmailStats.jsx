import React, { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Componentes de UI
import { 
  FaCalendarAlt,
  FaSync
} from 'react-icons/fa';

const EmailStats = () => {
  // Estados
  const [loading, setLoading] = useState(true);
  const [generalStats, setGeneralStats] = useState(null);
  const [templateStats, setTemplateStats] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 30), // Últimos 30 días por defecto
    endDate: new Date()
  });

  // Colores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  const STATUS_COLORS = {
    sent: '#00C49F',
    failed: '#FF8042',
    pending: '#FFBB28'
  };

  // Obtener estadísticas generales
  const fetchGeneralStats = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      queryParams.append('startDate', dateRange.startDate.toISOString().split('T')[0]);
      queryParams.append('endDate', dateRange.endDate.toISOString().split('T')[0]);
      
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`/api/v1/emails/history/stats?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setGeneralStats(response.data.data);
      } else {
        toast.error('Error al cargar estadísticas generales');
      }
    } catch (error) {
      console.error('Error fetching general stats:', error);
      toast.error('Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  };

  // Obtener estadísticas por plantilla
  const fetchTemplateStats = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      queryParams.append('startDate', dateRange.startDate.toISOString().split('T')[0]);
      queryParams.append('endDate', dateRange.endDate.toISOString().split('T')[0]);
      
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`/api/v1/emails/history/templates?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setTemplateStats(response.data.data);
      } else {
        toast.error('Error al cargar estadísticas por plantilla');
      }
    } catch (error) {
      console.error('Error fetching template stats:', error);
      toast.error('Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchGeneralStats();
    fetchTemplateStats();
  }, []);

  // Aplicar filtro de fechas
  const handleApplyDateFilter = () => {
    fetchGeneralStats();
    fetchTemplateStats();
  };

  // Preparar datos para gráfico de estado
  const prepareStatusData = () => {
    if (!generalStats) return [];
    
    return [
      { name: 'Enviados', value: generalStats.sentEmails, color: STATUS_COLORS.sent },
      { name: 'Fallidos', value: generalStats.failedEmails, color: STATUS_COLORS.failed },
      { name: 'Pendientes', value: generalStats.pendingEmails, color: STATUS_COLORS.pending }
    ];
  };

  // Preparar datos para gráfico de tipo
  const prepareTypeData = () => {
    if (!generalStats) return [];
    
    return [
      { name: 'Personalizados', value: generalStats.customEmails },
      { name: 'Plantillas', value: generalStats.templateEmails }
    ];
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Estadísticas de Emails</h2>
      
      {/* Filtro de fechas */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
            <div className="relative">
              <DatePicker
                selected={dateRange.startDate}
                onChange={(date) => setDateRange({...dateRange, startDate: date})}
                className="border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                dateFormat="dd/MM/yyyy"
                locale={es}
              />
              <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
            <div className="relative">
              <DatePicker
                selected={dateRange.endDate}
                onChange={(date) => setDateRange({...dateRange, endDate: date})}
                className="border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                dateFormat="dd/MM/yyyy"
                minDate={dateRange.startDate}
                locale={es}
              />
              <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleApplyDateFilter}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
            >
              <FaSync className="mr-2" />
              Actualizar
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      ) : !generalStats ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No hay datos disponibles</p>
        </div>
      ) : (
        <>
          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Total de Emails</h3>
              <p className="text-3xl font-bold">{generalStats.totalEmails}</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Tasa de Éxito</h3>
              <p className="text-3xl font-bold">{generalStats.successRate}%</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Emails Personalizados</h3>
              <p className="text-3xl font-bold">{generalStats.customEmails}</p>
            </div>
            
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Emails con Plantilla</h3>
              <p className="text-3xl font-bold">{generalStats.templateEmails}</p>
            </div>
          </div>
          
          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Gráfico de estado */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Estado de Emails</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={prepareStatusData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {prepareStatusData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} emails`, 'Cantidad']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Gráfico de tipo */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Tipos de Email</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={prepareTypeData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} emails`, 'Cantidad']} />
                    <Legend />
                    <Bar dataKey="value" name="Cantidad" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Estadísticas por plantilla */}
          {templateStats.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Estadísticas por Plantilla</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plantilla</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Enviados</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exitosos</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fallidos</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasa de Éxito</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {templateStats.map((template) => (
                      <tr key={template.templateId} className="hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm font-medium text-gray-900">{template.templateName}</td>
                        <td className="py-4 px-4 text-sm text-gray-500">{template.total}</td>
                        <td className="py-4 px-4 text-sm text-gray-500">{template.sent}</td>
                        <td className="py-4 px-4 text-sm text-gray-500">{template.failed}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${template.successRate}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm text-gray-700">{template.successRate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmailStats;