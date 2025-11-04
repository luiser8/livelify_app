import type { TFunction } from 'i18next';

/**
 * Traduce mensajes de error del servidor a mensajes localizados
 * @param error - Error del servidor (puede ser string o objeto con message)
 * @param t - Función de traducción de i18next
 * @returns Mensaje de error traducido
 */
export const translateError = (error: unknown, t: TFunction): string => {
  let errorMessage = '';

  // Extraer el mensaje del error
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'object' && error !== null && 'message' in error) {
    errorMessage = String(error.message);
  } else {
    return t('errors.unknown');
  }

  // Normalizar el mensaje (lowercase y trim)
  const normalizedMessage = errorMessage.toLowerCase().trim();

  // Mapeo de errores comunes del servidor a claves de traducción
  const errorMap: Record<string, string> = {
    // Errores de autenticación
    'invalid credentials': 'errors.auth.invalidCredentials',
    'invalid email or password': 'errors.auth.invalidCredentials',
    'incorrect password': 'errors.auth.invalidCredentials',
    'user not found': 'errors.auth.userNotFound',
    'email not found': 'errors.auth.userNotFound',
    'unauthorized': 'errors.auth.unauthorized',
    'token expired': 'errors.auth.tokenExpired',
    'invalid token': 'errors.auth.invalidToken',
    'session expired': 'errors.auth.sessionExpired',
    
    // Errores de registro
    'email already exists': 'errors.auth.emailExists',
    'email already in use': 'errors.auth.emailExists',
    'user already exists': 'errors.auth.emailExists',
    'phone already exists': 'errors.auth.phoneExists',
    'phone already in use': 'errors.auth.phoneExists',
    
    // Errores de red
    'failed to fetch': 'errors.network.failedToFetch',
    'network error': 'errors.network.failedToFetch',
    'network request failed': 'errors.network.failedToFetch',
    'timeout': 'errors.network.timeout',
    'connection timeout': 'errors.network.timeout',
    
    // Errores de validación
    'validation error': 'errors.validation.generic',
    'invalid input': 'errors.validation.invalidInput',
    'required field': 'errors.validation.requiredField',
    'invalid format': 'errors.validation.invalidFormat',
    
    // Errores de servidor
    'internal server error': 'errors.server.internal',
    'server error': 'errors.server.internal',
    'service unavailable': 'errors.server.unavailable',
    'bad gateway': 'errors.server.badGateway',
    
    // Errores de permisos
    'forbidden': 'errors.permissions.forbidden',
    'access denied': 'errors.permissions.forbidden',
    'permission denied': 'errors.permissions.forbidden',
    
    // Errores de recursos
    'not found': 'errors.resource.notFound',
    'resource not found': 'errors.resource.notFound',
    'already exists': 'errors.resource.alreadyExists',
  };

  // Buscar coincidencia en el mapa
  for (const [key, translationKey] of Object.entries(errorMap)) {
    if (normalizedMessage.includes(key)) {
      return t(translationKey);
    }
  }

  // Si el error contiene un código de estado HTTP, traducirlo
  if (/error\s+\d{3}/.test(normalizedMessage)) {
    const statusCode = normalizedMessage.match(/\d{3}/)?.[0];
    if (statusCode) {
      return translateHttpStatus(parseInt(statusCode), t);
    }
  }

  // Si no hay coincidencia, retornar el mensaje original o un error genérico
  // Verificar si el mensaje es muy técnico (contiene palabras técnicas)
  const technicalTerms = ['exception', 'null', 'undefined', 'stack', 'trace', 'async'];
  const isTechnical = technicalTerms.some(term => normalizedMessage.includes(term));
  
  if (isTechnical) {
    return t('errors.generic');
  }

  return errorMessage;
};

/**
 * Traduce códigos de estado HTTP a mensajes localizados
 * @param statusCode - Código de estado HTTP
 * @param t - Función de traducción de i18next
 * @returns Mensaje traducido
 */
export const translateHttpStatus = (statusCode: number, t: TFunction): string => {
  const statusMap: Record<number, string> = {
    400: 'errors.http.badRequest',
    401: 'errors.http.unauthorized',
    403: 'errors.http.forbidden',
    404: 'errors.http.notFound',
    408: 'errors.http.timeout',
    409: 'errors.http.conflict',
    422: 'errors.http.unprocessable',
    429: 'errors.http.tooManyRequests',
    500: 'errors.http.serverError',
    502: 'errors.http.badGateway',
    503: 'errors.http.serviceUnavailable',
    504: 'errors.http.gatewayTimeout',
  };

  return t(statusMap[statusCode] || 'errors.http.generic', { statusCode });
};

/**
 * Verifica si un error es un error de red
 * @param error - Error a verificar
 * @returns true si es un error de red
 */
export const isNetworkError = (error: unknown): boolean => {
  if (typeof error === 'string') {
    const normalized = error.toLowerCase();
    return normalized.includes('fetch') || 
           normalized.includes('network') || 
           normalized.includes('connection');
  }
  
  if (error instanceof Error) {
    const normalized = error.message.toLowerCase();
    return normalized.includes('fetch') || 
           normalized.includes('network') || 
           normalized.includes('connection') ||
           error.name === 'NetworkError' ||
           error.name === 'TypeError'; // fetch failures often throw TypeError
  }
  
  return false;
};

