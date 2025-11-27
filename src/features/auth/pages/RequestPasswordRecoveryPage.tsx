import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSelector, Copyright, Input, Button } from '@/shared/components';
import { authService } from '@/infrastructure/services';
import { translateError } from '@/shared/utils';

/**
 * Página de solicitud de recuperación de contraseña
 */
export const RequestPasswordRecoveryPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const validate = () => {
    let isValid = true;

    if (!email) {
      setEmailError(t('auth.validation.emailRequired'));
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError(t('auth.validation.emailInvalid'));
      isValid = false;
    } else {
      setEmailError('');
    }

    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authService.requestPasswordRecovery({
        email,
        language: i18n.language,
      });

      // Mostrar mensaje de éxito
      setSuccess(true);
    } catch (err) {
      console.error('Error requesting password recovery:', err);
      const translatedError = translateError(err, t);
      setError(translatedError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/app/login');
  };

  // Si fue exitoso, mostrar el diseño de activación
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex justify-center -mb-14 -mt-14">
            <img 
              src="/logo.svg" 
              alt="Livelify" 
              className="h-96 w-96"
            />
          </div>

          {/* Success State */}
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {t('auth.passwordRecovery.successTitle')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('auth.passwordRecovery.successMessage')}
            </p>
            <p className="text-primary-600 font-semibold text-lg mb-4 break-all">
              {email}
            </p>
            <p className="text-gray-600 mb-4">
              {t('auth.passwordRecovery.successInstructions')}
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-amber-800 text-sm font-medium">
                {t('auth.passwordRecovery.expirationNotice')}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-left">
              <p className="text-blue-800 text-xs mb-1">
                {t('auth.passwordRecovery.didntReceiveEmail')}
              </p>
              <p className="text-blue-700 text-xs">
                {t('auth.passwordRecovery.checkSpamFolder')}
              </p>
            </div>

            <Button
              onClick={handleBack}
              className="w-full"
            >
              {t('auth.passwordRecovery.backToLogin')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-livelify flex flex-col items-center justify-between px-4 sm:px-6 py-4 sm:py-8 text-white">
      {/* Header con botón de volver */}
      <div className="w-full max-w-6xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <button
          onClick={handleBack}
          className="text-white/90 hover:text-white transition-colors flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('auth.passwordRecovery.backToLogin')}
        </button>
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <LanguageSelector />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl w-full text-center space-y-2 sm:space-y-4 py-2 sm:py-4">
        <>
            {/* Logo */}
            <div className="flex justify-center -mb-16 sm:-mb-20 md:-mb-24 -mt-16 sm:-mt-20 md:-mt-24">
              <img
                src="/logo_white.svg"
                alt="Livelify"
                className="h-56 w-56 sm:h-64 sm:w-64 md:h-72 md:w-72 lg:h-80 lg:w-80 xl:h-96 xl:w-96"
              />
            </div>

            {/* Título */}
            <div className="space-y-0.5 sm:space-y-1">
              <h1 className="text-3xl sm:text-3xl md:text-4xl font-bold mb-0">{t('auth.passwordRecovery.title')}</h1>
              <p className="text-xs sm:text-base md:text-lg text-white/90 px-2">{t('auth.passwordRecovery.subtitle')}</p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 sm:space-y-6 px-4 sm:px-0">
              {error && (
                <div className="p-3 sm:p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-white text-xs sm:text-sm">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="break-words">{error}</span>
                  </div>
                </div>
              )}

              <Input
                type="email"
                label={t('auth.passwordRecovery.email')}
                placeholder={t('auth.passwordRecovery.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
                autoComplete="email"
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-cream text-primary-700 font-semibold rounded-xl hover:bg-cream-dark transition-all transform hover:scale-105 shadow-lg text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? t('auth.passwordRecovery.sendingCode') : t('auth.passwordRecovery.sendCode')}
              </button>
            </form>
          </>
      </div>

      {/* Footer */}
      <div className="w-full max-w-md pb-2 sm:pb-4 px-4 sm:px-0">
        {(
          <p className="text-center text-white/80 text-xs sm:text-sm">
            {t('auth.login.noAccount')}{' '}
            <button
              onClick={() => navigate('/app/register')}
              className="text-white font-semibold hover:underline"
            >
              {t('auth.login.signUpFree')}
            </button>
          </p>
        )}
      </div>

      {/* Copyright dark */}
      <Copyright variant="dark" />
    </div>
  );
};

