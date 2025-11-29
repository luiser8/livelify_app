/* eslint-disable @typescript-eslint/no-unused-vars */
import { apiClient } from '../api/client';
import { cacheApiCall, apiCache } from '@/shared/utils/apiCache';

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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
  type?: 'FREE' | 'PREMIUM';
}

export interface UpdateSubscriptionRequest {
  id: string;
  planId: string;
  currencyId: string;
  amountPaid?: number;
}

export const subscriptionService = {
  /**
   * Obtiene todos los planes de suscripción disponibles (CON CACHÉ)
   * Endpoint: GET /subscription/all
   * 
   * Configuración de caché:
   * - Tipo: STATIC (desde env)
   * - TTL: VITE_CACHE_TTL_STATIC
   * - Max accesos: VITE_CACHE_MAX_ACCESS_STATIC
   */
  getAllPlans: async (): Promise<GetAllSubscriptionsResponse> => {
    return cacheApiCall(
      'subscription_plans_all',
      () => apiClient.get<GetAllSubscriptionsResponse>('/subscription/all'),
      apiCache,
      
    );
  },

  /**
   * Obtiene la suscripción actual del usuario (CON CACHÉ)
   * Endpoint: GET /users/my-subscription
   * 
   * Configuración de caché:
   * - Tipo: SEMI_STATIC (desde env)
   * - TTL: VITE_CACHE_TTL_SEMI_STATIC
   * - Max accesos: VITE_CACHE_MAX_ACCESS_SEMI_STATIC
   */
  getMySubscription: async (): Promise<UserSubscription | null> => {
    try {
      return await cacheApiCall(
        'subscription_me',
        () => apiClient.get<UserSubscription>('/users/my-subscription'),
        apiCache,

      );
    } catch (error) {
      return null;
    }
  },

  /**
   * Suscribe al usuario a un plan (primera vez)
   * Endpoint: POST /users/add-subscription
   * 
   * NOTA: Invalida caché de suscripción
   */
  subscribeToPlan: async (data: AddSubscriptionRequest): Promise<UserSubscription> => {
    const result = await apiClient.post<UserSubscription>('/users/add-subscription', {
      ...data,
      type: 'FREE',
    });

    // Invalidar caché después de suscribirse
    apiCache.remove('subscription_me');
    apiCache.remove('user_me');

    return result;
  },

  /**
   * Actualiza la suscripción existente del usuario a un nuevo plan
   * Endpoint: PUT /users/update-subscription
   * 
   * NOTA: Invalida caché de suscripción
   */
  updateSubscription: async (data: UpdateSubscriptionRequest): Promise<UserSubscription> => {
    const result = await apiClient.put<UserSubscription>('/users/update-subscription', data);
    
    // Invalidar caché después de actualizar
    apiCache.remove('subscription_me');
    apiCache.remove('user_me');
    
    return result;
  },

  /**
   * Cancela la suscripción actual del usuario
   * Endpoint: POST /subscription/cancel
   * 
   * NOTA: Invalida caché de suscripción
   */
  cancelSubscription: async (): Promise<{ message: string }> => {
    const result = await apiClient.post<{ message: string }>('/subscription/cancel');

    // Invalidar caché después de cancelar
    apiCache.remove('subscription_me');
    apiCache.remove('user_me');

    return result;
  },
};

