import { apiClient } from '../api/client';

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
  baseCapital: number;
  currencyCode: string;
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
   * Obtener todos los goals del usuario
   */
  async getMyGoals(): Promise<MyGoalsResponse> {
    const response = await apiClient.get<MyGoalsResponse>('/goals/me');
    return response;
  },

  /**
   * Obtener goals de un proyecto específico
   */
  async getProjectGoals(projectDetailId: string): Promise<Goal[]> {
    const response = await apiClient.get<MyGoalsResponse>('/goals/me');
    return response.goals.filter(goal => goal.projectDetailId === projectDetailId);
  },

  /**
   * Crear un nuevo Goal
   */
  async createGoal(data: CreateGoalRequest): Promise<CreateGoalResponse> {
    const response = await apiClient.post<CreateGoalResponse>('/goals/add', data);
    return response;
  },

  /**
   * Actualizar un Goal
   */
  async updateGoal(goalId: string, data: Partial<CreateGoalRequest>): Promise<CreateGoalResponse> {
    const response = await apiClient.patch<CreateGoalResponse>(`/goals/${goalId}`, data);
    return response;
  },

  /**
   * Eliminar un Goal
   */
  async deleteGoal(goalId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/goals/${goalId}`);
    return response;
  },

  /**
   * Marcar Goal como completado
   */
  async toggleGoalCompletion(goalId: string): Promise<CreateGoalResponse> {
    const response = await apiClient.patch<CreateGoalResponse>(`/goals/${goalId}/toggle`, {});
    return response;
  },
};

