import { DecodedToken, AuthUser } from '../types/auth.types';

/**
 * Decodifica un token JWT
 * @param token - Token JWT a decodificar
 * @returns Datos decodificados del token
 */
export const decodeToken = (token: string): DecodedToken | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as DecodedToken;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Verifica si un token ha expirado
 * @param token - Token JWT a verificar
 * @returns true si el token ha expirado, false en caso contrario
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

/**
 * Convierte un token decodificado en un objeto AuthUser
 * @param decodedToken - Token decodificado
 * @param token - Token original (string)
 * @returns Objeto AuthUser
 */
export const tokenToAuthUser = (
  decodedToken: DecodedToken,
  access_token: string,
  refresh_token: string
): AuthUser => {
  return {
    userId: decodedToken.sub,
    email: decodedToken.email,
    firstName: decodedToken.firstName,
    lastName: decodedToken.lastName,
    phone: decodedToken.phone,
    address: decodedToken.address,
    access_token: access_token,
    refresh_token: refresh_token,
  };
};

/**
 * Obtiene el nombre completo del usuario desde el token
 * @param token - Token JWT
 * @returns Nombre completo del usuario
 */
export const getFullNameFromToken = (token: string): string => {
  const decoded = decodeToken(token);
  if (!decoded) return '';
  return `${decoded.firstName} ${decoded.lastName}`.trim();
};

