import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ErrorBoundary, NotFoundPage } from '../shared/components';
import { MainAppRouter } from './MainAppRouter';
import LandingHomePage from '../features/landing/home/HomePage';
import { trackPageView, trackFbPageView } from '../features/landing/config/analytics';
import { AuthProvider } from '../features/auth/context';

/**
 * Componente para escuchar cambios de ruta y rastrear analytics
 */
function AnalyticsListener() {
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname + location.search;
    trackPageView(path);
    trackFbPageView();
  }, [location]);
  return null;
}

/**
 * Configuración de rutas de la aplicación
 * - / -> Landing page
 * - /app/* -> Aplicación principal de Livelify
 */
export const AppRouter = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AnalyticsListener />
        <Routes>
          {/* Landing page en la raíz */}
          <Route path="/" element={<LandingHomePage />} />

          {/* Todas las rutas de la aplicación bajo /app */}
          <Route 
            path="/app/*" 
            element={
              <AuthProvider>
                <MainAppRouter />
              </AuthProvider>
            } 
          />

          {/* Ruta 404 - Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

