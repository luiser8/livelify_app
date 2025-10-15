import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RegisterForm, RegisterFormData } from '../components/RegisterForm';
import { useAuth } from '@/features/auth/context';
import { registerUseCase } from '@/core/usecases/auth/registerUseCase';
import { loginUseCase } from '@/core/usecases/auth/loginUseCase';
import { LanguageSelector, Copyright } from '@/shared/components';

/**
 * Página de registro
 */
export const RegisterPage = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleRegister = async (formData: RegisterFormData) => {
    setIsLoading(true);
    setError('');

    try {
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
      };

      const registerResult = await registerUseCase(registerData);

      if (registerResult.success) {
        const loginResult = await loginUseCase({
          email: formData.email,
          password: formData.password,
        });

        login(loginResult.user);
        navigate('/login');
      }
    } catch (error) {
      console.error('Error de registro:', error);

      // Manejar diferentes tipos de errores
      if (error instanceof Error) {
        setError(error.message);
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        setError(String(error.message));
      } else {
        setError(t('auth.errors.registerFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/login');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen gradient-livelify flex flex-col items-center justify-between px-6 py-8 text-white">
      {/* Header con botón de volver */}
      <div className="w-full max-w-6xl flex justify-between items-center">
        <button
          onClick={handleBack}
          className="text-white/90 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('common.back')}
        </button>
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <button
            onClick={handleSignIn}
            className="text-white/90 hover:text-white transition-colors text-sm font-medium"
          >
            {t('auth.register.signIn')}
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl w-full text-center space-y-8 py-8">
        {/* Logo */}
        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <svg
            className="w-12 h-12 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C12 2 8 4 8 8C8 10 9 11 10 12C9 13 8 14 8 16C8 20 12 22 12 22C12 22 16 20 16 16C16 14 15 13 14 12C15 11 16 10 16 8C16 4 12 2 12 2Z" />
          </svg>
        </div>

        {/* Logo text */}
        <div>
          <h1 className="text-5xl md:text-5xl font-bold mb-0">{t('auth.register.title')}</h1>
          <p className="text-lg md:text-xl text-white/90">{t('auth.register.subtitle')}</p>
        </div>

        {/* Formulario de registro */}
        <RegisterForm 
          onSubmit={handleRegister} 
          isLoading={isLoading}
          serverError={error}
        />

        {/* Divider */}
        <div className="w-full max-w-md flex items-center gap-4">
          <div className="flex-1 h-px bg-white/20"></div>
          <span className="text-white/60 text-sm">{t('auth.login.orContinueWith')}</span>
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
      <div className="w-full max-w-md pb-4">
        <p className="text-center text-white/80 text-sm">
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

