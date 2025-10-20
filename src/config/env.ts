/**
 * Configuración de variables de entorno
 * Las variables deben estar prefijadas con VITE_ para estar disponibles en el cliente
 */

export const env = {
  // Entorno actual
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',

  // Información de la aplicación
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Livelify',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',

  // URLs de API
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',

  // Configuración de sesión
  SESSION_EXPIRE_SECONDS: parseInt(import.meta.env.VITE_SESSION_EXPIRE) || 10,

  // Configuración de Caché API
  CACHE_TTL: parseInt(import.meta.env.VITE_CACHE_TTL) || 300000, // 5 minutos por defecto
  CACHE_ACCESS_COUNT: parseInt(import.meta.env.VITE_CACHE_ACCESS_COUNT) || 10, // 10 accesos por defecto
  CACHE_KEY_PREFIX: import.meta.env.VITE_CACHE_KEY_PREFIX || 'api_cache_', // Prefijo por defecto

  // Flags de desarrollo
  isDevelopment: import.meta.env.MODE === 'development',
  isQA: import.meta.env.MODE === 'qa',
  isProduction: import.meta.env.MODE === 'production',
} as const

// Tipo para autocompletado
export type Env = typeof env
