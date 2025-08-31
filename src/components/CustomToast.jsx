import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X, Loader2 } from 'lucide-react';

// Toast Types (comentario informativo)
// ToastType: 'success' | 'error' | 'warning' | 'info' | 'loading'
// ToastPosition: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'

// Toast Component
const ToastComponent = ({ toast, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Entrada animada
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (toast.duration && toast.duration > 0 && toast.type !== 'loading') {
      const timer = setTimeout(() => {
        handleDismiss();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.type]);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 300);
  };

  const getIcon = () => {
    const iconProps = "w-5 h-5 flex-shrink-0";
    switch (toast.type) {
      case 'success':
        return <CheckCircle className={`${iconProps} text-emerald-500`} />;
      case 'error':
        return <XCircle className={`${iconProps} text-red-500`} />;
      case 'warning':
        return <AlertCircle className={`${iconProps} text-amber-500`} />;
      case 'info':
        return <Info className={`${iconProps} text-blue-500`} />;
      case 'loading':
        return <Loader2 className={`${iconProps} text-blue-500 animate-spin`} />;
      default:
        return null;
    }
  };

  const getToastStyles = () => {
    const baseStyles = `
      relative flex items-start gap-3 p-4 rounded-xl shadow-lg backdrop-blur-sm
      border transition-all duration-300 ease-out max-w-sm w-full
      ${isVisible && !isLeaving ? 'translate-x-0 opacity-100 scale-100' : 
        isLeaving ? 'translate-x-full opacity-0 scale-95' : 
        'translate-x-full opacity-0 scale-95'}
    `;
    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-emerald-500 border-emerald-700 text-white`;
      case 'error':
        return `${baseStyles} bg-red-500 border-red-700 text-white`;
      case 'warning':
        return `${baseStyles} bg-amber-400 border-amber-600 text-white`;
      case 'info':
        return `${baseStyles} bg-blue-500 border-blue-700 text-white`;
      case 'loading':
        return `${baseStyles} bg-blue-500 border-blue-700 text-white`;
      default:
        return `${baseStyles} bg-gray-800 border-gray-700 text-white`;
    }
  };

  return (
    <div
      className={getToastStyles()}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Progress bar para loading */}
      {toast.type === 'loading' && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-200/30 rounded-t-xl overflow-hidden">
          <div className="h-full bg-blue-500 animate-pulse" />
        </div>
      )}
      {/* Icono */}
      <div className="pt-0.5">
        {getIcon()}
      </div>
      {/* Contenido */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="font-semibold text-sm leading-5 mb-1">
            {toast.title}
          </h4>
        )}
        <p className="text-sm leading-5 break-words">
          {toast.message}
        </p>
        {/* Acción */}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-xs font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current rounded"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      {/* Botón de cerrar */}
      {toast.dismissible !== false && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current transition-colors"
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// Toast Container
const ToastContainer = ({ 
  position = 'top-right',
  className = ''
}) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = {
      id,
      duration: 5000,
      dismissible: true,
      ...toast,
    };
    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Exponer métodos globalmente para facilitar el uso
  useEffect(() => {
    window.toast = {
      success: (message, options) => 
        addToast({ type: 'success', message, ...(options || {}) }),
      error: (message, options) => 
        addToast({ type: 'error', message, ...(options || {}) }),
      warning: (message, options) => 
        addToast({ type: 'warning', message, ...(options || {}) }),
      info: (message, options) => 
        addToast({ type: 'info', message, ...(options || {}) }),
      loading: (message, options) => 
        addToast({ type: 'loading', message, duration: 0, ...(options || {}) }),
      dismiss: removeToast,
    };
  }, [addToast, removeToast]);

  const getContainerStyles = () => {
    const baseStyles = 'fixed z-50 flex flex-col gap-2 p-4 pointer-events-none';
    switch (position) {
      case 'top-left':
        return `${baseStyles} top-0 left-0`;
      case 'top-center':
        return `${baseStyles} top-0 left-1/2 transform -translate-x-1/2`;
      case 'top-right':
        return `${baseStyles} top-0 right-0`;
      case 'bottom-left':
        return `${baseStyles} bottom-0 left-0`;
      case 'bottom-center':
        return `${baseStyles} bottom-0 left-1/2 transform -translate-x-1/2`;
      case 'bottom-right':
        return `${baseStyles} bottom-0 right-0`;
      default:
        return `${baseStyles} top-0 right-0`;
    }
  };

  return (
    <div className={`${getContainerStyles()} ${className}`}>
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastComponent
            toast={toast}
            onDismiss={removeToast}
          />
        </div>
      ))}
    </div>
  );
};

// Demo Component
const ToastDemo = () => {
  const showToast = (type) => {
    const messages = {
      success: '¡Operación completada exitosamente!',
      error: 'Ha ocurrido un error inesperado',
      warning: 'Revisa la información antes de continuar',
      info: 'Nueva información disponible',
      loading: 'Procesando tu solicitud...'
    };
    const titles = {
      success: 'Éxito',
      error: 'Error',
      warning: 'Advertencia',
      info: 'Información',
      loading: 'Cargando'
    };
    if (typeof window !== 'undefined' && window.toast) {
      window.toast[type](messages[type], {
        title: titles[type],
        action: type === 'error' ? {
          label: 'Reintentar',
          onClick: () => console.log('Reintentando...')
        } : undefined
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Modern Toast Component
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Un sistema de notificaciones moderno, accesible y responsivo
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6">
            Prueba los diferentes tipos de toast
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <button
              onClick={() => showToast('success')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <CheckCircle className="w-4 h-4" />
              Success
            </button>
            <button
              onClick={() => showToast('error')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <XCircle className="w-4 h-4" />
              Error
            </button>
            <button
              onClick={() => showToast('warning')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              <AlertCircle className="w-4 h-4" />
              Warning
            </button>
            <button
              onClick={() => showToast('info')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Info className="w-4 h-4" />
              Info
            </button>
            <button
              onClick={() => showToast('loading')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              <Loader2 className="w-4 h-4" />
              Loading
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">
              Características
            </h3>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Animaciones suaves de entrada y salida
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Diseño responsivo y accesible
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Múltiples posiciones de ubicación
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Auto-dismiss configurable
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Acciones personalizables
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">
              Uso
            </h3>
            <div className="text-sm text-slate-600 space-y-2">
              <p className="font-mono bg-slate-100 p-2 rounded">
                toast.success("Mensaje de éxito")
              </p>
              <p className="font-mono bg-slate-100 p-2 rounded">
                toast.error("Mensaje de error")
              </p>
              <p className="font-mono bg-slate-100 p-2 rounded">
                toast.loading("Cargando...")
              </p>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" />
    </div>
  );
};

export default ToastDemo;