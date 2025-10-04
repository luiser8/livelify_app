import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav, PageHeader } from '@/shared/components';
import { projectService, lifeWheelService, type GetAllProjectsResponse, type Project, type LifeWheelArea } from '@/infrastructure/services';
import { getAreaIcon, getAreaColorVariants } from '@/shared/utils/lifeAreaHelpers';

/**
 * Página de Projects (Proyectos)
 */
export const ProjectsPage = () => {
  const navigate = useNavigate();
  const [projectsData, setProjectsData] = useState<GetAllProjectsResponse | null>(null);
  const [lifeAreas, setLifeAreas] = useState<LifeWheelArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [showActiveProjects, setShowActiveProjects] = useState(true);
  const [showSomedayProjects, setShowSomedayProjects] = useState(false);
  const [showCompletedProjects, setShowCompletedProjects] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projects, lifeWheelData] = await Promise.all([
          projectService.getAllProjects(),
          lifeWheelService.getMyLifeWheel()
        ]);
        setProjectsData(projects);
        setLifeAreas(lifeWheelData.lifeAreas);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getAreaByProjectId = (lifeWheelAreaId: string) => {
    return lifeAreas.find(area => area.id === lifeWheelAreaId);
  };

  const activeProjects = projectsData?.projects.filter(p => p.status === 'ACTIVE') || [];
  const somedayProjects = projectsData?.projects.filter(p => p.status === 'SOMEDAY') || [];
  const completedProjects = projectsData?.projects.filter(p => p.status === 'COMPLETED') || [];

  const ProjectCard = ({ project }: { project: Project }) => {
    const area = getAreaByProjectId(project.lifeWheelAreaId);
    const colorVariants = area ? getAreaColorVariants(area.areaName) : null;
    const isExpanded = expandedProject === project.id;

    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-4">
        {/* Header del proyecto */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            {area && colorVariants && (
              <div className={`w-12 h-12 ${colorVariants.bg} rounded-xl flex items-center justify-center text-2xl shadow-sm flex-shrink-0`}>
                {getAreaIcon(area.areaName)}
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{project.title}</h3>
              <p className="text-sm text-gray-500 mb-2">{area?.areaName || 'Unknown Area'}</p>
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
              className={`${colorVariants?.bg || 'bg-indigo-500'} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${project.detail.progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            May 25 of 60 • <span className="text-gray-700">30 days remaining</span>
          </p>
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
            {/* Linked Competencies */}
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-purple-900">Linked Competencies</p>
                  <button className="text-sm text-purple-600 hover:text-purple-700 mt-1">View</button>
                </div>
              </div>
            </div>

            {/* Next Action */}
            <div className="bg-yellow-50 rounded-xl p-4">
              <p className="text-sm font-bold text-gray-900 mb-2">Next Action</p>
              <p className="text-sm text-gray-700 mb-2">Complete morning meditation session (15 min)</p>
              <p className="text-xs text-gray-600">
                <span className="text-yellow-700 font-medium">@Home • Due in 2 hours</span>
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center hover:bg-yellow-500 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Fecha límite */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Due: {new Date(project.detail.endDate).toLocaleDateString()}</span>
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
              <button className={`flex-1 py-2 px-4 ${colorVariants?.bg || 'bg-indigo-500'} text-white font-medium rounded-xl hover:opacity-90 transition-all`}>
                Complete
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* Header */}
      <PageHeader 
        title="Projects"
        subtitle="Manage your transformation goals"
        showBackButton={true}
        showSearch={true}
        showFilter={true}
        onSearchClick={() => console.log('Search clicked')}
        onFilterClick={() => console.log('Filter clicked')}
      >
        <div className="mt-4">
          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{activeProjects.length}</div>
              <div className="text-xs text-gray-500">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{somedayProjects.length}</div>
              <div className="text-xs text-gray-500">Someday</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{completedProjects.length}</div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
          </div>
        </div>
      </PageHeader>

      {/* Contenido principal */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* Active Projects */}
        <div className="mb-6">
          <button
            onClick={() => setShowActiveProjects(!showActiveProjects)}
            className="w-full flex items-center justify-between mb-4"
          >
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Active Projects
              <span className="text-sm font-normal text-gray-500">{activeProjects.length}</span>
            </h2>
            <button className="text-indigo-600 text-sm font-medium hover:text-indigo-700">
              {showActiveProjects ? 'Hide' : 'View All'}
            </button>
          </button>

          {showActiveProjects && (
            <div>
              {activeProjects.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center">
                  <p className="text-gray-500">No active projects</p>
                </div>
              ) : (
                activeProjects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))
              )}
            </div>
          )}
        </div>

        {/* Someday/Maybe */}
        <div className="mb-6">
          <button
            onClick={() => setShowSomedayProjects(!showSomedayProjects)}
            className="w-full flex items-center justify-between mb-4"
          >
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              Someday/Maybe
              <span className="text-sm font-normal text-gray-500">{somedayProjects.length}</span>
            </h2>
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform ${showSomedayProjects ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showSomedayProjects && somedayProjects.length > 0 && (
            <div>
              {somedayProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>

        {/* Completed */}
        <div className="mb-6">
          <button
            onClick={() => setShowCompletedProjects(!showCompletedProjects)}
            className="w-full flex items-center justify-between mb-4"
          >
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
              Completed
              <span className="text-sm font-normal text-gray-500">{completedProjects.length}</span>
            </h2>
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform ${showCompletedProjects ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showCompletedProjects && completedProjects.length > 0 && (
            <div>
              {completedProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Botón flotante */}
      <button
        onClick={() => navigate('/projects/create')}
        className="fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center z-20"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <BottomNav />
    </div>
  );
};
