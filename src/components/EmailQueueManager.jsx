import React from 'react';
import EmailQueueProgress from './EmailQueueProgress';
import useEmailQueue from '../hooks/useEmailQueue';

const EmailQueueManager = () => {
  const { 
    activeQueues, 
    completedQueues, 
    dismissQueue, 
    onQueueComplete,
    clearAllQueues 
  } = useEmailQueue();

  // Combinar colas activas y completadas para mostrar
  const allQueues = [...activeQueues, ...completedQueues];

  if (allQueues.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Botón para limpiar todas las colas si hay muchas */}
      {allQueues.length > 3 && (
        <div className="mb-2 flex justify-end">
          <button
            onClick={clearAllQueues}
            className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-1 rounded-md shadow-lg transition-colors"
            title="Limpiar todas las colas"
          >
            Limpiar todas ({allQueues.length})
          </button>
        </div>
      )}

      {/* Renderizar colas - máximo 3 visibles, el resto se apilan */}
      <div className="space-y-2">
        {allQueues.slice(0, 3).map((queue, index) => (
          <div
            key={queue.batchId}
            style={{
              transform: `translateY(${index * -8}px)`,
              zIndex: 50 - index
            }}
          >
            <EmailQueueProgress
              batchId={queue.batchId}
              onDismiss={dismissQueue}
              onComplete={onQueueComplete}
            />
          </div>
        ))}

        {/* Indicador si hay más colas */}
        {allQueues.length > 3 && (
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-2 text-center text-sm text-gray-600 shadow-sm">
            +{allQueues.length - 3} cola(s) más
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailQueueManager;