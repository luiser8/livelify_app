import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { userService } from '@/infrastructure/services/userService';
import { translateError } from '@/shared/utils';
import { Button } from '@/shared/components';

/**
 * Página de activación de cuenta
 * Lee el hash de la URL y activa la cuenta del usuario
 */
export const ActivateAccountPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const activateAccount = async () => {
      const hash = searchParams.get('hash');

      if (!hash) {
        setStatus('error');
        setErrorMessage(t('errors.invalidActivationLink') || 'El enlace de activación no es válido');
        return;
      }

      try {
        await userService.activateAccount(hash);
        setStatus('success');
      } catch (error) {
        console.error('Error activating account:', error);
        const translatedError = translateError(error, t);
        setErrorMessage(translatedError);
        setStatus('error');
      }
    };

    activateAccount();
  }, [searchParams, t]);

  const handleGoToLogin = () => {
    navigate('/app/login');
  };

  const handleGoToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Logo */}
        <div className="flex justify-center -mb-16 sm:-mb-20 md:-mb-24 -mt-16 sm:-mt-20 md:-mt-24">
          <img
            src="/logo.svg"
            alt="Livelify"
            className="h-56 w-56 sm:h-64 sm:w-64 md:h-72 md:w-72 lg:h-80 lg:w-80 xl:h-96 xl:w-96"
          />
        </div>

        {/* Loading State */}
        {status === 'loading' && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {t('auth.activatingAccount') || 'Activando tu cuenta'}
            </h2>
            <p className="text-gray-600">
              {t('auth.pleaseWait') || 'Por favor espera un momento...'}
            </p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {t('auth.accountActivated') || '¡Cuenta activada!'}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('auth.accountActivatedMessage') || 'Tu cuenta ha sido activada exitosamente. Ahora puedes iniciar sesión.'}
            </p>
            <Button
              onClick={handleGoToLogin}
              className="w-full"
            >
              {t('auth.goToLogin') || 'Ir a iniciar sesión'}
            </Button>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {t('auth.activationError') || 'Error al activar la cuenta'}
            </h2>
            <p className="text-gray-600 mb-6">
              {errorMessage}
            </p>
            <div className="space-y-3">
              <Button
                onClick={handleGoToLogin}
                className="w-full"
              >
                {t('auth.goToLogin') || 'Ir a iniciar sesión'}
              </Button>
              <Button
                onClick={handleGoToHome}
                variant="outline"
                className="w-full"
              >
                {t('common.goHome') || 'Volver al inicio'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

