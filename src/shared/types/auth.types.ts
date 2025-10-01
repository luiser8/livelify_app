/**
 * Tipos relacionados con autenticación
 */

/**
 * Estructura del token JWT decodificado
 */
export interface DecodedToken {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

/**
 * Información del usuario autenticado
 */
export interface AuthUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  access_token: string;
  refresh_token: string;
}

/**
 * Estado inicial del usuario autenticado
 */
export const authUserInitial: AuthUser = {
  userId: '',
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  access_token: '',
  refresh_token: '',
};

