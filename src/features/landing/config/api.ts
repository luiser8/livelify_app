// Configuración de la API
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  apiKey: import.meta.env.VITE_API_KEY,
  apiKeyHeader: import.meta.env.VITE_API_KEY_HEADER || 'x-api-key',
};

