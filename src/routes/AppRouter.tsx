import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OnboardingPage } from '../features/onboarding/pages';
import { LoginPage, RegisterPage } from '../features/auth/pages';
import { HomePage } from '../features/home/pages';
import { DashboardPage } from '../features/dashboard/pages';
import { ActionsPage } from '../features/actions/pages';
import { ProfilePage } from '../features/profile/pages';
import { ProjectsPage } from '../features/project/pages';
import { AssessmentIntroPage, AssessmentQuestionsPage } from '../features/assessment/pages';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

/**
 * Configuración de rutas de la aplicación
 */
export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta de onboarding/landing - accesible siempre */}
        <Route path="/" element={<OnboardingPage />} />

        {/* Rutas de autenticación - solo accesibles si NO está autenticado */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Rutas protegidas - requieren autenticación */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/actions" 
          element={
            <ProtectedRoute>
              <ActionsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/projects" 
          element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/assessment/intro" 
          element={
            <ProtectedRoute>
              <AssessmentIntroPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/assessment/area/:areaId" 
          element={
            <ProtectedRoute>
              <AssessmentQuestionsPage />
            </ProtectedRoute>
          } 
        />

        {/* Ruta 404 - redirige a onboarding */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

