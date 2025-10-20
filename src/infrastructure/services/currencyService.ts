import { apiClient } from '../api/client';
import { cacheApiCall, apiCache } from '@/shared/utils/apiCache';

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
}

export interface GetAllCurrenciesResponse {
  currencies: Currency[];
}

export const currencyService = {
  /**
   * Obtener todas las monedas disponibles (CON CACHÉ)
   * 
   * Configuración de caché:
   * - Tipo: STATIC (desde env)
   * - TTL: VITE_CACHE_TTL_STATIC
   * - Max accesos: VITE_CACHE_MAX_ACCESS_STATIC
   */
  getAllCurrencies: async (): Promise<GetAllCurrenciesResponse> => {
    return cacheApiCall(
      'currencies_all',
      () => apiClient.get<GetAllCurrenciesResponse>('/currencies/all'),
      apiCache,
      
    );
  },
};

