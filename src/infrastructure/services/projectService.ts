import { apiClient } from '../api/client';
import { cacheApiCall, apiCache } from '@/shared/utils/apiCache';

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
 * Interfaz para el presupuesto del proyecto
 */
export interface ProjectBudget {
  id: string;
  monthlyIncomeTarget: number;
  dailyIncomeTarget: number;
  currencyCode: string;
  currencySymbol: string;
}

/**
 * Tipo para los estados del proyecto
 */
export type ProjectStatus = 'ACTIVE' | 'SOMEDAY' | 'COMPLETED' | 'CANCELLED';

/**
 * Interfaz para un proyecto
 */
export interface Project {
  id: string;
  lifeWheelAreaId: string;
  title: string;
  description: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  detail: ProjectDetail;
  budget?: ProjectBudget;
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
   * NOTA: Invalida los cachés relevantes después de crear
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
    const result = await apiClient.post<CreateProjectResponse>('/projects/from-lifewheel-area', data);
    
    // Invalidar cachés relacionados después de crear
    apiCache.remove('projects_all');
    apiCache.remove(`projects_area_${data.lifeWheelAreaId}`);
    apiCache.remove('user_me'); // También invalidar user_me porque contiene proyectos
    
    return result;
  },

  /**
   * Obtiene todos los proyectos de un área específica (CON CACHÉ)
   * Endpoint: GET /projects/by-area?area={areaId}
   *
   * @param areaId - ID del área del Life Wheel
   * @returns Lista de proyectos del área con estadísticas
   * 
   * Configuración de caché:
   * - Tipo: NORMAL (desde env)
   * - TTL: VITE_CACHE_TTL_NORMAL
   * - Max accesos: VITE_CACHE_MAX_ACCESS_NORMAL
   */
  getProjectsByArea: async (areaId: string): Promise<GetProjectsByAreaResponse> => {
    return cacheApiCall(
      `projects_area_${areaId}`,
      () => apiClient.get<GetProjectsByAreaResponse>(`/projects/by-area?area=${areaId}`),
      apiCache,
      
    );
  },

  /**
   * Obtiene todos los proyectos del usuario (CON CACHÉ)
   * Endpoint: GET /projects/me
   *
   * @returns Lista de todos los proyectos con estadísticas
   * 
   * Configuración de caché:
   * - Tipo: NORMAL (desde env)
   * - TTL: VITE_CACHE_TTL_NORMAL
   * - Max accesos: VITE_CACHE_MAX_ACCESS_NORMAL
   */
  getAllProjects: async (): Promise<GetAllProjectsResponse> => {
    return cacheApiCall(
      'projects_all',
      () => apiClient.get<GetAllProjectsResponse>('/projects/me'),
      apiCache,
      
    );
  },

  /**
   * Cambia el status de un proyecto
   * Endpoint: PUT /projects/{projectId}/status
   *
   * @param projectId - ID del proyecto
   * @param status - Nuevo status del proyecto (ACTIVE, SOMEDAY, COMPLETED, CANCELLED)
   * @returns Proyecto actualizado
   * 
   * NOTA: Invalida los cachés relevantes después de actualizar
   */
  updateStatus: async (projectId: string, status: ProjectStatus): Promise<{ success: boolean; project: Project }> => {
    const result = await apiClient.put<{ success: boolean; project: Project }>(`/projects/${projectId}/status`, { status });
    
    // Invalidar cachés después de actualizar status
    apiCache.remove('projects_all');
    // No podemos saber qué área específica sin hacer otra llamada, así que limpiamos todo lo relacionado con proyectos
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('projects_area_')) {
        apiCache.remove(key.replace('api_cache_', ''));
      }
    });
    apiCache.remove('user_me');
    
    return result;
  },
};

