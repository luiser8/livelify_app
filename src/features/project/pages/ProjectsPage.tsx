import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BottomNav, PageHeader, Copyright, AlertBanner } from '@/shared/components';
import { projectService, lifeWheelService, type GetAllProjectsResponse, type Project, type ProjectStatus, type LifeWheelArea } from '@/infrastructure/services';
import { getAreaIcon, getAreaColorVariants } from '@/shared/utils/lifeAreaHelpers';

/**
 * Página de Projects (Proyectos)
 */
export const ProjectsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [projectsData, setProjectsData] = useState<GetAllProjectsResponse | null>(null);
  const [lifeAreas, setLifeAreas] = useState<LifeWheelArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [showActiveProjects, setShowActiveProjects] = useState(true);
  const [showSomedayProjects, setShowSomedayProjects] = useState(false);
  const [showCompletedProjects, setShowCompletedProjects] = useState(false);
  const [showCancelledProjects, setShowCancelledProjects] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleStatusChange = async (projectId: string, newStatus: ProjectStatus, project: Project) => {
    // Validar que todas las acciones estén completadas antes de marcar como COMPLETED
    if (newStatus === 'COMPLETED') {
      // Caso 1: No hay acciones creadas (totalActions === 0)
      if (project.detail.totalActions === 0) {
        setErrorMessage(t('projects.cannotCompleteWithoutActions'));
        setTimeout(() => setErrorMessage(null), 5000);
        return;
      }
      
      // Caso 2: Hay acciones pero no todas están completadas
      if (project.detail.completedActions < project.detail.totalActions) {
        setErrorMessage(t('projects.cannotCompleteWithPendingActions', {
          completed: project.detail.completedActions,
          total: project.detail.totalActions
        }));
        setTimeout(() => setErrorMessage(null), 5000);
        return;
      }
    }
    
    try {
      await projectService.updateStatus(projectId, newStatus);
      // Recargar datos
      const projects = await projectService.getAllProjects();
      setProjectsData(projects);
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  const activeProjects = projectsData?.projects.filter(p => p.status === 'ACTIVE') || [];
  const somedayProjects = projectsData?.projects.filter(p => p.status === 'SOMEDAY') || [];
  const completedProjects = projectsData?.projects.filter(p => p.status === 'COMPLETED') || [];
  const cancelledProjects = projectsData?.projects.filter(p => p.status === 'CANCELLED') || [];

  const ProjectCard = ({ project }: { project: Project }) => {
    const area = getAreaByProjectId(project.lifeWheelAreaId);
    const colorVariants = area ? getAreaColorVariants(area.areaName) : null;
    const isExpanded = expandedProject === project.id;

    // Calcular duración y tiempo restante del proyecto
    const calculateProjectDuration = () => {
      const start = new Date(project.detail.startDate);
      const end = new Date(project.detail.endDate);
      const today = new Date();
      
      // Resetear horas para calcular días completos
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      // Total de días del proyecto
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      // Días transcurridos
      const elapsedDays = Math.max(0, Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      
      // Días restantes
      const remainingDays = Math.max(0, Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
      
      // Día actual del proyecto (limitado al total)
      const currentDay = Math.min(elapsedDays, totalDays);
      
      return {
        totalDays,
        currentDay,
        remainingDays,
        isOverdue: today > end
      };
    };

    const duration = calculateProjectDuration();

    return (
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-3 sm:mb-4">
        {/* Header del proyecto */}
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
            {area && colorVariants && (
              <div className="flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }}>
                {getAreaIcon(area.areaName)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 truncate">{project.title}</h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-2 truncate">{area?.areaName || 'Unknown Area'}</p>
              <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2">{project.description}</p>
              
              {/* Expected Score */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {t('projects.expectedScore')}: {project.expectedScore}
                </span>
              </div>
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
            <span className="text-sm text-gray-600">{t('projects.progress')}</span>
            <span className="text-sm font-bold text-gray-900">{project.detail.progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`${colorVariants?.bg || 'bg-indigo-500'} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${project.detail.progressPercentage}%` }}
            />
          </div>
          
          {/* Información de duración destacada */}
          <div className={`mt-3 p-3 rounded-lg ${
            duration.isOverdue 
              ? 'bg-red-50 border border-red-200' 
              : duration.remainingDays <= 7 
                ? 'bg-amber-50 border border-amber-200' 
                : 'bg-indigo-50 border border-indigo-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className={`w-4 h-4 ${
                  duration.isOverdue 
                    ? 'text-red-600' 
                    : duration.remainingDays <= 7 
                      ? 'text-amber-600' 
                      : 'text-indigo-600'
                }`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <p className={`text-sm font-bold ${
                  duration.isOverdue 
                    ? 'text-red-900' 
                    : duration.remainingDays <= 7 
                      ? 'text-amber-900' 
                      : 'text-indigo-900'
                }`}>
                  {t('projects.day')} <span className="text-base">{duration.currentDay}</span> {t('projects.of')} <span className="text-base">{duration.totalDays}</span>
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">•</span>
                <p className={`text-sm font-semibold ${
                  duration.isOverdue 
                    ? 'text-red-700' 
                    : duration.remainingDays <= 7 
                      ? 'text-amber-700' 
                      : 'text-indigo-700'
                }`}>
                  {duration.isOverdue 
                    ? t('projects.overdue')
                    : `${duration.remainingDays} ${duration.remainingDays === 1 ? t('projects.day') : t('projects.days')} ${t('projects.remaining')}`}
                </p>
              </div>
            </div>
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
                {project.detail.completedActions} {t('projects.of')} {project.detail.totalActions} {t('projects.actionsComplete')}
              </p>
              <p className="text-xs text-gray-600">
                {project.detail.totalActions - project.detail.completedActions} {t('projects.more')}
              </p>
            </div>
            <span className="ml-auto text-lg font-bold text-blue-600">
              {project.detail.completedActions}/{project.detail.totalActions}
            </span>
          </div>
        </div>

        {/* Budget Information */}
        {project.budget && (
          <div className="bg-green-50 rounded-xl p-4 mb-4 border border-green-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-green-900 mb-2">{t('projects.incomeTarget')}</p>
                <div className="space-y-1">
                  <p className="text-xs text-gray-700">
                    {t('projects.incomeMessage')}{' '}
                    <span className="font-bold text-green-700">
                      {project.budget.currencySymbol}{project.budget.dailyIncomeTarget.toFixed(2)} {t('projects.perDay')}
                    </span>
                    {' '}{t('projects.or')}{' '}
                    <span className="font-bold text-green-700">
                      {project.budget.currencySymbol}{project.budget.monthlyIncomeTarget.toFixed(2)} {t('projects.perMonth')}
                    </span>
                    {' '}{t('projects.in')}{' '}
                    <span className="font-semibold">{project.budget.currencyCode}</span>.
                  </p>
                  <p className="text-xs text-green-800 mt-2 italic">
                    {t('projects.incomeNote')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenido expandido */}
        {isExpanded && (
          <div className="space-y-4 mt-4 pt-4 border-t border-gray-200">

            {/* Botones de acción */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => navigate(`/projects/${project.id}/goals`)}
                className="py-2 px-4 bg-purple-100 text-purple-700 font-medium rounded-xl hover:bg-purple-200 transition-colors"
              >
                {t('projects.viewGoals')}
              </button>

              {/* Selector de status */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('projects.changeStatus')}</label>
                <select
                  value={project.status}
                  onChange={(e) => handleStatusChange(project.id, e.target.value as ProjectStatus, project)}
                  className="w-full py-2 px-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-medium"
                >
                  <option value="ACTIVE">🟢 {t('projects.active')}</option>
                  <option value="SOMEDAY">📅 {t('projects.someday')}</option>
                  <option value="COMPLETED">✅ {t('projects.completed')}</option>
                  <option value="CANCELLED">❌ {t('projects.cancelled')}</option>
                </select>
              </div>
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
          <p className="text-gray-500 mt-4">{t('projects.loadingProjects')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* Header */}
      <PageHeader 
        title={t('projects.title')}
        subtitle={t('projects.myProjects')}
        showBackButton={true}
        showSearch={false}
        showFilter={false}
      />

      {/* Error Message Banner */}
      {errorMessage && (
        <AlertBanner
          type="error"
          title={t('projects.cannotComplete')}
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
          autoCloseDuration={5000}
        />
      )}

      {/* Contenido principal */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {/* Estadísticas */}
        <div className="mb-4 sm:mb-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{activeProjects.length}</div>
              <div className="text-xs text-gray-500 leading-tight">{t('projects.active')}</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{somedayProjects.length}</div>
              <div className="text-xs text-gray-500 leading-tight">{t('projects.someday')}</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{completedProjects.length}</div>
              <div className="text-xs text-gray-500 leading-tight">{t('projects.completed')}</div>
            </div>
          </div>
        </div>

        {/* Active Projects */}
        <div className="mb-6">
          <button
            onClick={() => setShowActiveProjects(!showActiveProjects)}
            className="w-full flex items-center justify-between mb-4"
          >
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              {t('projects.activeProjects')}
              <span className="text-sm font-normal text-gray-500">{activeProjects.length}</span>
            </h2>
            <button className="text-indigo-600 text-sm font-medium hover:text-indigo-700">
              {showActiveProjects ? t('projects.hide') : t('projects.viewAll')}
            </button>
          </button>

          {showActiveProjects && (
            <div>
              {activeProjects.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center">
                  <p className="text-gray-500">{t('projects.noActiveProjects')}</p>
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
              {t('projects.somedayMaybe')}
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
              {t('projects.completed')}
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

        {/* Cancelled */}
        <div className="mb-6">
          <button
            onClick={() => setShowCancelledProjects(!showCancelledProjects)}
            className="w-full flex items-center justify-between mb-4"
          >
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-3 h-3 bg-red-400 rounded-full"></span>
              {t('projects.cancelled')}
              <span className="text-sm font-normal text-gray-500">{cancelledProjects.length}</span>
            </h2>
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform ${showCancelledProjects ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showCancelledProjects && cancelledProjects.length > 0 && (
            <div>
              {cancelledProjects.map(project => (
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

      <Copyright />
      <BottomNav />
    </div>
  );
};
