import { apiClient } from '../api/client';
import { cacheApiCall, apiCache } from '@/shared/utils/apiCache';

/**
 * Tipo de Goal (BE, DO, HAVE)
 */
export type GoalType = 'BE' | 'DO' | 'HAVE';

/**
 * Interfaz de Goal
 */
export interface Goal {
  id: string;
  projectDetailId: string;
  goalType: GoalType;
  content: string;
  baseCapital: number;
  multiplier: number;
  currencyCode: string;
  cost: number;
  saved: number;
  progress: number;
  isCompleted: boolean;
  totalMonthlyBudget: number | null; // Presupuesto mensual total de las acciones
  totalDailyBudget: number | null;   // Presupuesto diario total de las acciones
  createdAt: string;
  updatedAt: string;
}

/**
 * Request para crear un Goal
 */
export interface CreateGoalRequest {
  projectDetailId: string;
  goalType: GoalType;
  content: string;
}

/**
 * Response de Goals del usuario
 */
export interface MyGoalsResponse {
  goals: Goal[];
  totalGoals: number;
  goalsByType: {
    BE: number;
    DO: number;
    HAVE: number;
  };
  completedGoals: number;
  totalCost: number;
  totalSaved: number;
  overallProgress: number;
}

/**
 * Response al crear un Goal
 */
export interface CreateGoalResponse {
  message: string;
  goal: Goal;
}

/**
 * Servicio para gestionar Goals
 */
export const goalService = {
  /**
   * Obtener todos los goals del usuario (CON CACHÉ)
   * 
   * Configuración de caché:
   * - Tipo: NORMAL (desde env)
   * - TTL: VITE_CACHE_TTL_NORMAL
   * - Max accesos: VITE_CACHE_MAX_ACCESS_NORMAL
   */
  async getMyGoals(): Promise<MyGoalsResponse> {
    return cacheApiCall(
      'goals_me',
      () => apiClient.get<MyGoalsResponse>('/goals/me'),
      apiCache,
      
    );
  },

  /**
   * Obtener goals de un proyecto específico (CON CACHÉ)
   * 
   * Configuración de caché:
   * - Tipo: NORMAL (desde env)
   * - TTL: VITE_CACHE_TTL_NORMAL
   * - Max accesos: VITE_CACHE_MAX_ACCESS_NORMAL
   */
  async getProjectGoals(projectDetailId: string): Promise<Goal[]> {
    return cacheApiCall(
      `goals_project_${projectDetailId}`,
      async () => {
        const response = await apiClient.get<MyGoalsResponse>('/goals/me');
        return response.goals.filter(goal => goal.projectDetailId === projectDetailId);
      },
      apiCache,
      
    );
  },

  /**
   * Crear un nuevo Goal
   * NOTA: Invalida cachés relacionados
   */
  async createGoal(data: CreateGoalRequest): Promise<CreateGoalResponse> {
    const response = await apiClient.post<CreateGoalResponse>('/goals/add', data);
    
    // Invalidar cachés después de crear
    apiCache.remove('goals_me');
    apiCache.remove(`goals_project_${data.projectDetailId}`);
    apiCache.remove('user_me'); // Dashboard también muestra goals
    apiCache.remove('projects_all');
    apiCache.remove('actions_me');
    return response;
  },

  /**
   * Actualizar un Goal
   * NOTA: Invalida cachés relacionados
   */
  async updateGoal(goalId: string, data: Partial<CreateGoalRequest>): Promise<CreateGoalResponse> {
    const response = await apiClient.patch<CreateGoalResponse>(`/goals/${goalId}`, data);
    
    // Invalidar cachés
    apiCache.remove('goals_me');
    if (data.projectDetailId) {
      apiCache.remove(`goals_project_${data.projectDetailId}`);
    }
    apiCache.remove('user_me');
    apiCache.remove('projects_all');
    apiCache.remove('goals_me');
    apiCache.remove('actions_me');
    
    return response;
  },

  /**
   * Eliminar un Goal
   * NOTA: Invalida cachés relacionados
   */
  async deleteGoal(goalId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/goals/${goalId}`);
    
    // Invalidar cachés
    apiCache.remove('goals_me');
    // Limpiar todos los cachés de proyectos
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('goals_project_')) {
        apiCache.remove(key.replace('api_cache_', ''));
      }
    });
    apiCache.remove('user_me');
    apiCache.remove('projects_all');
    apiCache.remove('goals_me');
    apiCache.remove('actions_me');
    
    return response;
  },

  /**
   * Marcar Goal como completado
   * NOTA: Invalida cachés relacionados
   */
  async toggleGoalCompletion(goalId: string): Promise<CreateGoalResponse> {
    const response = await apiClient.patch<CreateGoalResponse>(`/goals/${goalId}/toggle`, {});
    
    // Invalidar cachés
    apiCache.remove('goals_me');
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('goals_project_')) {
        apiCache.remove(key.replace('api_cache_', ''));
      }
    });
    apiCache.remove('user_me');
    apiCache.remove('projects_all');
    apiCache.remove('goals_me');
    apiCache.remove('actions_me');
    
    return response;
  },
};

