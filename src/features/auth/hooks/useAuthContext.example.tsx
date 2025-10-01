/**
 * EJEMPLO DE USO DEL CONTEXTO DE AUTENTICACIÓN
 * 
 * Este archivo muestra cómo usar el contexto de autenticación en tus componentes.
 * Puedes eliminar este archivo una vez que entiendas cómo funciona.
 */

import { useAuth } from '../context';
import { decodeToken, tokenToAuthUser, isTokenExpired } from '../../../shared/utils/jwt';

// ============================================
// Ejemplo 1: Usar el contexto en un componente
// ============================================
export const ExampleComponent = () => {
  const { user, isAuthenticated, login, logout, getToken } = useAuth();

  const handleLogin = () => {
    // Simula una respuesta del servidor con un token
    const tokenFromServer = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZWI1NDFiMS03ZjM5LTQ2ZTAtYmEyNy1kMGNlMThiOTRhOWUiLCJlbWFpbCI6Inl2YW5uYUBnbWFpbC5jb20iLCJmaXJzdE5hbWUiOiJZdmFubmEiLCJsYXN0TmFtZSI6Ik1vcmVubyIsInBob25lIjoiKzEyMzQ1Njc4OTAiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5MzMxMTcyLCJleHAiOjE3NTkzMzQ3NzJ9.example';

    // Decodifica el token
    const decoded = decodeToken(tokenFromServer);
    
    if (decoded) {
      // Verifica si el token ha expirado
      if (!isTokenExpired(tokenFromServer)) {
        // Convierte el token a AuthUser y hace login
        const authUser = tokenToAuthUser(decoded, tokenFromServer);
        login(authUser);
      } else {
        console.error('Token expirado');
      }
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <h1>Bienvenido, {user?.firstName} {user?.lastName}</h1>
          <p>Email: {user?.email}</p>
          <p>Teléfono: {user?.phone}</p>
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      ) : (
        <div>
          <h1>No has iniciado sesión</h1>
          <button onClick={handleLogin}>Iniciar Sesión</button>
        </div>
      )}
    </div>
  );
};

// ============================================
// Ejemplo 2: Obtener el token en una petición
// ============================================
export const useApiWithAuth = () => {
  const { getToken } = useAuth();

  const fetchProtectedData = async () => {
    const token = getToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch('/api/protected-endpoint', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.json();
  };

  return { fetchProtectedData };
};

// ============================================
// Ejemplo 3: Proteger una ruta
// ============================================
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    // Redirigir al login
    return <div>Redirigiendo al login...</div>;
  }

  return <>{children}</>;
};

// ============================================
// Ejemplo 4: Actualizar el loginUseCase
// ============================================
/*
import { authService } from '../../../infrastructure/services/authService';
import { decodeToken, tokenToAuthUser } from '../../../shared/utils/jwt';
import { useAuth } from '../context';

export const useLoginUseCase = () => {
  const { login } = useAuth();

  const loginUser = async (email: string, password: string) => {
    // 1. Llamar al servicio de autenticación
    const response = await authService.login({ email, password });
    
    // 2. Decodificar el token recibido
    const decoded = decodeToken(response.token);
    
    if (decoded) {
      // 3. Convertir a AuthUser
      const authUser = tokenToAuthUser(decoded, response.token);
      
      // 4. Guardar en el contexto y localStorage
      login(authUser);
      
      return authUser;
    }
    
    throw new Error('Token inválido');
  };

  return { loginUser };
};
*/

