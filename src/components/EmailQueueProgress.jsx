import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './EmailQueueProgress.css';
import { 
  faEnvelope, 
  faCheck, 
  faTimes, 
  faSpinner, 
  faMinimize, 
  faExpand,
  faTrash
} from '@fortawesome/free-solid-svg-icons';

const EmailQueueProgress = ({ batchId, onDismiss, onComplete }) => {
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
    progress: 0,
    isComplete: false,
    type: 'unknown'
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para consultar el progreso usando el servicio
  const fetchProgress = async () => {
    try {
      setError(null);
      
      // Usar el endpoint existente de historial con filtro por batchId
      const response = await fetch(`/api/v1/emails/history?batchId=${batchId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        const emails = data.data;
        const total = data.pagination?.totalRecords || emails.length;
        const sent = emails.filter(email => email.status === 'sent').length;
        const failed = emails.filter(email => email.status === 'failed').length;
        const pending = emails.filter(email => email.status === 'pending').length;
        const processed = sent + failed;
        const progress = total > 0 ? Math.round((processed / total) * 100) : 0;
        const isComplete = pending === 0 && total > 0;

        // Determinar el tipo basado en los datos
        const type = emails.length > 0 ? emails[0].type || 'custom' : 'custom';

        const newStats = {
          total,
          sent,
          failed,
          pending,
          progress,
          isComplete,
          type
        };

        setStats(newStats);

        // Si se completó, notificar al componente padre
        if (isComplete && !stats.isComplete && onComplete) {
          onComplete(batchId, newStats);
        }

        setLoading(false);
      } else {
        throw new Error('Formato de respuesta inválido');
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Polling cada 2 segundos para actualizar el progreso
  useEffect(() => {
    fetchProgress(); // Consulta inicial

    const interval = setInterval(() => {
      if (!stats.isComplete) {
        fetchProgress();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [batchId, stats.isComplete]);

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss(batchId);
    }
  };

  const getStatusColor = () => {
    if (error) return 'border-red-200 bg-red-50';
    if (stats.isComplete) {
      return stats.failed > 0 ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50';
    }
    return 'border-blue-200 bg-blue-50';
  };

  const getProgressBarColor = () => {
    if (stats.isComplete) {
      return stats.failed > 0 ? 'bg-yellow-500' : 'bg-green-500';
    }
    return 'bg-blue-500';
  };

  const getTypeLabel = () => {
    switch (stats.type) {
      case 'template': return 'Plantilla';
      case 'custom': return 'Personalizado';
      default: return 'Email';
    }
  };

  if (loading && !stats.total) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[320px] z-50">
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faSpinner} className="text-blue-500 animate-spin" />
          <span className="text-sm text-gray-600">Cargando información de la cola...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border-2 transition-all duration-300 z-50 ${getStatusColor()} ${isMinimized ? 'w-80' : 'min-w-[380px]'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon 
            icon={stats.isComplete ? faCheck : faSpinner} 
            className={`${stats.isComplete ? 'text-green-500' : 'text-blue-500 animate-spin'}`}
          />
          <span className="font-medium text-gray-800">
            {stats.isComplete ? 'Envío completado' : 'Enviando emails'}
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {getTypeLabel()}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
            title={isMinimized ? 'Expandir' : 'Minimizar'}
          >
            <FontAwesomeIcon icon={isMinimized ? faExpand : faMinimize} size="sm" />
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
            title="Descartar"
          >
            <FontAwesomeIcon icon={faTimes} size="sm" />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="p-4">
          {error ? (
            <div className="text-red-600 text-sm mb-3">
              <FontAwesomeIcon icon={faTimes} className="mr-2" />
              Error: {error}
            </div>
          ) : (
            <>
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progreso</span>
                  <span className="text-sm text-gray-600">{stats.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${getProgressBarColor()}`}
                    style={{ width: `${stats.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800">
                    {stats.sent + stats.failed}/{stats.total}
                  </div>
                  <div className="text-xs text-gray-500">Procesados</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800">
                    {stats.pending}
                  </div>
                  <div className="text-xs text-gray-500">Pendientes</div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1 text-green-600">
                  <FontAwesomeIcon icon={faCheck} size="sm" />
                  <span>{stats.sent} enviados</span>
                </div>
                {stats.failed > 0 && (
                  <div className="flex items-center gap-1 text-red-600">
                    <FontAwesomeIcon icon={faTimes} size="sm" />
                    <span>{stats.failed} fallidos</span>
                  </div>
                )}
              </div>

              {/* Completion Message */}
              {stats.isComplete && (
                <div className="mt-3 p-3 rounded-md bg-gray-50 border border-gray-200">
                  <div className="text-sm text-gray-700">
                    {stats.failed === 0 ? (
                      <span className="text-green-600 font-medium">
                        ✅ Todos los emails fueron enviados exitosamente
                      </span>
                    ) : (
                      <span className="text-yellow-600 font-medium">
                        ⚠️ Completado con {stats.failed} error(es)
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Minimized View */}
      {isMinimized && (
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{stats.sent + stats.failed}/{stats.total}</span>
              {stats.failed > 0 && (
                <span className="text-red-500">({stats.failed} fallos)</span>
              )}
            </div>
            <div className="w-16 bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-500 ${getProgressBarColor()}`}
                style={{ width: `${stats.progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailQueueProgress;