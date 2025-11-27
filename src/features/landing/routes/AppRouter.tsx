import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ErrorBoundary, NotFoundPage } from '../shared/components';
import LandingHomePage from '../home/HomePage';
import { trackPageView, trackFbPageView } from '../config/analytics';

/**
 * Configuración de rutas de la aplicación
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

export const AppRouter = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AnalyticsListener />
        <Routes>
          {/* Ruta de onboarding/landing - accesible siempre */}
          <Route path="/" element={<LandingHomePage />} />
          {/* Ruta 404 - Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

