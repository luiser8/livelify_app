import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSelector, Copyright, Input, Button } from '@/shared/components';
import { authService } from '@/infrastructure/services';
import { translateError } from '@/shared/utils';
import { useAuth } from '@/features/auth/context';
import { loginUseCase } from '@/core/usecases/auth/loginUseCase';

/**
 * Página de restablecimiento de contraseña
 */
export const ResetPasswordPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const [hash, setHash] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string>('');
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const [success, setSuccess] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  useEffect(() => {
    // Capturar el hash desde la URL (query parameter)
    const hashParam = searchParams.get('hash') || searchParams.get('token');
    const emailParam = searchParams.get('email');
    
    if (!hashParam) {
      setInvalidLink(true);
    } else {
      setHash(hashParam);
      if (emailParam) {
        setEmail(emailParam);
      }
    }
  }, [searchParams]);

  const validate = () => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};
    let isValid = true;

    if (!newPassword) {
      newErrors.newPassword = t('auth.validation.passwordRequired');
      isValid = false;
    } else if (newPassword.length < 6) {
      newErrors.newPassword = t('auth.validation.passwordMinLength');
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t('auth.validation.confirmPasswordRequired');
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t('auth.validation.passwordsNotMatch');
      isValid = false;
    }

    setErrors(newErrors);
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
      const response = await authService.resetPassword({
        hash,
        newPassword,
        language: i18n.language,
      });

      // Obtener el email de la respuesta o del parámetro de URL
      const userEmail = response.email || email;

      // Mostrar mensaje de éxito
      setSuccess(true);

      // Intentar hacer login automático si tenemos el email
      if (userEmail) {
        setIsLoggingIn(true);
        
        // Esperar 2 segundos para mostrar el mensaje de éxito
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
          // Intentar hacer login con las nuevas credenciales
          const { user } = await loginUseCase({ email: userEmail, password: newPassword });
          
          // Guardar usuario en el contexto
          login(user);
          
          // Redirigir al home
          navigate('/app/home');
        } catch (loginError) {
          console.error('Error en login automático:', loginError);
          // Si falla el login automático, redirigir al login después de 2 segundos más
          setTimeout(() => {
            navigate('/app/login');
          }, 2000);
        }
      } else {
        // Si no tenemos el email, redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/app/login');
        }, 3000);
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      const translatedError = translateError(err, t);
      setError(translatedError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/app/login');
  };

  const handleRequestNewLink = () => {
    navigate('/app/forgot-password');
  };

  // Si fue exitoso, mostrar el diseño de activación
  if (success) {
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

          {/* Success State */}
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {t('auth.resetPassword.successTitle')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('auth.resetPassword.successMessage')}
            </p>

            {isLoggingIn && (
              <div className="flex items-center justify-center gap-2 py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="text-gray-700 text-sm">{t('auth.resetPassword.signingIn')}</span>
              </div>
            )}

            {!isLoggingIn && (
              <Button
                onClick={handleBackToLogin}
                className="w-full"
              >
                {t('auth.resetPassword.goToLogin')}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Si el link es inválido, mostrar mensaje
  if (invalidLink) {
    return (
      <div className="min-h-screen gradient-livelify flex flex-col items-center justify-between px-4 sm:px-6 py-4 sm:py-8 text-white">
        <div className="w-full max-w-6xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <button
            onClick={handleBackToLogin}
            className="text-white/90 hover:text-white transition-colors flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('auth.resetPassword.backToLogin')}
          </button>
          <LanguageSelector />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl w-full text-center space-y-4 sm:space-y-8 py-4 sm:py-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-500/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <svg
              className="w-10 h-10 sm:w-12 sm:h-12 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div className="space-y-4 max-w-md">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              {t('auth.resetPassword.invalidLink')}
            </h1>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 sm:p-6 space-y-4 text-left">
              <p className="text-white/90 text-sm sm:text-base">
                {t('auth.resetPassword.invalidLinkMessage')}
              </p>
            </div>

            <button
              onClick={handleRequestNewLink}
              className="w-full py-3 px-6 bg-cream text-primary-700 font-semibold rounded-xl hover:bg-cream-dark transition-all transform hover:scale-105 shadow-lg"
            >
              {t('auth.resetPassword.requestNewLink')}
            </button>
          </div>
        </div>

        <Copyright variant="dark" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-livelify flex flex-col items-center justify-between px-4 sm:px-6 py-4 sm:py-8 text-white">
      {/* Header con botón de volver */}
      <div className="w-full max-w-6xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <button
          onClick={handleBackToLogin}
          className="text-white/90 hover:text-white transition-colors flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('auth.resetPassword.backToLogin')}
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
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-0">
                {t('auth.resetPassword.title')}
              </h1>
              <p className="text-sm sm:text-lg md:text-xl text-white/90 px-2">
                {t('auth.resetPassword.subtitle')}
              </p>
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

              <div>
                <Input
                  type="password"
                  label={t('auth.resetPassword.newPassword')}
                  placeholder={t('auth.resetPassword.newPasswordPlaceholder')}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  error={errors.newPassword}
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                <p className="text-xs sm:text-xs text-white/70 mt-1 ml-1">
                  {t('auth.resetPassword.passwordRequirements')}
                </p>
              </div>

              <Input
                type="password"
                label={t('auth.resetPassword.confirmPassword')}
                placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                autoComplete="new-password"
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-cream text-primary-700 font-semibold rounded-xl hover:bg-cream-dark transition-all transform hover:scale-105 shadow-lg text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? t('auth.resetPassword.resetting') : t('auth.resetPassword.resetButton')}
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

