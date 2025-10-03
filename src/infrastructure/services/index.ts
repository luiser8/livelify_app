/**
 * Exportaciones centralizadas de servicios
 */

// Servicio de autenticación
export { authService } from './authService';
export type { LoginCredentials, LoginResponse } from './authService';

// Servicio de usuarios
export { userService } from './userService';
export type { RegisterCredentials, RegisterResponse } from './userService';

// Servicio de Life Wheel
export { lifeWheelService } from './lifeWheelService';
export type { LifeWheelResponse, LifeArea } from './lifeWheelService';

// Servicio de Assessment
export { assessmentService } from './assessmentService';
export type { 
  AssessmentQuestion, 
  AreaQuestionsResponse,
  Area
} from './assessmentService';

// Servicio de Answers
export { answerService } from './answerService';
export type {
  Answer,
  SubmitAreaAnswersRequest,
  SubmitAreaAnswersResponse
} from './answerService';

// Servicio de Proyectos
export { projectService } from './projectService';
export type {
  CreateProjectFromAreaRequest,
  CreateProjectResponse,
  Project,
  ProjectDetail,
  GetProjectsByAreaResponse,
  GetAllProjectsResponse
} from './projectService';

// Servicio de Monedas
export { currencyService } from './currencyService';
export type {
  Currency,
  GetAllCurrenciesResponse
} from './currencyService';

// Servicio de Presupuestos
export { budgetService } from './budgetService';
export type {
  CreateBudgetForProjectRequest,
  CreateBudgetResponse,
  Budget
} from './budgetService';

// Servicio de Contextos
export { contextService } from './contextService';
export type {
  Context,
  AddContextRequest,
  AddContextResponse,
  GetMyContextsResponse
} from './contextService';

