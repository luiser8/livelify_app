import { useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, TermsAndConditions } from '@/shared/components';
import { PrivacyAndPolicies } from '@/shared/components/PrivacyAndPolicies/PrivacyAndPolicies';
import { formatPhoneNumber, getPhoneFormat, cleanPhoneNumber, validatePhoneLength } from '@/shared/utils';
import countryCodes from '@/shared/utils/countryCodesData';

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  avatarUrl?: string;
  acceptedTermsAndPolicies: boolean;
}

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => void;
  isLoading?: boolean;
  serverError?: string;
}

/**
 * Formulario de registro
 */
export const RegisterForm = ({ onSubmit, isLoading = false, serverError }: RegisterFormProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    address: '',
    phone: '',
    avatarUrl: '',
    acceptedTermsAndPolicies: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasReadPrivacy, setHasReadPrivacy] = useState(false);
  const [countryCode, setCountryCode] = useState('+1'); // Default to US
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearchTerm, setCountrySearchTerm] = useState('');

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof RegisterFormData, string>> = {};

    // Email
    if (!formData.email) {
      newErrors.email = t('auth.validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('auth.validation.emailInvalid');
    }

    // Password
    if (!formData.password) {
      newErrors.password = t('auth.validation.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.validation.passwordMinLength');
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.validation.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.validation.passwordsNotMatch');
    }

    // First Name
    if (!formData.firstName) {
      newErrors.firstName = t('auth.validation.firstNameRequired');
    }

    // Last Name
    if (!formData.lastName) {
      newErrors.lastName = t('auth.validation.lastNameRequired');
    }

    // Phone
    if (!phoneNumber) {
      newErrors.phone = t('auth.validation.phoneRequired');
    } else {
      const cleanNumber = cleanPhoneNumber(phoneNumber);
      if (cleanNumber.length === 0) {
        newErrors.phone = t('auth.validation.phoneRequired');
      } else if (!validatePhoneLength(phoneNumber, countryCode)) {
        const format = getPhoneFormat(countryCode);
        newErrors.phone = t('auth.validation.phoneInvalid') + ` (${format.maxLength} ${t('auth.validation.digitsRequired')})`;
      }
    }

    // Address
    if (!formData.address) {
      newErrors.address = t('auth.validation.addressRequired');
    }

    // Terms acceptance - ahora requiere haber leído ambos documentos
    if (!formData.acceptedTermsAndPolicies) {
      newErrors.acceptedTermsAndPolicies = t('auth.validation.termsRequired');
    } else if (!hasReadTerms || !hasReadPrivacy) {
      newErrors.acceptedTermsAndPolicies = t('auth.validation.mustReadBothDocuments');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof RegisterFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (validate()) {
      // Combinar código de país con número de teléfono (solo números, sin formato)
      const cleanNumber = cleanPhoneNumber(phoneNumber);
      const fullPhone = `${countryCode}${cleanNumber}`;
      onSubmit({ ...formData, phone: fullPhone });
    }
  };

  const handleCountryCodeSelect = (code: string) => {
    setCountryCode(code);
    setShowCountryDropdown(false);
    setCountrySearchTerm('');
    // Limpiar el número de teléfono al cambiar de país para aplicar el nuevo formato
    setPhoneNumber('');
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Aplicar formato automático según el código de país
    const formatted = formatPhoneNumber(e.target.value, countryCode);
    setPhoneNumber(formatted);
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  // Filtrar países basado en la búsqueda
  const filteredCountries = countryCodes.filter(country => 
    country.name.toLowerCase().includes(countrySearchTerm.toLowerCase()) || 
    country.dial_code.includes(countrySearchTerm)
  );

  // Obtener el placeholder dinámico según el código de país
  const phoneFormat = getPhoneFormat(countryCode);

  // Verificar si puede aceptar los términos (solo si leyó ambos documentos)
  const canAcceptTerms = hasReadTerms && hasReadPrivacy;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-3 sm:space-y-5 px-4 sm:px-0">
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

      {/* Nombre y Apellido en una fila */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Input
          type="text"
          label={t('auth.register.firstName')}
          placeholder={t('auth.register.firstNamePlaceholder')}
          value={formData.firstName}
          onChange={handleChange('firstName')}
          error={errors.firstName}
          disabled={isLoading}
        />
        <Input
          type="text"
          label={t('auth.register.lastName')}
          placeholder={t('auth.register.lastNamePlaceholder')}
          value={formData.lastName}
          onChange={handleChange('lastName')}
          error={errors.lastName}
          disabled={isLoading}
        />
      </div>

      <Input
        type="email"
        label={t('auth.register.email')}
        placeholder={t('auth.register.emailPlaceholder')}
        value={formData.email}
        onChange={handleChange('email')}
        error={errors.email}
        autoComplete="email"
        disabled={isLoading}
      />

      {/* Campo de Teléfono con selector de código de país */}
      <div>
        <label className="block text-sm sm:text-base font-medium text-white/90 mb-1.5 sm:mb-2">
          {t('auth.register.phone')}
        </label>
        <div className="flex gap-2">
          {/* Selector de código de país */}
          <div className="relative w-28 sm:w-32">
            <button
              type="button"
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              disabled={isLoading}
              className="w-full h-12 sm:h-14 px-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white text-sm sm:text-base font-medium hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
            >
              <span className="truncate">{countryCode}</span>
              <svg className="w-4 h-4 shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown de códigos de país */}
            {showCountryDropdown && (
              <>
                {/* Overlay para cerrar el dropdown */}
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => {
                    setShowCountryDropdown(false);
                    setCountrySearchTerm('');
                  }}
                />
                {/* Lista de códigos */}
                <div className="absolute top-full left-0 mt-1 w-80 sm:w-96 bg-white/95 backdrop-blur-md border border-white/30 rounded-xl shadow-2xl z-20">
                  <div className="p-2 border-b border-gray-200">
                    <input
                      type="text"
                      placeholder="Buscar país..."
                      value={countrySearchTerm}
                      onChange={(e) => setCountrySearchTerm(e.target.value)}
                      className="w-full px-5 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => handleCountryCodeSelect(country.dial_code)}
                          className="w-full px-6 py-2.5 text-left hover:bg-indigo-50 transition-colors flex items-center justify-between group"
                        >
                          <span className="text-gray-900 text-sm font-medium group-hover:text-indigo-600 truncate">
                            {country.name}
                          </span>
                          <span className="text-gray-600 text-sm font-semibold group-hover:text-indigo-600 ml-2 shrink-0">
                            {country.dial_code}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-gray-500 text-sm">
                        No se encontraron países
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Input de número de teléfono */}
          <div className="flex-1">
            <input
              type="tel"
              placeholder={phoneFormat.placeholder}
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              disabled={isLoading}
              autoComplete="tel"
              className="w-full h-12 sm:h-14 px-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/40 focus:bg-white/15 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            />
            {/* Mostrar formato esperado */}
            {!errors.phone && phoneNumber.length === 0 && (
              <p className="text-white/50 text-xs mt-1 ml-1">
                {t('auth.register.phoneFormat')}: {phoneFormat.mask}
              </p>
            )}
          </div>
        </div>
        {errors.phone && (
          <p className="text-red-300 text-xs sm:text-sm mt-1 ml-1 flex items-start gap-1">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{errors.phone}</span>
          </p>
        )}
      </div>

      <Input
        type="text"
        label={t('auth.register.address')}
        placeholder={t('auth.register.addressPlaceholder')}
        value={formData.address}
        onChange={handleChange('address')}
        error={errors.address}
        disabled={isLoading}
      />

      <div>
        <Input
          type="password"
          label={t('auth.register.password')}
          placeholder={t('auth.register.passwordPlaceholder')}
          value={formData.password}
          onChange={handleChange('password')}
          error={errors.password}
          autoComplete="new-password"
          disabled={isLoading}
        />
        <p className="text-xs sm:text-xs text-white/70 mt-1 ml-1">
          {t('auth.register.passwordHint')}
        </p>
      </div>

      <Input
        type="password"
        label={t('auth.register.confirmPassword')}
        placeholder={t('auth.register.confirmPasswordPlaceholder')}
        value={formData.confirmPassword}
        onChange={handleChange('confirmPassword')}
        error={errors.confirmPassword}
        autoComplete="new-password"
        disabled={isLoading}
      />

      {/* Sección de Términos y Políticas */}
      <div className="space-y-2 sm:space-y-3">
        <label className={`flex items-start gap-2 sm:gap-3 ${canAcceptTerms ? 'cursor-pointer' : 'cursor-not-allowed'} group`}>
          <input
            type="checkbox"
            checked={formData.acceptedTermsAndPolicies}
            onChange={(e) => {
              if (canAcceptTerms) {
                setFormData(prev => ({ ...prev, acceptedTermsAndPolicies: e.target.checked }));
                if (errors.acceptedTermsAndPolicies) {
                  setErrors(prev => ({ ...prev, acceptedTermsAndPolicies: undefined }));
                }
              }
            }}
            disabled={isLoading || !canAcceptTerms}
            className="mt-1 w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 bg-white/20 border-white/30 rounded focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          />
          <span className="text-xs sm:text-sm text-white/90 leading-relaxed flex-1">
            {t('auth.register.termsAcceptance.part1')}{' '}
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="text-cream font-semibold hover:text-cream-dark underline underline-offset-2 transition-colors"
            >
              {t('auth.register.termsAcceptance.termsLink')}
            </button>{' '}
            {t('auth.register.termsAcceptance.part2')}{' '}
            <button
              type="button"
              onClick={() => setShowPrivacyModal(true)}
              className="text-cream font-semibold hover:text-cream-dark underline underline-offset-2 transition-colors"
            >
              {t('auth.register.termsAcceptance.privacyLink')}
            </button>
          </span>
        </label>

        {/* Estado de lectura de documentos */}
        <div className="ml-6 sm:ml-8 space-y-1.5 sm:space-y-2">
          {/* Estado de Términos y Condiciones */}
          <div className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${hasReadTerms ? 'text-green-300' : 'text-amber-300'}`}>
            {hasReadTerms ? (
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            )}
            <span className="wrap-break-word">
              {hasReadTerms 
                ? t('auth.register.termsAcceptance.termsRead')
                : t('auth.register.termsAcceptance.termsNotRead')
              }
            </span>
          </div>

          {/* Estado de Políticas de Privacidad */}
          <div className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${hasReadPrivacy ? 'text-green-300' : 'text-amber-300'}`}>
            {hasReadPrivacy ? (
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            )}
            <span className="wrap-break-word">
              {hasReadPrivacy 
                ? t('auth.register.termsAcceptance.privacyRead')
                : t('auth.register.termsAcceptance.privacyNotRead')
              }
            </span>
          </div>

          {/* Mensaje cuando puede aceptar */}
          {canAcceptTerms && !formData.acceptedTermsAndPolicies && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-green-300 text-xs sm:text-sm">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="wrap-break-word">{t('auth.register.termsAcceptance.canAcceptNow')}</span>
            </div>
          )}
        </div>

        {errors.acceptedTermsAndPolicies && (
          <p className="text-red-300 text-xs sm:text-sm ml-6 sm:ml-8 flex items-start gap-1">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="wrap-break-word">{errors.acceptedTermsAndPolicies}</span>
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-cream text-primary-700 font-semibold rounded-xl hover:bg-cream-dark transition-all transform hover:scale-105 shadow-lg text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? t('auth.register.signingUp') : t('auth.register.signUp')}
      </button>

      {/* Modales */}
      <TermsAndConditions
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAcceptRead={() => {
          setHasReadTerms(true);
        }}
      />

      <PrivacyAndPolicies
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onAcceptRead={() => {
          setHasReadPrivacy(true);
        }}
      />
    </form>
  );
};
