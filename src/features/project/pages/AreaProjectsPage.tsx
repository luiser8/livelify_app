import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { projectService, lifeWheelService, type Project, type LifeWheelArea } from '@/infrastructure/services';
import { getAreaIcon, getAreaColorVariants } from '@/shared/utils/lifeAreaHelpers';
import { BottomNav, PageHeader } from '@/shared/components';

/**
 * Página de gestión de proyectos por área
 */
export const AreaProjectsPage = () => {
  const { areaId } = useParams<{ areaId: string }>();
  const navigate = useNavigate();
  
  const [area, setArea] = useState<LifeWheelArea | null>(null);
  const [projectsData, setProjectsData] = useState<{ projects: Project[]; totalProjects: number; activeProjects: number; completedProjects: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!areaId) return;
      
      try {
        setLoading(true);
        
        // Fetch area details
        const lifeWheelData = await lifeWheelService.getMyLifeWheel();
        const currentArea = lifeWheelData.lifeAreas.find(a => a.id === areaId);
        setArea(currentArea || null);
        
        // Fetch projects for this area
        const areaProjectsData = await projectService.getProjectsByArea(areaId);
        setProjectsData(areaProjectsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [areaId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!area) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Area not found</p>
          <button onClick={() => navigate('/home')} className="mt-4 text-indigo-600 hover:text-indigo-700">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const colorVariants = getAreaColorVariants(area.areaName);
  
  // Validar límite de proyectos: máximo 2 proyectos activos por área
  const activeProjectsCount = projectsData?.projects.filter(p => p.status === 'ACTIVE').length || 0;
  const hasReachedLimit = activeProjectsCount >= 2;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <PageHeader 
        title={area.areaName}
        subtitle={`Score: ${area.score}/10`}
        backPath="/home"
        showSearch={false}
        showFilter={false}
      />

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto w-full px-6 py-6">
        {/* Header del área */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 ${colorVariants.bg} rounded-2xl flex items-center justify-center text-3xl shadow-lg border-4 border-white`}>
              {getAreaIcon(area.areaName)}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{area.areaName}</h1>
              <p className="text-gray-500">Score: {area.score}/10</p>
            </div>
          </div>

          {/* Botón para crear proyecto */}
          <div>
            <button
              onClick={() => navigate(`/area/${areaId}/projects/create`)}
              disabled={hasReachedLimit}
              className={`w-full sm:w-auto py-3 px-6 font-semibold rounded-xl transition-all shadow-lg ${
                hasReachedLimit 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60' 
                  : `${colorVariants.bg} text-white hover:opacity-90`
              }`}
            >
              + Create New Project
            </button>
            
            {/* Mensaje de límite alcanzado */}
            {hasReachedLimit && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold">Maximum projects reached</p>
                    <p className="mt-1">You can only have up to 2 active projects per area. Complete or archive an existing project to create a new one.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Estadísticas */}
        {projectsData && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{projectsData.totalProjects}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{projectsData.activeProjects}</div>
              <div className="text-xs text-gray-500">Active</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
              <div className="text-2xl font-bold text-gray-400">{projectsData.completedProjects}</div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
          </div>
        )}

        {/* Lista de proyectos */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Projects in this Area</h2>
          
          {!projectsData || projectsData.projects.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <p className="text-gray-500 mb-4">No projects yet in this area</p>
              {!hasReachedLimit && (
                <button
                  onClick={() => navigate(`/area/${areaId}/projects/create`)}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Create your first project
                </button>
              )}
            </div>
          ) : (
            projectsData.projects.map((project) => {
              const isExpanded = expandedProject === project.id;
              return (
                <div key={project.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  {/* Header del proyecto */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-12 h-12 ${colorVariants.bg} rounded-xl flex items-center justify-center text-2xl shadow-sm flex-shrink-0`}>
                        {getAreaIcon(area.areaName)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{project.title}</h3>
                        <p className="text-sm text-gray-600">{project.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-2"
                    >
                      <svg 
                        className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Barra de progreso */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-bold text-gray-900">{project.detail.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${colorVariants.bg} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${project.detail.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Acciones completadas */}
                  <div className="bg-blue-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {project.detail.completedActions} of {project.detail.totalActions} actions complete
                        </p>
                        <p className="text-xs text-gray-600">
                          {project.detail.totalActions - project.detail.completedActions} more
                        </p>
                      </div>
                      <span className="ml-auto text-lg font-bold text-blue-600">
                        {project.detail.completedActions}/{project.detail.totalActions}
                      </span>
                    </div>
                  </div>

                  {/* Contenido expandido */}
                  {isExpanded && (
                    <div className="space-y-4 mt-4 pt-4 border-t border-gray-200">
                      {/* Status */}
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          project.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                          project.status === 'COMPLETED' ? 'bg-gray-100 text-gray-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {project.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          project.detail.status === 'PLANNING' ? 'bg-blue-100 text-blue-700' :
                          project.detail.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-700' :
                          project.detail.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {project.detail.status}
                        </span>
                      </div>

                      {/* Fechas */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Start: {new Date(project.detail.startDate).toLocaleDateString()}</span>
                        </div>
                        <span>→</span>
                        <div className="flex items-center gap-2">
                          <span>End: {new Date(project.detail.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex gap-3 pt-2">
                        <button 
                          onClick={() => navigate(`/projects/${project.id}/goals`)}
                          className="flex-1 py-2 px-4 bg-purple-100 text-purple-700 font-medium rounded-xl hover:bg-purple-200 transition-colors"
                        >
                          📝 Goals
                        </button>
                        <button className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">
                          Edit
                        </button>
                        <button className={`flex-1 py-2 px-4 ${colorVariants.bg} text-white font-medium rounded-xl hover:opacity-90 transition-all`}>
                          View Details
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

