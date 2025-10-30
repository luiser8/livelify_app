import { useEffect } from 'react';

export type AlertType = 'error' | 'warning' | 'success' | 'info';

export interface AlertBannerProps {
  /** El tipo de alerta determina el color y el ícono */
  type: AlertType;
  /** Título principal de la alerta */
  title: string;
  /** Mensaje detallado de la alerta */
  message: string;
  /** Función que se ejecuta al cerrar la alerta */
  onClose: () => void;
  /** Duración en milisegundos antes de auto-cerrar (default: 5000). Si es 0, no se auto-cierra */
  autoCloseDuration?: number;
  /** Si se muestra el botón de cerrar (default: true) */
  showCloseButton?: boolean;
}

const alertStyles: Record<AlertType, {
  container: string;
  border: string;
  icon: string;
  title: string;
  message: string;
  closeButton: string;
}> = {
  error: {
    container: 'bg-red-50',
    border: 'border-red-500',
    icon: 'text-red-500',
    title: 'text-red-800',
    message: 'text-red-700',
    closeButton: 'text-red-500 hover:text-red-700'
  },
  warning: {
    container: 'bg-amber-50',
    border: 'border-amber-500',
    icon: 'text-amber-500',
    title: 'text-amber-800',
    message: 'text-amber-700',
    closeButton: 'text-amber-500 hover:text-amber-700'
  },
  success: {
    container: 'bg-green-50',
    border: 'border-green-500',
    icon: 'text-green-500',
    title: 'text-green-800',
    message: 'text-green-700',
    closeButton: 'text-green-500 hover:text-green-700'
  },
  info: {
    container: 'bg-blue-50',
    border: 'border-blue-500',
    icon: 'text-blue-500',
    title: 'text-blue-800',
    message: 'text-blue-700',
    closeButton: 'text-blue-500 hover:text-blue-700'
  }
};

const AlertIcon = ({ type }: { type: AlertType }) => {
  const iconClass = alertStyles[type].icon;

  switch (type) {
    case 'error':
      return (
        <svg className={`h-6 w-6 ${iconClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'warning':
      return (
        <svg className={`h-6 w-6 ${iconClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case 'success':
      return (
        <svg className={`h-6 w-6 ${iconClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'info':
      return (
        <svg className={`h-6 w-6 ${iconClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

/**
 * Componente de alerta/banner reutilizable
 * 
 * @example
 * ```tsx
 * <AlertBanner
 *   type="error"
 *   title="Error"
 *   message="Something went wrong"
 *   onClose={() => setShowAlert(false)}
 *   autoCloseDuration={5000}
 * />
 * ```
 */
export const AlertBanner = ({
  type,
  title,
  message,
  onClose,
  autoCloseDuration = 5000,
  showCloseButton = true
}: AlertBannerProps) => {
  const styles = alertStyles[type];

  useEffect(() => {
    if (autoCloseDuration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);

      return () => clearTimeout(timer);
    }
  }, [autoCloseDuration, onClose]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      <div className={`${styles.container} border-l-4 ${styles.border} p-4 mx-4 mt-4 rounded-lg shadow-lg`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertIcon type={type} />
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-bold ${styles.title}`}>
              {title}
            </h3>
            <p className={`text-sm ${styles.message} mt-1`}>
              {message}
            </p>
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className={`ml-3 flex-shrink-0 inline-flex ${styles.closeButton} focus:outline-none`}
              aria-label="Close alert"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

