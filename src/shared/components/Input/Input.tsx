import type { InputHTMLAttributes } from 'react';

/**
 * Componente Input reutilizable
 */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}: InputProps) => {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-white mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-4 py-3 rounded-xl
          bg-white/10 backdrop-blur-sm
          border-2 border-white/20
          text-white placeholder-white/50
          focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40
          transition-all
          ${error ? 'border-red-400 focus:ring-red-400/50' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-300">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-white/60">{helperText}</p>
      )}
    </div>
  );
};


