import { apiClient } from '../api/client';
import { cacheApiCall, apiCache } from '@/shared/utils/apiCache';

/**
 * Niveles de energía para una acción
 */
export type EnergyLevel = 'LOW' | 'MEDIUM' | 'HIGH';

/**
 * Interfaz para una Action
 */
export interface Action {
  id: string;
  goalId: string;
  contextId: string;
  contextName: string;
  title: string;
  description: string;
  energy: EnergyLevel;
  timeEstimate: number; // en minutos
  dueDate: string;
  completed: boolean;
  completedAt: string | null;
  isOverdue: boolean;
  daysUntilDue: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request para crear una nueva Action
 */
export interface CreateActionRequest {
  goalId: string;
  title: string;
  description: string;
  energy: EnergyLevel;
  timeEstimate: number;
  dueDate: string;
  contextId: string;
}

/**
 * Response al obtener todas las acciones del usuario
 */
export interface MyActionsResponse {
  actions: Action[];
  totalActions: number;
  completedActions: number;
  pendingActions: number;
  overdueActions: number;
}

/**
 * Response al crear una Action
 */
export interface CreateActionResponse {
  message: string;
  action: Action;
}

/**
 * Servicio para gestionar Actions
 */
export const actionService = {
  /**
   * Obtener todas las acciones del usuario (CON CACHÉ)
   * 
   * Configuración de caché desde .env:
   * - TTL: VITE_CACHE_TTL
   * - Max accesos: VITE_CACHE_ACCESS_COUNT
   */
  async getMyActions(): Promise<MyActionsResponse> {
    return cacheApiCall(
      'actions_me',
      () => apiClient.get<MyActionsResponse>('/actions/me'),
      apiCache
    );
  },

  /**
   * Obtener acciones de un goal específico (CON CACHÉ)
   * 
   * Configuración de caché desde .env:
   * - TTL: VITE_CACHE_TTL
   * - Max accesos: VITE_CACHE_ACCESS_COUNT
   */
  async getGoalActions(goalId: string): Promise<Action[]> {
    return cacheApiCall(
      `actions_goal_${goalId}`,
      async () => {
        const response = await apiClient.get<MyActionsResponse>('/actions/me');
        return response.actions.filter(action => action.goalId === goalId);
      },
      apiCache
    );
  },

  /**
   * Crear una nueva Action
   * NOTA: Invalida cachés relacionados
   */
  async createAction(data: CreateActionRequest): Promise<CreateActionResponse> {
    const response = await apiClient.post<CreateActionResponse>('/actions', data);
    
    // Invalidar cachés después de crear
    apiCache.remove('actions_me');
    apiCache.remove(`actions_goal_${data.goalId}`);
    apiCache.remove('user_me');
    apiCache.remove('contexts_me');
    apiCache.remove('goals_me');
    return response;
  },

  /**
   * Actualizar una Action
   * NOTA: Invalida cachés relacionados
   */
  async updateAction(actionId: string, data: Partial<CreateActionRequest>): Promise<CreateActionResponse> {
    const response = await apiClient.patch<CreateActionResponse>(`/actions/${actionId}`, data);
    
    // Invalidar cachés
    apiCache.remove('actions_me');
    if (data.goalId) {
      apiCache.remove(`actions_goal_${data.goalId}`);
    }
    apiCache.remove('user_me');
    
    return response;
  },

  /**
   * Eliminar una Action
   * NOTA: Invalida cachés relacionados
   */
  async deleteAction(actionId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/actions/${actionId}`);
    
    // Invalidar cachés
    apiCache.remove('actions_me');
    // Limpiar todos los cachés de goals
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('actions_goal_')) {
        apiCache.remove(key.replace('api_cache_', ''));
      }
    });
    apiCache.remove('user_me');
    
    return response;
  },

  /**
   * Marcar Action como completada (toggle)
   * NOTA: Invalida cachés relacionados
   */
  async toggleActionCompletion(actionId: string): Promise<CreateActionResponse> {
    const response = await apiClient.patch<CreateActionResponse>(`/actions/${actionId}/toggle`, {});
    
    // Invalidar cachés
    apiCache.remove('actions_me');
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('actions_goal_')) {
        apiCache.remove(key.replace('api_cache_', ''));
      }
    });
    apiCache.remove('user_me');
    
    return response;
  },

  /**
   * Completar una Action (marca como completada de forma definitiva)
   * NOTA: Invalida cachés relacionados
   */
  async completeAction(actionId: string): Promise<CreateActionResponse> {
    const response = await apiClient.put<CreateActionResponse>(`/actions/${actionId}/complete`, {});
    
    // Invalidar cachés
    apiCache.remove('actions_me');
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('actions_goal_')) {
        apiCache.remove(key.replace('api_cache_', ''));
      }
    });
    apiCache.remove('user_me');
    
    return response;
  },
};

