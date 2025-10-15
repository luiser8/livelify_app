import { apiClient } from '../api/client';

/**
 * Servicio de suscripciones
 * Maneja las peticiones relacionadas con planes de suscripción
 */

export type PlanType = 'MONTHLY' | 'QUARTERLY' | 'SEMESTER' | 'ANNUAL';

export interface PlanFeatures {
  actions: number;
  projects: number;
  analytics: 'ENABLED' | 'DISABLED';
}

export interface Plan {
  id: string;
  name: PlanType;
  description: string;
  basePrice: number;
  pricePerMonth: number;
  savings: number;
  discount: number;
  billingCycle: number; // Meses
  bestFor: string;
  features: PlanFeatures;
  isActive?: boolean;
}

export interface Subscription extends Plan {
  // Los planes disponibles son iguales a Plan
}

export interface GetAllSubscriptionsResponse {
  subscriptions: Subscription[];
}

export interface UserSubscription {
  id: string;
  currencyId: string;
  startDate: string;
  endDate: string;
  renewalDate: string;
  active: boolean;
  autoRenew: boolean;
  amountPaid: number;
  paymentMethod: string;
  paymentProvider: string;
  plan: Plan;
  createdAt: string;
  updatedAt: string;
}

export interface AddSubscriptionRequest {
  planId: string;
  currencyId: string;
  amountPaid?: number;
}

export interface UpdateSubscriptionRequest {
  id: string;
  planId: string;
  currencyId: string;
  amountPaid?: number;
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
  subscribeToPlan: async (data: AddSubscriptionRequest): Promise<UserSubscription> => {
    return apiClient.post<UserSubscription>('/users/add-subscription', data);
  },

  /**
   * Actualiza la suscripción existente del usuario a un nuevo plan
   * Endpoint: PUT /users/update-subscription
   */
  updateSubscription: async (data: UpdateSubscriptionRequest): Promise<UserSubscription> => {
    return apiClient.put<UserSubscription>('/users/update-subscription', data);
  },

  /**
   * Cancela la suscripción actual del usuario
   * Endpoint: POST /subscription/cancel
   */
  cancelSubscription: async (): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/subscription/cancel');
  },
};

