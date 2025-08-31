import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'react-hot-toast';
import axios from 'axios';
import EmailDetailModal from './EmailDetailModal';

// Componentes de UI
import { 
  FaEnvelope, 
  FaCheck, 
  FaTimes, 
  FaClock, 
  FaFileAlt, 
  FaUserAlt,
  FaCalendarAlt,
  FaFilter,
  FaSearch,
  FaDownload,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

const EmailHistory = () => {
  // Estados
  const [loading, setLoading] = useState(true);
  const [emails, setEmails] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10
  });
  const [selectedEmail, setSelectedEmail] = useState(null);
  
  // Filtros
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    startDate: null,
    endDate: null,
    search: '',
    page: 1,
    limit: 10
  });

  // Obtener historial de emails
  const fetchEmailHistory = async () => {
    try {
      setLoading(true);
      
      // Construir query params
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.startDate) queryParams.append('startDate', filters.startDate.toISOString().split('T')[0]);
      if (filters.endDate) queryParams.append('endDate', filters.endDate.toISOString().split('T')[0]);
      if (filters.search) queryParams.append('search', filters.search);
      queryParams.append('page', filters.page);
      queryParams.append('limit', filters.limit);
      
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`/api/v1/emails/history?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setEmails(response.data.data);
        setPagination(response.data.pagination);
      } else {
        toast.error('Error al cargar el historial de emails');
      }
    } catch (error) {
      console.error('Error fetching email history:', error);
      toast.error('Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchEmailHistory();
  }, [filters.page, filters.limit]);

  // Aplicar filtros
  const handleApplyFilters = (e) => {
    e.preventDefault();
    setFilters({...filters, page: 1}); // Reset to first page
    fetchEmailHistory();
  };

  // Resetear filtros
  const handleResetFilters = () => {
    setFilters({
      status: '',
      type: '',
      startDate: null,
      endDate: null,
      search: '',
      page: 1,
      limit: 10
    });
    fetchEmailHistory();
  };

  // Cambiar página
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setFilters({...filters, page: newPage});
  };

  // Exportar a CSV
  const handleExportCSV = async () => {
    try {
      toast.loading('Generando archivo CSV...');
      
      // Construir query params para exportación (sin paginación)
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.startDate) queryParams.append('startDate', filters.startDate.toISOString().split('T')[0]);
      if (filters.endDate) queryParams.append('endDate', filters.endDate.toISOString().split('T')[0]);
      if (filters.search) queryParams.append('search', filters.search);
      queryParams.append('export', 'csv');
      
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`/api/v1/emails/history?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      // Crear archivo y descargarlo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `email-history-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.dismiss();
      toast.success('Archivo CSV generado correctamente');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.dismiss();
      toast.error('Error al generar el archivo CSV');
    }
  };

  // Renderizar icono de estado
  const renderStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <FaCheck className="text-green-500" title="Enviado" />;
      case 'failed':
        return <FaTimes className="text-red-500" title="Fallido" />;
      case 'pending':
        return <FaClock className="text-yellow-500" title="Pendiente" />;
      default:
        return null;
    }
  };

  // Renderizar tipo de email
  const renderEmailType = (type) => {
    switch (type) {
      case 'custom':
        return <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">Personalizado</span>;
      case 'template':
        return <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800">Plantilla</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Historial de Emails</h2>
      
      {/* Filtros */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex items-center mb-2">
          <FaFilter className="mr-2 text-gray-600" />
          <h3 className="font-semibold">Filtros</h3>
        </div>
        
        <form onSubmit={handleApplyFilters} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">Todos</option>
              <option value="sent">Enviados</option>
              <option value="failed">Fallidos</option>
              <option value="pending">Pendientes</option>
            </select>
          </div>
          
          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
            >
              <option value="">Todos</option>
              <option value="custom">Personalizado</option>
              <option value="template">Plantilla</option>
            </select>
          </div>
          
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <div className="relative">
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email, nombre o asunto..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          
          {/* Fecha inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
            <div className="relative">
              <DatePicker
                selected={filters.startDate}
                onChange={(date) => setFilters({...filters, startDate: date})}
                className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                dateFormat="dd/MM/yyyy"
                placeholderText="Seleccionar fecha..."
                locale={es}
              />
              <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          
          {/* Fecha fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
            <div className="relative">
              <DatePicker
                selected={filters.endDate}
                onChange={(date) => setFilters({...filters, endDate: date})}
                className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                dateFormat="dd/MM/yyyy"
                placeholderText="Seleccionar fecha..."
                locale={es}
                minDate={filters.startDate}
              />
              <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          
          {/* Botones */}
          <div className="flex items-end space-x-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Aplicar filtros
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Resetear
            </button>
          </div>
        </form>
      </div>
      
      {/* Acciones */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-sm text-gray-600">
            Mostrando {pagination.totalRecords > 0 ? (pagination.currentPage - 1) * pagination.limit + 1 : 0} - {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} de {pagination.totalRecords} registros
          </span>
        </div>
        <div>
          <button
            onClick={handleExportCSV}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <FaDownload className="mr-2" />
            Exportar CSV
          </button>
        </div>
      </div>
      
      {/* Tabla de emails */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destinatario</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asunto/Plantilla</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-10 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                  </div>
                  <p className="mt-2 text-gray-500">Cargando historial...</p>
                </td>
              </tr>
            ) : emails.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-10 text-center">
                  <FaEnvelope className="mx-auto text-gray-300 text-4xl mb-2" />
                  <p className="text-gray-500">No se encontraron registros</p>
                </td>
              </tr>
            ) : (
              emails.map((email) => (
                <tr key={email._id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      {renderStatusIcon(email.status)}
                      <span className="ml-2 text-sm capitalize">{email.status}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {renderEmailType(email.type)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <FaUserAlt className="text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{email.recipient.name}</div>
                        <div className="text-sm text-gray-500">{email.recipient.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {email.type === 'custom' ? (
                      <div className="text-sm text-gray-900">{email.subject}</div>
                    ) : (
                      <div className="flex items-center">
                        <FaFileAlt className="text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">{email.templateName}</div>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-900">
                      {format(new Date(email.createdAt), 'dd/MM/yyyy')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(email.createdAt), 'HH:mm:ss')}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => setSelectedEmail(email)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Ver detalles
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.limit}
              onChange={(e) => setFilters({...filters, limit: Number(e.target.value), page: 1})}
            >
              <option value="10">10 por página</option>
              <option value="25">25 por página</option>
              <option value="50">50 por página</option>
              <option value="100">100 por página</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page === 1}
              className={`flex items-center px-3 py-2 rounded-md ${
                filters.page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <FaChevronLeft className="mr-1" />
              Anterior
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                // Lógica para mostrar páginas cercanas a la actual
                let pageToShow;
                if (pagination.totalPages <= 5) {
                  pageToShow = i + 1;
                } else if (filters.page <= 3) {
                  pageToShow = i + 1;
                } else if (filters.page >= pagination.totalPages - 2) {
                  pageToShow = pagination.totalPages - 4 + i;
                } else {
                  pageToShow = filters.page - 2 + i;
                }
                
                return (
                  <button
                    key={i}
                    onClick={() => handlePageChange(pageToShow)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${
                      filters.page === pageToShow
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {pageToShow}
                  </button>
                );
              })}
              
              {pagination.totalPages > 5 && filters.page < pagination.totalPages - 2 && (
                <>
                  <span className="px-2">...</span>
                  <button
                    onClick={() => handlePageChange(pagination.totalPages)}
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                  >
                    {pagination.totalPages}
                  </button>
                </>
              )}
            </div>
            
            <button
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={filters.page === pagination.totalPages}
              className={`flex items-center px-3 py-2 rounded-md ${
                filters.page === pagination.totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Siguiente
              <FaChevronRight className="ml-1" />
            </button>
          </div>
        </div>
      )}
      
      {/* Modal de detalles */}
      {selectedEmail && (
        <EmailDetailModal 
          email={selectedEmail} 
          onClose={() => setSelectedEmail(null)} 
        />
      )}
    </div>
  );
};

export default EmailHistory;