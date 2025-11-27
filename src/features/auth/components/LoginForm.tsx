import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from '@/shared/components';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading?: boolean;
  serverError?: string;
}

/**
 * Formulario de inicio de sesión
 */
export const LoginForm = ({ onSubmit, isLoading = false, serverError }: LoginFormProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = t('auth.validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('auth.validation.emailInvalid');
    }

    if (!password) {
      newErrors.password = t('auth.validation.passwordRequired');
    } else if (password.length < 6) {
      newErrors.password = t('auth.validation.passwordMinLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(email, password);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 sm:space-y-6 px-4 sm:px-0">
      {serverError && (
        <div className="p-3 sm:p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-white text-xs sm:text-sm">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="wrap-break-word">{serverError}</span>
          </div>
        </div>
      )}
      
      <Input
        type="email"
        label={t('auth.login.email')}
        placeholder={t('auth.login.emailPlaceholder')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        autoComplete="email"
        disabled={isLoading}
      />

      <Input
        type="password"
        label={t('auth.login.password')}
        placeholder={t('auth.login.passwordPlaceholder')}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        autoComplete="current-password"
        disabled={isLoading}
      />

      <div className="flex flex-row items-center justify-between gap-2 text-xs sm:text-sm">
        <label className="flex items-center text-white/80 cursor-pointer hover:text-white transition-colors shrink-0">
          <input
            type="checkbox"
            className="mr-1.5 sm:mr-2 rounded border-white/30 bg-white/10 text-primary-500 focus:ring-white/50"
          />
          <span className="whitespace-nowrap">{t('auth.login.rememberMe')}</span>
        </label>
        <button
          type="button"
          onClick={() => navigate('/app/forgot-password')}
          className="text-white/80 hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          {t('auth.login.forgotPassword')}
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-cream text-primary-700 font-semibold rounded-xl hover:bg-cream-dark transition-all transform hover:scale-105 shadow-lg text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? t('auth.login.signingIn') : t('auth.login.signIn')}
      </button>
    </form>
  );
};



