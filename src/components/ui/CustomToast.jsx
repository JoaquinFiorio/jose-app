import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, XCircle, AlertCircle, Info, X, Loader2 } from 'lucide-react';

const TOAST_TYPES = ['success', 'error', 'warning', 'info', 'loading'];
const TOAST_POSITIONS = [
  'top-left', 'top-center', 'top-right',
  'bottom-left', 'bottom-center', 'bottom-right'
];

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
        return `${baseStyles} bg-emerald-50/90 border-emerald-200/50 text-emerald-900`;
      case 'error':
        return `${baseStyles} bg-red-50/90 border-red-200/50 text-red-900`;
      case 'warning':
        return `${baseStyles} bg-amber-50/90 border-amber-200/50 text-amber-900`;
      case 'info':
        return `${baseStyles} bg-blue-50/90 border-blue-200/50 text-blue-900`;
      case 'loading':
        return `${baseStyles} bg-blue-50/90 border-blue-200/50 text-blue-900`;
      default:
        return `${baseStyles} bg-white/90 border-gray-200/50 text-gray-900`;
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

ToastComponent.propTypes = {
  toast: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(TOAST_TYPES).isRequired,
    title: PropTypes.string,
    message: PropTypes.string.isRequired,
    duration: PropTypes.number,
    position: PropTypes.oneOf(TOAST_POSITIONS),
    dismissible: PropTypes.bool,
    action: PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
    }),
  }).isRequired,
  onDismiss: PropTypes.func.isRequired,
};

// Toast Container
const ToastContainer = ({ position = 'bottom-right', className = '' }) => {
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
      success: (message, options = {}) => 
        addToast({ type: 'success', message, ...options }),
      error: (message, options = {}) => 
        addToast({ type: 'error', message, ...options }),
      warning: (message, options = {}) => 
        addToast({ type: 'warning', message, ...options }),
      info: (message, options = {}) => 
        addToast({ type: 'info', message, ...options }),
      loading: (message, options = {}) => 
        addToast({ type: 'loading', message, duration: 0, ...options }),
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
        return `${baseStyles} bottom-0 right-0`;
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

ToastContainer.propTypes = {
  position: PropTypes.oneOf(TOAST_POSITIONS),
  className: PropTypes.string,
};

export default ToastContainer; 