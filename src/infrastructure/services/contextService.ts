import { apiClient } from '../api/client';
import { cacheApiCall, apiCache } from '@/shared/utils/apiCache';

export interface Context {
  id: string;
  name: string;
  canDelete: boolean;
  actionsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddContextRequest {
  name: string;
}

export interface GetMyContextsResponse {
  contexts: Context[];
}

export const contextService = {
  /**
   * Agregar un contexto
   * NOTA: Invalida caché de contextos
   */
  addContext: async (data: AddContextRequest): Promise<Context> => {
    const result = await apiClient.post<Context>('/users/add-context', data);
    
    // Invalidar caché después de agregar
    apiCache.remove('contexts_me');
    apiCache.remove('user_me');
    
    return result;
  },

  /**
   * Obtener contextos del usuario (CON CACHÉ)
   * 
   * Configuración de caché:
   * - Tipo: SEMI_STATIC (desde env)
   * - TTL: VITE_CACHE_TTL_SEMI_STATIC
   * - Max accesos: VITE_CACHE_MAX_ACCESS_SEMI_STATIC
   */
  getMyContexts: async (): Promise<GetMyContextsResponse> => {
    return cacheApiCall(
      'contexts_me',
      () => apiClient.get<GetMyContextsResponse>('/users/my-contexts'),
      apiCache,
      
    );
  },

  /**
   * Eliminar un contexto
   * NOTA: Invalida caché de contextos
   */
  deleteContext: async (contextId: string): Promise<void> => {
    await apiClient.delete(`/users/delete-context/${contextId}`);
    
    // Invalidar caché después de eliminar
    apiCache.remove('contexts_me');
    apiCache.remove('user_me');
  },
};

