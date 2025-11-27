import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RegisterForm, RegisterFormData } from '../components/RegisterForm';
import { registerUseCase } from '@/core/usecases/auth/registerUseCase';
import { LanguageSelector, Copyright, Button } from '@/shared/components';
import { translateError } from '@/shared/utils';

/**
 * Página de registro
 */
export const RegisterPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');

  const handleRegister = async (formData: RegisterFormData) => {
    setIsLoading(true);
    setError('');

    try {
      // Detectar el idioma actual del usuario
      const currentLanguage = i18n.language || 'es';

      // Preparar datos para el backend (sin confirmPassword)
      const registerData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        phone: formData.phone,
        avatarUrl: formData.avatarUrl || 'https://example.com/avatar.jpg',
        acceptTermsAndPolicies: formData.acceptedTermsAndPolicies,
        language: currentLanguage,
      };

      const registerResult = await registerUseCase(registerData);

      if (registerResult.success) {
        // No iniciar sesión automáticamente, solo mostrar mensaje de éxito
        setRegisteredEmail(formData.email);
        setRegistrationSuccess(true);
      }
    } catch (error) {
      console.error('Error de registro:', error);

      // Traducir el error usando la utilidad
      const translatedError = translateError(error, t);
      setError(translatedError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/app/login');
  };

  const handleSignIn = () => {
    navigate('/app/login');
  };

  // Pantalla de éxito después del registro
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary via-secondary to-accent flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex justify-center -mb-14 -mt-14">
            <img 
              src="/logo.svg" 
              alt="Livelify" 
              className="h-56 w-56 sm:h-64 sm:w-64 md:h-72 md:w-72 lg:h-80 lg:w-80 xl:h-96 xl:w-96"
            />
          </div>

          {/* Success Icon */}
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
              {t('auth.register.checkYourEmail') || '¡Revisa tu correo!'}
            </h2>
            
            <p className="text-gray-600 mb-2">
              {t('auth.register.activationEmailSent') || 'Te hemos enviado un correo electrónico a:'}
            </p>
            
            <p className="text-primary-600 font-semibold mb-6">
              {registeredEmail}
            </p>
            
            <p className="text-gray-600 mb-6">
              {t('auth.register.clickActivationLink') || 'Por favor, haz clic en el enlace de activación en el correo para activar tu cuenta y poder iniciar sesión.'}
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>{t('auth.register.didntReceiveEmail') || '¿No recibiste el correo?'}</strong>
                <br />
                {t('auth.register.checkSpamFolder') || 'Revisa tu carpeta de spam o correo no deseado.'}
              </p>
            </div>

            <Button
              onClick={handleSignIn}
              className="w-full"
            >
              {t('auth.goToLogin') || 'Ir a iniciar sesión'}
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
          {t('common.back')}
        </button>
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <LanguageSelector />
          <button
            onClick={handleSignIn}
            className="text-white/90 hover:text-white transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
          >
            {t('auth.register.signIn')}
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl w-full text-center space-y-2 sm:space-y-4 py-2 sm:py-4">
        {/* Logo */}
        <div className="flex justify-center -mb-16 sm:-mb-20 md:-mb-24 -mt-4 sm:-mt-6 md:-mt-6">
          <img
            src="/logo_white.svg"
            alt="Livelify"
            className="h-56 w-56 sm:h-64 sm:w-64 md:h-72 md:w-72 lg:h-80 lg:w-80 xl:h-96 xl:w-96"
          />
        </div>

        {/* Logo text */}
        <div className="space-y-0.5 sm:space-y-1">
          <h1 className="text-3xl sm:text-3xl md:text-4xl font-bold mb-0">{t('auth.register.title')}</h1>
          <p className="text-xs sm:text-base md:text-lg text-white/90 px-2">{t('auth.register.subtitle')}</p>
        </div>

        {/* Formulario de registro */}
        <RegisterForm 
          onSubmit={handleRegister} 
          isLoading={isLoading}
          serverError={error}
        />

        {/* Divider */}
        <div className="w-full max-w-md flex items-center gap-3 sm:gap-4 px-4 sm:px-0">
          <div className="flex-1 h-px bg-white/20"></div>
          <span className="text-white/60 text-xs sm:text-sm whitespace-nowrap">{t('auth.login.orContinueWith')}</span>
          <div className="flex-1 h-px bg-white/20"></div>
        </div>

        {/* Social register buttons */}
        {/* <div className="w-full max-w-md space-y-3">
          <button className="w-full py-3 px-6 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <button className="w-full py-3 px-6 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Continue with Facebook
          </button>
        </div> */}
      </div>

      {/* Footer */}
      <div className="w-full max-w-md pb-2 sm:pb-4 px-4 sm:px-0">
        <p className="text-center text-white/80 text-xs sm:text-sm">
          {t('auth.register.haveAccount')}{' '}
          <button
            onClick={handleSignIn}
            className="text-white font-semibold hover:underline"
          >
            {t('auth.register.signIn')}
          </button>
        </p>
      </div>

      {/* Copyright */}
      <Copyright variant="dark" />
    </div>
  );
};

