import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { projectService, lifeWheelService, type Project, type LifeArea } from '@/infrastructure/services';
import { getAreaIcon, getAreaColorVariants } from '@/shared/utils/lifeAreaHelpers';
import { BottomNav } from '@/shared/components';

/**
 * Página de gestión de proyectos por área
 */
export const AreaProjectsPage = () => {
  const { areaId } = useParams<{ areaId: string }>();
  const navigate = useNavigate();
  
  const [area, setArea] = useState<LifeArea | null>(null);
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

  const handleBack = () => {
    navigate('/home');
  };

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
          <button onClick={handleBack} className="mt-4 text-indigo-600 hover:text-indigo-700">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const colorVariants = getAreaColorVariants(area.areaName);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
          <button
            onClick={() => navigate(`/area/${areaId}/projects/create`)}
            className={`w-full sm:w-auto py-3 px-6 ${colorVariants.bg} text-white font-semibold rounded-xl transition-all shadow-lg hover:opacity-90`}
          >
            + Create New Project
          </button>
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
              <button
                onClick={() => navigate(`/area/${areaId}/projects/create`)}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Create your first project
              </button>
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

