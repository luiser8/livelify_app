/**
 * Formatos de teléfono por código de país
 * Estos son los formatos más comunes para cada país
 */

interface PhoneFormat {
  dialCode: string;
  mask: string;
  placeholder: string;
  maxLength: number;
}

// Formatos comunes de teléfono por código de país
export const phoneFormats: Record<string, PhoneFormat> = {
  // Estados Unidos y Canadá
  '+1': {
    dialCode: '+1',
    mask: '(###) ###-####',
    placeholder: '(555) 123-4567',
    maxLength: 10
  },
  // México
  '+52': {
    dialCode: '+52',
    mask: '## #### ####',
    placeholder: '55 1234 5678',
    maxLength: 10
  },
  // España
  '+34': {
    dialCode: '+34',
    mask: '### ## ## ##',
    placeholder: '612 34 56 78',
    maxLength: 9
  },
  // Reino Unido
  '+44': {
    dialCode: '+44',
    mask: '#### ### ####',
    placeholder: '7700 900123',
    maxLength: 10
  },
  // Francia
  '+33': {
    dialCode: '+33',
    mask: '# ## ## ## ##',
    placeholder: '6 12 34 56 78',
    maxLength: 9
  },
  // Alemania
  '+49': {
    dialCode: '+49',
    mask: '### ########',
    placeholder: '151 12345678',
    maxLength: 11
  },
  // Italia
  '+39': {
    dialCode: '+39',
    mask: '### ### ####',
    placeholder: '312 345 6789',
    maxLength: 10
  },
  // Argentina
  '+54': {
    dialCode: '+54',
    mask: '## #### ####',
    placeholder: '11 2345 6789',
    maxLength: 10
  },
  // Brasil
  '+55': {
    dialCode: '+55',
    mask: '(##) #####-####',
    placeholder: '(11) 91234-5678',
    maxLength: 11
  },
  // Chile
  '+56': {
    dialCode: '+56',
    mask: '# #### ####',
    placeholder: '9 1234 5678',
    maxLength: 9
  },
  // Colombia
  '+57': {
    dialCode: '+57',
    mask: '### ### ####',
    placeholder: '321 123 4567',
    maxLength: 10
  },
  // Perú
  '+51': {
    dialCode: '+51',
    mask: '### ### ###',
    placeholder: '912 345 678',
    maxLength: 9
  },
  // Venezuela
  '+58': {
    dialCode: '+58',
    mask: '###-#######',
    placeholder: '412-1234567',
    maxLength: 10
  },
  // Australia
  '+61': {
    dialCode: '+61',
    mask: '### ### ###',
    placeholder: '412 345 678',
    maxLength: 9
  },
  // Japón
  '+81': {
    dialCode: '+81',
    mask: '##-####-####',
    placeholder: '90-1234-5678',
    maxLength: 10
  },
  // China
  '+86': {
    dialCode: '+86',
    mask: '### #### ####',
    placeholder: '138 0013 8000',
    maxLength: 11
  },
  // India
  '+91': {
    dialCode: '+91',
    mask: '##### #####',
    placeholder: '98765 43210',
    maxLength: 10
  },
  // Rusia
  '+7': {
    dialCode: '+7',
    mask: '(###) ###-##-##',
    placeholder: '(912) 345-67-89',
    maxLength: 10
  },
};

// Formato genérico para países no especificados
const genericFormat: PhoneFormat = {
  dialCode: '',
  mask: '#### #### ####',
  placeholder: '1234 5678 9012',
  maxLength: 15
};

/**
 * Obtiene el formato de teléfono para un código de país
 */
export const getPhoneFormat = (dialCode: string): PhoneFormat => {
  return phoneFormats[dialCode] || genericFormat;
};

/**
 * Aplica formato a un número de teléfono basado en la máscara
 */
export const formatPhoneNumber = (value: string, dialCode: string): string => {
  // Eliminar todos los caracteres no numéricos
  const numbers = value.replace(/\D/g, '');
  
  const format = getPhoneFormat(dialCode);
  
  // Limitar al máximo de dígitos permitidos
  const limitedNumbers = numbers.slice(0, format.maxLength);
  
  // Aplicar la máscara
  let formatted = '';
  let numberIndex = 0;
  
  for (let i = 0; i < format.mask.length && numberIndex < limitedNumbers.length; i++) {
    const maskChar = format.mask[i];
    
    if (maskChar === '#') {
      formatted += limitedNumbers[numberIndex];
      numberIndex++;
    } else {
      formatted += maskChar;
    }
  }
  
  return formatted;
};

/**
 * Limpia el formato del número de teléfono (solo números)
 */
export const cleanPhoneNumber = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Valida que el número tenga la longitud correcta según el código de país
 */
export const validatePhoneLength = (value: string, dialCode: string): boolean => {
  const numbers = cleanPhoneNumber(value);
  const format = getPhoneFormat(dialCode);
  return numbers.length === format.maxLength;
};

