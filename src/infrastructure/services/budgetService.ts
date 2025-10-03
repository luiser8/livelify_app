import { apiClient } from '../api/client';

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
  createForProject: async (
    data: CreateBudgetForProjectRequest
  ): Promise<CreateBudgetResponse> => {
    return apiClient.post<CreateBudgetResponse>('/budgets/for-project', data);
  },
};

