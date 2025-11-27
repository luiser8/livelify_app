import { apiClient } from '../api/client';

/**
 * Servicio de autenticación
 * Maneja las peticiones relacionadas con autenticación
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface RequestPasswordRecoveryRequest {
  email: string;
  language: string;
}

export interface RequestPasswordRecoveryResponse {
  message: string;
}

export interface ResetPasswordRequest {
  hash: string;
  newPassword: string;
  language: string;
}

export interface ResetPasswordResponse {
  message: string;
  email?: string; // El email puede venir en la respuesta para hacer login automático
}

export const authService = {
  /**
   * Inicia sesión con email y password
   * Endpoint: POST /auth/login
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  },

  /**
   * Cierra la sesión del usuario
   * Endpoint: POST /auth/logout
   */
  logout: async (): Promise<void> => {
    return apiClient.post('/auth/logout');
  },

  /**
   * Obtiene la información del usuario actual
   * Endpoint: GET /auth/me
   */
  getCurrentUser: async () => {
    return apiClient.get('/auth/me');
  },

  /**
   * Refresca el token de autenticación
   * Endpoint: POST /auth/refresh
   */
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    return apiClient.post<RefreshTokenResponse>('/auth/refresh', { refresh_token: refreshToken });
  },

  /**
   * Solicita la recuperación de contraseña
   * Endpoint: POST /auth/request-password-recovery
   */
  requestPasswordRecovery: async (data: RequestPasswordRecoveryRequest): Promise<RequestPasswordRecoveryResponse> => {
    return apiClient.post<RequestPasswordRecoveryResponse>('/auth/request-password-recovery', data);
  },

  /**
   * Restablece la contraseña con el hash de recuperación
   * Endpoint: POST /auth/reset-password
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    return apiClient.post<ResetPasswordResponse>('/auth/reset-password', data);
  },
};

