/**
 * Exportaciones centralizadas de servicios
 */

// Servicio de autenticación
export { authService } from './authService';
export type { LoginCredentials, LoginResponse, RefreshTokenRequest, RefreshTokenResponse } from './authService';

// Servicio de usuarios
export { userService } from './userService';
export type { 
  RegisterCredentials, 
  RegisterResponse, 
  UserMeResponse,
  User,
  DashboardSummary,
  LifeArea,
  Action,
  UpdateUserData
} from './userService';

// Re-export types from userService with aliases to avoid conflicts
export type { Goal as UserGoal, Project as UserProject, Budget as UserBudget } from './userService';

// Servicio de Life Wheel
export { lifeWheelService } from './lifeWheelService';
export type { LifeWheelResponse, LifeArea as LifeWheelArea } from './lifeWheelService';

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
  ProjectStatus,
  ProjectDetail,
  ProjectBudget,
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
  GetMyContextsResponse
} from './contextService';

// Servicio de Goals
export { goalService } from './goalService';
export type {
  Goal,
  GoalType,
  CreateGoalRequest,
  CreateGoalResponse,
  MyGoalsResponse
} from './goalService';

// Servicio de Subscriptions
export { subscriptionService } from './subscriptionService';
export type {
  Subscription,
  PlanType,
  GetAllSubscriptionsResponse,
  UserSubscription,
  Plan,
  PlanFeatures,
  AddSubscriptionRequest,
  UpdateSubscriptionRequest
} from './subscriptionService';

// Servicio de Actions
export { actionService } from './actionService';
export type {
  Action as ActionItem,
  EnergyLevel,
  CreateActionRequest,
  CreateActionResponse,
  MyActionsResponse
} from './actionService';

// Servicio de Términos y Condiciones
export { documentsService } from './documentsService';
