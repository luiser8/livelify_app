import { userService } from '../../../infrastructure/services/userService';
import type { RegisterCredentials, RegisterResponse } from '../../../infrastructure/services/userService';

/**
 * Caso de uso: Registro de usuario
 * Contiene la lógica de negocio para registrar nuevos usuarios
 */

export interface RegisterUseCaseResponse {
  success: boolean;
  userId: string;
  email: string;
  message: string;
}

export const registerUseCase = async (
  credentials: RegisterCredentials
): Promise<RegisterUseCaseResponse> => {
  // Validaciones de negocio
  if (!credentials.email || !credentials.password) {
    throw new Error('Email y contraseña son requeridos');
  }

  if (!credentials.firstName || !credentials.lastName) {
    throw new Error('Nombre y apellido son requeridos');
  }

  if (!credentials.phone) {
    throw new Error('Teléfono es requerido');
  }

  if (!credentials.address) {
    throw new Error('Dirección es requerida');
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(credentials.email)) {
    throw new Error('Email inválido');
  }

  // Validar longitud de password
  if (credentials.password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres');
  }

  // Validar formato de teléfono (básico)
  const phoneRegex = /^\+?[\d\s-()]+$/;
  if (!phoneRegex.test(credentials.phone)) {
    throw new Error('Formato de teléfono inválido');
  }

  // Llamar al servicio de registro de usuarios
  const response: RegisterResponse = await userService.register(credentials);

  // Validar que el servidor retornó el ID del usuario
  if (!response.id || !response.email) {
    throw new Error('El servidor no retornó la información del usuario');
  }

  // Validar que se creó el perfil
  if (!response.profile || !response.profile.firstName) {
    throw new Error('Error al crear el perfil del usuario');
  }

  return {
    success: true,
    userId: response.id,
    email: response.email,
    message: 'Usuario registrado exitosamente',
  };
};

// Re-exportar tipos para conveniencia
export type { RegisterCredentials, RegisterResponse };

