import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OnboardingPage } from '../features/onboarding/pages';
import { LoginPage, RegisterPage } from '../features/auth/pages';
import { HomePage } from '../features/home/pages';

/**
 * Configuración de rutas de la aplicación
 */
export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta de onboarding/landing */}
        <Route path="/" element={<OnboardingPage />} />

        {/* Rutas de autenticación */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Página principal de la app */}
        <Route path="/home" element={<HomePage />} />

        {/* Ruta 404 - redirige a onboarding */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

