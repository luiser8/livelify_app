import { authService } from '../../../infrastructure/services/authService';
import type { LoginCredentials, LoginResponse } from '../../../infrastructure/services/authService';
import { decodeToken, tokenToAuthUser, isTokenExpired } from '../../../shared/utils/jwt';
import type { AuthUser } from '../../../shared/types/auth.types';

/**
 * Caso de uso: Login de usuario
 * Contiene la lógica de negocio para autenticar usuarios
 */

export interface LoginUseCaseResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

export const loginUseCase = async (
  credentials: LoginCredentials
): Promise<LoginUseCaseResponse> => {
  // Validaciones de negocio
  if (!credentials.email || !credentials.password) {
    throw new Error('Email y contraseña son requeridos');
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(credentials.email)) {
    throw new Error('Email inválido');
  }

  // Llamar al servicio de autenticación
  const response: LoginResponse = await authService.login(credentials);

  // Validar que el servidor retornó un token
  if (!response.access_token || !response.refresh_token) {
    throw new Error('El servidor no retornó un token válido');
  }

  // Decodificar el token JWT
  const decoded = decodeToken(response.access_token);

  if (!decoded) {
    throw new Error('Token inválido o corrupto');
  }

  // Verificar que el token no esté expirado
  if (isTokenExpired(response.access_token)) {
    throw new Error('El token ha expirado');
  }

  // Convertir el token decodificado a AuthUser
  const user = tokenToAuthUser(decoded, response.access_token, response.refresh_token);

  return {
    access_token: response.access_token,
    refresh_token: response.refresh_token,
    user,
  };
};

// Re-exportar tipos para conveniencia
export type { LoginCredentials, LoginResponse };

