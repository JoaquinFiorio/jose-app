import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  FaEnvelope, 
  FaUser, 
  FaCalendarAlt, 
  FaClock,
  FaExclamationTriangle,
  FaFileAlt,
  FaTimes,
  FaCheck
} from 'react-icons/fa';

const EmailDetailModal = ({ email, onClose }) => {
  if (!email) return null;

  // Renderizar icono de estado
  const renderStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <FaCheck className="text-green-500 text-xl" />;
      case 'failed':
        return <FaExclamationTriangle className="text-red-500 text-xl" />;
      case 'pending':
        return <FaClock className="text-yellow-500 text-xl" />;
      default:
        return null;
    }
  };

  // Renderizar badge de estado
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'sent':
        return <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">Enviado</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">Fallido</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">Pendiente</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4">
          <div className="flex items-center">
            <FaEnvelope className="text-blue-600 mr-2" />
            <h3 className="text-xl font-semibold">Detalles del Email</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Estado */}
          <div className="flex items-center mb-6">
            {renderStatusIcon(email.status)}
            <div className="ml-3">
              <h4 className="text-lg font-medium">Estado</h4>
              <div className="mt-1">{renderStatusBadge(email.status)}</div>
            </div>
          </div>
          
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Destinatario */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <FaUser className="text-gray-500 mr-2" />
                <h4 className="font-medium">Destinatario</h4>
              </div>
              <p className="text-gray-800 font-medium">{email.recipient.name}</p>
              <p className="text-gray-600">{email.recipient.email}</p>
              <p className="text-xs text-gray-500 mt-1">ID: {email.recipient._id}</p>
            </div>
            
            {/* Fecha */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <FaCalendarAlt className="text-gray-500 mr-2" />
                <h4 className="font-medium">Fecha</h4>
              </div>
              <p className="text-gray-800">
                {format(new Date(email.createdAt), 'dd MMMM yyyy', { locale: es })}
              </p>
              <p className="text-gray-600">
                {format(new Date(email.createdAt), 'HH:mm:ss')}
              </p>
              {email.sentAt && (
                <p className="text-xs text-gray-500 mt-1">
                  Enviado: {format(new Date(email.sentAt), 'dd/MM/yyyy HH:mm:ss')}
                </p>
              )}
            </div>
          </div>
          
          {/* Tipo de email */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">Tipo de Email</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              {email.type === 'custom' ? (
                <div className="flex items-center">
                  <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 mr-2">Personalizado</span>
                  <span className="text-gray-700">Email con contenido personalizado</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800 mr-2">Plantilla</span>
                  <span className="text-gray-700">Email basado en plantilla</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Contenido */}
          {email.type === 'custom' ? (
            <div className="mb-6">
              <h4 className="font-medium mb-2">Contenido</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-lg mb-2">{email.subject}</h5>
                <div 
                  className="prose max-w-none border-t pt-3 mt-2"
                  dangerouslySetInnerHTML={{ __html: email.message }}
                />
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <h4 className="font-medium mb-2">Plantilla</h4>
              <div className="bg-gray-50 p-4 rounded-lg flex items-start">
                <FaFileAlt className="text-gray-500 mr-3 mt-1" />
                <div>
                  <h5 className="font-medium">{email.templateName}</h5>
                  <p className="text-gray-600 text-sm mt-1">ID: {email.templateId}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Metadatos */}
          {email.metadata && (
            <div className="mb-6">
              <h4 className="font-medium mb-2">Metadatos</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  {email.metadata.batchId && (
                    <div>
                      <p className="text-sm text-gray-500">ID de Lote</p>
                      <p className="text-gray-800 font-mono text-sm">{email.metadata.batchId}</p>
                    </div>
                  )}
                  {email.metadata.retryCount !== undefined && (
                    <div>
                      <p className="text-sm text-gray-500">Intentos</p>
                      <p className="text-gray-800">{email.metadata.retryCount}</p>
                    </div>
                  )}
                  {email.metadata.processingTime !== undefined && (
                    <div>
                      <p className="text-sm text-gray-500">Tiempo de Procesamiento</p>
                      <p className="text-gray-800">{email.metadata.processingTime} ms</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Error */}
          {email.status === 'failed' && email.error && (
            <div className="mb-6">
              <h4 className="font-medium mb-2 text-red-600">Error</h4>
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-red-700 font-mono text-sm whitespace-pre-wrap">{email.error}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailDetailModal;