import { apiClient } from '../api/client';

/**
 * Servicio de usuarios
 * Maneja las peticiones relacionadas con usuarios
 */

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  avatarUrl?: string;
  acceptTermsAndPolicies: boolean;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  address: string;
  phone: string;
  avatarUrl: string;
}

export interface Context {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Action {
  id: string;
  content: string;
  isCompleted: boolean;
  dueDate?: string;
  completedAt?: string;
}

export interface Goal {
  id: string;
  goalType: 'BE' | 'DO' | 'HAVE';
  content: string;
  cost: number;
  saved: number;
  progress: number;
  isCompleted: boolean;
  actions: Action[];
}

export interface Budget {
  id: string;
  monthlyIncomeTarget: number;
  dailyIncomeTarget: number;
  currency: {
    code: string;
    name: string;
    symbol: string;
  };
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  budget?: Budget;
  goals: Goal[];
}

export interface LifeArea {
  id: string;
  areaId: string;
  areaName: string;
  score: number;
  projects: Project[];
}

export interface LifeWheel {
  id: string;
  globalScore: number;
  lifeAreas: LifeArea[];
}

export interface DashboardSummary {
  totalProjects: number;
  totalGoals: number;
  totalActions: number;
  completedGoals: number;
  completedActions: number;
  overdueActions: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  profile: UserProfile;
  lifeWheel: LifeWheel;
  createdAt: string;
}

export interface UserMeResponse {
  user: User;
  contexts: Context[];
  lifeWheel: LifeWheel;
  summary: DashboardSummary;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  address?: string;
  phone?: string;
  avatarUrl?: string;
}

export const userService = {
  /**
   * Registra un nuevo usuario
   * Endpoint: POST /users/register
   * No requiere autenticación
   */
  register: async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
    return apiClient.post<RegisterResponse>('/users/register', credentials);
  },

  /**
   * Obtiene el perfil del usuario actual
   * Endpoint: GET /users/me
   * Requiere: Bearer token en Authorization header (automático)
   */
  getMe: async (): Promise<UserMeResponse> => {
    return apiClient.get<UserMeResponse>('/users/me');
  },

  /**
   * Actualiza el perfil del usuario
   * Endpoint: PUT /users/update
   * Requiere: Bearer token en Authorization header (automático)
   */
  updateUser: async (data: UpdateUserData): Promise<UserMeResponse> => {
    return apiClient.put<UserMeResponse>('/users/update', data);
  },
};

