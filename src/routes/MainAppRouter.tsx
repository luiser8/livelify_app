import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { OnboardingPage } from '../features/onboarding/pages';
import { LoginPage, RegisterPage, ActivateAccountPage, RequestPasswordRecoveryPage, ResetPasswordPage } from '../features/auth/pages';
import { HomePage } from '../features/home/pages';
import { DashboardPage } from '../features/dashboard/pages';
import { ActionsPage } from '../features/actions/pages';
import { ProfilePage } from '../features/profile/pages';
import { SubscriptionPage } from '../features/subscription/pages';
import { ProjectsPage, AreaProjectsPage, CreateProjectPage, ProjectGoalsPage } from '../features/project/pages';
import { AssessmentIntroPage, AssessmentQuestionsPage } from '../features/assessment/pages';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { NotFoundPage, SessionExpiredModal } from '../shared/components';

/**
 * Configuración de rutas de la aplicación principal (bajo /app)
 */
export const MainAppRouter = () => {
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    // Listener para el evento de sesión expirada
    const handleSessionExpired = () => {
      // Prevenir múltiples disparos del evento
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setShowSessionExpiredModal(true);
      }, 100);
    };

    window.addEventListener('session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      <Routes>
        {/* Ruta de onboarding - accesible siempre */}
        <Route path="/" element={<OnboardingPage />} />

        {/* Ruta de activación de cuenta - pública */}
        <Route path="/activate-account" element={<ActivateAccountPage />} />

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
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <RequestPasswordRecoveryPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPasswordPage />
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
          path="/subscription" 
          element={
            <ProtectedRoute>
              <SubscriptionPage />
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
          path="/projects/create" 
          element={
            <ProtectedRoute>
              <CreateProjectPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/projects/:projectId/goals" 
          element={
            <ProtectedRoute>
              <ProjectGoalsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/area/:areaId/projects" 
          element={
            <ProtectedRoute>
              <AreaProjectsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/area/:areaId/projects/create" 
          element={
            <ProtectedRoute>
              <CreateProjectPage />
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

        {/* Ruta 404 - Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Modal de sesión expirada */}
      <SessionExpiredModal 
        isOpen={showSessionExpiredModal} 
        onClose={() => setShowSessionExpiredModal(false)} 
      />
    </>
  );
};

