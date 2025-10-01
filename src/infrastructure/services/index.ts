/**
 * Exportaciones centralizadas de servicios
 */

// Servicio de autenticación
export { authService } from './authService';
export type { LoginCredentials, LoginResponse } from './authService';

// Servicio de usuarios
export { userService } from './userService';
export type { RegisterCredentials, RegisterResponse } from './userService';

