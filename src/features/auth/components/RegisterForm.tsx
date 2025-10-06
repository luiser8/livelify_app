import { useState, FormEvent } from 'react';
import { Input } from '@/shared/components';

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  avatarUrl?: string;
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
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    address: '',
    phone: '',
    avatarUrl: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof RegisterFormData, string>> = {};

    // Email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // First Name
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }

    // Last Name
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }

    // Phone
    if (!formData.phone) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone format';
    }

    // Address
    if (!formData.address) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof RegisterFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
      {serverError && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-white text-sm">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{serverError}</span>
          </div>
        </div>
      )}

      {/* Nombre y Apellido en una fila */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          type="text"
          label="First Name"
          placeholder="John"
          value={formData.firstName}
          onChange={handleChange('firstName')}
          error={errors.firstName}
          disabled={isLoading}
        />
        <Input
          type="text"
          label="Last Name"
          placeholder="Doe"
          value={formData.lastName}
          onChange={handleChange('lastName')}
          error={errors.lastName}
          disabled={isLoading}
        />
      </div>

      <Input
        type="email"
        label="Email"
        placeholder="your@email.com"
        value={formData.email}
        onChange={handleChange('email')}
        error={errors.email}
        autoComplete="email"
        disabled={isLoading}
      />

      <Input
        type="tel"
        label="Phone"
        placeholder="+1234567890"
        value={formData.phone}
        onChange={handleChange('phone')}
        error={errors.phone}
        autoComplete="tel"
        disabled={isLoading}
      />

      <Input
        type="text"
        label="Address"
        placeholder="123 Main St, City, Country"
        value={formData.address}
        onChange={handleChange('address')}
        error={errors.address}
        disabled={isLoading}
      />

      <Input
        type="password"
        label="Password"
        placeholder="••••••••"
        value={formData.password}
        onChange={handleChange('password')}
        error={errors.password}
        autoComplete="new-password"
        disabled={isLoading}
      />

      <Input
        type="password"
        label="Confirm Password"
        placeholder="••••••••"
        value={formData.confirmPassword}
        onChange={handleChange('confirmPassword')}
        error={errors.confirmPassword}
        autoComplete="new-password"
        disabled={isLoading}
      />

      {/* <Input
        type="url"
        label="Avatar URL (Optional)"
        placeholder="https://example.com/avatar.jpg"
        value={formData.avatarUrl}
        onChange={handleChange('avatarUrl')}
        error={errors.avatarUrl}
        disabled={isLoading}
      /> */}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 px-6 bg-cream text-primary-700 font-semibold rounded-xl hover:bg-cream-dark transition-all transform hover:scale-105 shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  );
};

