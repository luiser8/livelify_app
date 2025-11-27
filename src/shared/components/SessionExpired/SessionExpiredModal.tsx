import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { env } from '@/config/env';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal que se muestra cuando la sesión del usuario expira
 */
export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ isOpen }) => {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(env.SESSION_EXPIRE_SECONDS);

  // Función para redirigir al login
  const handleLogin = () => {
    localStorage.clear();
    window.location.href = '/app/login';
  };

  // Resetear countdown cuando aparece el modal
  useEffect(() => {
    if (isOpen) {
      setCountdown(env.SESSION_EXPIRE_SECONDS);
    }
  }, [isOpen]);

  // Countdown
  useEffect(() => {
    if (!isOpen) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Cuando llega a 0, redirigir al login
      handleLogin();
    }
  }, [isOpen, countdown]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - mismo estilo que ConfirmModal */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleLogin}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
        {/* Icono */}
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* Contenido */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
          {t('sessionExpired.title')}
        </h2>
        <p className="text-gray-600 text-center mb-6">
          {t('sessionExpired.message')}
        </p>

        {/* Countdown */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-center">
          <p className="text-sm text-amber-800">
            {t('sessionExpired.autoRedirect')} <span className="font-bold text-xl">{countdown}</span> {t('sessionExpired.seconds')}
          </p>
        </div>

        {/* Botón */}
        <button
          onClick={handleLogin}
          className="w-full py-3 px-6 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all shadow-lg"
        >
          {t('sessionExpired.goToLogin')}
        </button>
      </div>
    </div>
  );
};
