import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-500',
    titleColor: 'text-green-800',
    messageColor: 'text-green-600',
    progressColor: 'bg-green-500',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-500',
    titleColor: 'text-red-800',
    messageColor: 'text-red-600',
    progressColor: 'bg-red-500',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-800',
    messageColor: 'text-amber-600',
    progressColor: 'bg-amber-500',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-800',
    messageColor: 'text-blue-600',
    progressColor: 'bg-blue-500',
  },
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const config = toastConfig[toast.type];
  const Icon = config.icon;
  const [progress, setProgress] = React.useState(100);

  React.useEffect(() => {
    // Animation de la barre de progression
    const duration = 5000; // 5 secondes
    const interval = 50; // Mise à jour toutes les 50ms
    const decrement = (100 / duration) * interval;
    
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - decrement;
        if (newProgress <= 0) {
          clearInterval(progressTimer);
          return 0;
        }
        return newProgress;
      });
    }, interval);

    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [toast.id, onRemove]);

  return (
    <div
      className={`
        relative overflow-hidden
        ${config.bgColor} ${config.borderColor}
        border-2 rounded-2xl shadow-2xl
        p-5 pr-12 min-w-[320px] max-w-[420px]
        animate-slide-in-right
        backdrop-blur-sm
        hover:shadow-3xl
        transition-all duration-300
        group
      `}
      style={{
        animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Effet de brillance au hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full" 
           style={{ transition: 'transform 0.6s ease-in-out' }} />
      
      <div className="flex items-start gap-4 relative z-10">
        {/* Icône avec animation */}
        <div className={`flex-shrink-0 ${config.iconColor} relative`}>
          <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center border-2 ${config.borderColor} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-base ${config.titleColor} leading-tight mb-1`}>
            {toast.title}
          </p>
          {toast.message && (
            <p className={`text-sm mt-1.5 ${config.messageColor} leading-relaxed`}>
              {toast.message}
            </p>
          )}
        </div>
      </div>

      {/* Bouton de fermeture amélioré */}
      <button
        onClick={() => onRemove(toast.id)}
        className="absolute top-4 right-4 p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 group/close"
        aria-label="Fermer"
      >
        <X className="w-4 h-4 text-gray-500 group-hover/close:text-gray-700 dark:group-hover/close:text-gray-300 transition-colors" />
      </button>

      {/* Barre de progression animée */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/5 dark:bg-white/5 overflow-hidden">
        <div 
          className={`h-full ${config.progressColor} transition-all duration-50 ease-linear shadow-sm`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
  }, []);

  const success = useCallback((title: string, message?: string) => showToast('success', title, message), [showToast]);
  const error = useCallback((title: string, message?: string) => showToast('error', title, message), [showToast]);
  const warning = useCallback((title: string, message?: string) => showToast('warning', title, message), [showToast]);
  const info = useCallback((title: string, message?: string) => showToast('info', title, message), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      
      {/* Toast Container - Amélioré avec animations */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none max-w-md">
        {toasts.map((toast, index) => (
          <div 
            key={toast.id} 
            className="pointer-events-auto"
            style={{
              animation: `slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s both`,
            }}
          >
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;















