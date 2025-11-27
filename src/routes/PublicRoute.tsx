import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context';

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * Componente para rutas públicas (login/register)
 * Si el usuario ya está autenticado, redirige a /app/home
 */
export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar loading mientras se verifica la sesión
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  // Si ya está autenticado, redirigir a home
  if (isAuthenticated) {
    return <Navigate to="/app/home" replace />;
  }

  // Si no está autenticado, mostrar el contenido (login/register)
  return <>{children}</>;
};

