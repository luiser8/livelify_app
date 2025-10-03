import { apiClient } from '../api/client';

/**
 * Servicio de Proyectos
 * Maneja las peticiones relacionadas con la creación y gestión de proyectos
 */

/**
 * Interfaz para crear un proyecto desde un área del Life Wheel
 */
export interface CreateProjectFromAreaRequest {
  lifeWheelAreaId: string;
  title: string;
  description: string;
  startDate: string; // ISO date format: YYYY-MM-DD
  endDate: string; // ISO date format: YYYY-MM-DD
}

/**
 * Interfaz para el detalle del proyecto
 */
export interface ProjectDetail {
  id: string;
  lifeAreaId: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
  startDate: string;
  endDate: string;
  completedActions: number;
  totalActions: number;
  progressPercentage: number;
}

/**
 * Interfaz para un proyecto
 */
export interface Project {
  id: string;
  lifeWheelAreaId: string;
  title: string;
  description: string;
  status: 'ACTIVE' | 'SOMEDAY' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  detail: ProjectDetail;
}

/**
 * Interfaz para la respuesta de creación de proyecto
 */
export interface CreateProjectResponse {
  success: boolean;
  project: Project;
  message?: string;
}

/**
 * Interfaz para obtener proyectos por área
 */
export interface GetProjectsByAreaResponse {
  projects: Project[];
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
}

/**
 * Interfaz para obtener todos los proyectos del usuario
 */
export interface GetAllProjectsResponse {
  projects: Project[];
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
}

/**
 * Servicio de proyectos
 */
export const projectService = {
  /**
   * Crea un proyecto desde un área del Life Wheel
   * Endpoint: POST /projects/from-lifewheel-area
   *
   * @param data - Datos del proyecto a crear
   * @returns Respuesta con el proyecto creado
   *
   * @example
   * ```typescript
   * const result = await projectService.createFromLifeWheelArea({
   *   lifeWheelAreaId: "b5ca45fc-37cd-4125-b3de-064032c739bf",
   *   title: "Improve Physical Fitness",
   *   description: "A comprehensive plan to improve my physical fitness",
   *   startDate: "2025-09-30",
   *   endDate: "2025-12-31"
   * });
   * ```
   */
  createFromLifeWheelArea: async (
    data: CreateProjectFromAreaRequest
  ): Promise<CreateProjectResponse> => {
    return apiClient.post<CreateProjectResponse>('/projects/from-lifewheel-area', data);
  },

  /**
   * Obtiene todos los proyectos de un área específica
   * Endpoint: GET /projects/by-area?area={areaId}
   *
   * @param areaId - ID del área del Life Wheel
   * @returns Lista de proyectos del área con estadísticas
   */
  getProjectsByArea: async (areaId: string): Promise<GetProjectsByAreaResponse> => {
    return apiClient.get<GetProjectsByAreaResponse>(`/projects/by-area?area=${areaId}`);
  },

  /**
   * Obtiene todos los proyectos del usuario
   * Endpoint: GET /projects/me
   *
   * @returns Lista de todos los proyectos con estadísticas
   */
  getAllProjects: async (): Promise<GetAllProjectsResponse> => {
    return apiClient.get<GetAllProjectsResponse>('/projects/me');
  },
};

