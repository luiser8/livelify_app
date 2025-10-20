import { apiClient } from '../api/client';
import { apiCache } from '@/shared/utils/apiCache';

export interface CreateBudgetForProjectRequest {
  projectId: string;
  currencyCode: string;
  monthlyIncomeTarget: number;
  dailyIncomeTarget: number;
}

export interface Budget {
  id: string;
  projectId: string;
  currencyCode: string;
  monthlyIncomeTarget: number;
  dailyIncomeTarget: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetResponse {
  success: boolean;
  budget: Budget;
  message?: string;
}

export const budgetService = {
  /**
   * Crear presupuesto para un proyecto
   * NOTA: Invalida cachés de proyectos
   */
  createForProject: async (
    data: CreateBudgetForProjectRequest
  ): Promise<CreateBudgetResponse> => {
    const result = await apiClient.post<CreateBudgetResponse>('/budgets/for-project', data);
    
    // Invalidar cachés después de crear presupuesto
    apiCache.remove('projects_all');
    apiCache.remove(`projects_area_${data.projectId}`);
    apiCache.remove('user_me');
    
    return result;
  },
};

