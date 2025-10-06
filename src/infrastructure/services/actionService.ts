import { apiClient } from '../api/client';

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
   * Obtener todas las acciones del usuario
   */
  async getMyActions(): Promise<MyActionsResponse> {
    const response = await apiClient.get<MyActionsResponse>('/actions/me');
    return response;
  },

  /**
   * Obtener acciones de un goal específico
   */
  async getGoalActions(goalId: string): Promise<Action[]> {
    const response = await apiClient.get<MyActionsResponse>('/actions/me');
    return response.actions.filter(action => action.goalId === goalId);
  },

  /**
   * Crear una nueva Action
   */
  async createAction(data: CreateActionRequest): Promise<CreateActionResponse> {
    const response = await apiClient.post<CreateActionResponse>('/actions', data);
    return response;
  },

  /**
   * Actualizar una Action
   */
  async updateAction(actionId: string, data: Partial<CreateActionRequest>): Promise<CreateActionResponse> {
    const response = await apiClient.patch<CreateActionResponse>(`/actions/${actionId}`, data);
    return response;
  },

  /**
   * Eliminar una Action
   */
  async deleteAction(actionId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/actions/${actionId}`);
    return response;
  },

  /**
   * Marcar Action como completada (toggle)
   */
  async toggleActionCompletion(actionId: string): Promise<CreateActionResponse> {
    const response = await apiClient.patch<CreateActionResponse>(`/actions/${actionId}/toggle`, {});
    return response;
  },

  /**
   * Completar una Action (marca como completada de forma definitiva)
   */
  async completeAction(actionId: string): Promise<CreateActionResponse> {
    const response = await apiClient.put<CreateActionResponse>(`/actions/${actionId}/complete`, {});
    return response;
  },
};

