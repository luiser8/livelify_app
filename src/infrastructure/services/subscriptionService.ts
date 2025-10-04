import { apiClient } from '../api/client';

/**
 * Servicio de suscripciones
 * Maneja las peticiones relacionadas con planes de suscripción
 */

export type PlanType = 'BASICO' | 'INTERMEDIO' | 'AVANZADO';

export interface PlanFeatures {
  actions: number;
  projects: number;
  analytics: boolean;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: string;
  features: PlanFeatures;
}

export interface Subscription {
  id: string;
  name: string;
  description: string;
  price: number;
  planType: PlanType;
  features: string[];
  isActive: boolean;
}

export interface GetAllSubscriptionsResponse {
  subscriptions: Subscription[];
}

export interface UserSubscription {
  id: string;
  planName: string;
  price: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  renewalDate: string;
  active: boolean;
  plan: Plan;
  createdAt: string;
  updatedAt: string;
}

export interface AddSubscriptionRequest {
  planId: string;
}

export interface UpdateSubscriptionRequest {
  id: string;
  planId: string;
}

export const subscriptionService = {
  /**
   * Obtiene todos los planes de suscripción disponibles
   * Endpoint: GET /subscription/all
   */
  getAllPlans: async (): Promise<GetAllSubscriptionsResponse> => {
    return apiClient.get<GetAllSubscriptionsResponse>('/subscription/all');
  },

  /**
   * Obtiene la suscripción actual del usuario
   * Endpoint: GET /users/my-subscription
   */
  getMySubscription: async (): Promise<UserSubscription | null> => {
    try {
      return await apiClient.get<UserSubscription>('/users/my-subscription');
    } catch (error) {
      return null;
    }
  },

  /**
   * Suscribe al usuario a un plan (primera vez)
   * Endpoint: POST /users/add-subscription
   */
  subscribeToPlan: async (planId: string): Promise<UserSubscription> => {
    return apiClient.post<UserSubscription>('/users/add-subscription', { planId });
  },

  /**
   * Actualiza la suscripción existente del usuario a un nuevo plan
   * Endpoint: PUT /users/update-subscription
   */
  updateSubscription: async (subscriptionId: string, planId: string): Promise<UserSubscription> => {
    return apiClient.put<UserSubscription>('/users/update-subscription', { 
      id: subscriptionId, 
      planId 
    });
  },

  /**
   * Cancela la suscripción actual del usuario
   * Endpoint: POST /subscription/cancel
   */
  cancelSubscription: async (): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/subscription/cancel');
  },
};

