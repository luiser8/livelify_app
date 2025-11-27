import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { projectService, lifeWheelService, type Project, type LifeWheelArea } from '@/infrastructure/services';
import { getAreaIcon, getAreaColorVariants, getSelectableAreas } from '@/shared/utils';
import { BottomNav, PageHeader, Copyright, AlertBanner } from '@/shared/components';

/**
 * Página de gestión de proyectos por área
 */
export const AreaProjectsPage = () => {
  const { areaId } = useParams<{ areaId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [area, setArea] = useState<LifeWheelArea | null>(null);
  const [projectsData, setProjectsData] = useState<{ projects: Project[]; totalProjects: number; activeProjects: number; completedProjects: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      if (!areaId) return;
      
      try {
        setLoading(true);
        
        // Fetch area details
        const lifeWheelData = await lifeWheelService.getMyLifeWheel();
        const currentArea = lifeWheelData.lifeAreas.find(a => a.id === areaId);
        setArea(currentArea || null);
        
        // Validar que TODAS las áreas estén completadas (isArchived)
        const allAreasAnswered = lifeWheelData.lifeAreas.length > 0 && 
          lifeWheelData.lifeAreas.every(area => area.isArchived);
        
        if (!allAreasAnswered) {
          // Si no todas las áreas están respondidas, redirigir al assessment
          navigate('/app/assessment/intro');
          return;
        }
        
        // Si todas están completadas, verificar que el área actual esté entre las seleccionables
        const result = getSelectableAreas(lifeWheelData.lifeAreas);
        let enabledAreaIds = result.selectableAreaIds;
        
        // Si requiere selección del usuario, verificar localStorage o backend
        if (result.requiresUserSelection && result.candidateAreas) {
          // Intentar recuperar selección guardada en localStorage
          const storedSelection = localStorage.getItem('userAreaSelection');
          if (storedSelection) {
            try {
              const parsed = JSON.parse(storedSelection);
              const allSelectableAreas = [
                ...(result.autoSelectedAreas || []),
                ...(result.candidateAreas || [])
              ];
              
              const stillValid =
                Array.isArray(parsed.areaIds) &&
                parsed.areaIds.length === 3 &&
                parsed.areaIds.every((id: string) =>
                  allSelectableAreas.some(area => area.id === id)
                );

              if (stillValid) {
                enabledAreaIds = new Set(parsed.areaIds);
              }
            } catch (e) {
              console.error('Error parsing stored selection:', e);
            }
          }
          
          // Si no hay localStorage, revisar backend
          if (!storedSelection && lifeWheelData.lifeAreasSelected && lifeWheelData.lifeAreasSelected.length > 0) {
            const backendSelectedIds = lifeWheelData.lifeAreasSelected
              .map((sel: any) => {
                const fullArea = lifeWheelData.lifeAreas.find((a: any) => a.areaId === sel.areaId);
                return fullArea?.id ?? null;
              })
              .filter(Boolean) as string[];

            if (backendSelectedIds.length === 3) {
              enabledAreaIds = new Set(backendSelectedIds);
            }
          }
        }
        
        if (!enabledAreaIds.has(areaId)) {
          // Si el área no está entre las seleccionables, redirigir al home
          navigate('/app/home');
          return;
        }
        
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
  }, [areaId, navigate]);

  // Verificar sessionStorage para mensaje de proyecto creado (en efecto separado)
  useEffect(() => {
    const projectCreated = sessionStorage.getItem('projectCreated');
    const projectTitle = sessionStorage.getItem('projectTitle');
    
    if (projectCreated === 'true' && projectTitle) {
      setSuccessMessage(t('projects.projectCreated', { title: projectTitle }));
      // Limpiar sessionStorage
      sessionStorage.removeItem('projectCreated');
      sessionStorage.removeItem('projectTitle');
    }
  }, [t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">{t('areaProjects.loading')}</p>
        </div>
      </div>
    );
  }

  if (!area) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">{t('areaProjects.areaNotFound')}</p>
          <button onClick={() => navigate('/app/home')} className="mt-4 text-indigo-600 hover:text-indigo-700">
            {t('areaProjects.goBack')}
          </button>
        </div>
      </div>
    );
  }

  const colorVariants = getAreaColorVariants(area.areaName);
  
  // Validar que el área esté evaluada (isArchived)
  const isAreaEvaluated = area.isArchived;
  
  // Validar límite de proyectos: máximo 2 proyectos por área (sin importar el estado)
  const totalProjectsCount = projectsData?.projects.length || 0;
  const hasReachedLimit = totalProjectsCount >= 2;
  
  // No se puede crear proyecto si el área no está evaluada o si se alcanzó el límite
  const canCreateProject = isAreaEvaluated && !hasReachedLimit;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* Header */}
      <PageHeader 
        title={area.areaName}
        subtitle={`${t('areaProjects.score')}: ${area.score}/10`}
        backPath="/home"
        showSearch={false}
        showFilter={false}
      />

      {/* Alert Banners */}
      {successMessage && (
        <AlertBanner 
          type="success" 
          title={t('common.success')}
          message={successMessage} 
          onClose={() => setSuccessMessage('')}
          autoCloseDuration={3000}
        />
      )}
      {errorMessage && (
        <AlertBanner 
          type="error" 
          title={t('common.error')}
          message={errorMessage} 
          onClose={() => setErrorMessage('')}
          autoCloseDuration={5000}
        />
      )}

      {/* Contenido principal */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        {/* Header del área con botón de crear */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            {/* Información del área */}
            <div className="flex items-center gap-4">
              <div 
                className="flex items-center justify-center text-5xl p-4 rounded-2xl"
                style={{ 
                  background: `linear-gradient(135deg, ${colorVariants.bg} 0%, ${colorVariants.bgLight} 100%)`,
                  filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))'
                }}
              >
                {getAreaIcon(area.areaName)}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{area.areaName}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-gray-500">{t('areaProjects.score')}:</span>
                  <span className="text-xl font-bold" style={{ color: colorVariants.text }}>
                    {area.score}/10
                  </span>
                </div>
              </div>
            </div>

            {/* Botón para crear proyecto */}
            <button
              onClick={() => navigate(`/app/area/${areaId}/projects/create`)}
              disabled={!canCreateProject}
              className={`w-full sm:w-auto py-3 px-6 font-semibold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                !canCreateProject 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60' 
                  : 'bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{t('areaProjects.createNewProject')}</span>
            </button>
          </div>
          {/* Mensajes de advertencia */}
          {!isAreaEvaluated && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-red-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="font-bold text-red-900 mb-1">{t('areaProjects.assessmentRequired')}</p>
                  <p className="text-sm text-red-800 mb-3">
                    {t('areaProjects.assessmentRequiredDesc')}
                  </p>
                  <button
                    onClick={() => navigate('/app/home')}
                    className="px-4 py-2 bg-red-600 text-white font-medium text-sm rounded-lg"
                  >
                    {t('areaProjects.completeAssessment')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {isAreaEvaluated && hasReachedLimit && (
            <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="font-bold text-amber-900 mb-1">{t('areaProjects.maxProjectsReached')}</p>
                  <p className="text-sm text-amber-800">
                    {t('areaProjects.maxProjectsReachedDesc')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lista de proyectos */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            {t('areaProjects.projectsInArea')}
            <span className="text-sm font-normal text-gray-500">
              ({totalProjectsCount}/2)
            </span>
          </h2>
          
          {!projectsData || projectsData.projects.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border-2 border-dashed border-gray-200">
              <div className="max-w-sm mx-auto">
                <div className="text-6xl mb-4 opacity-20">📋</div>
                <p className="text-gray-500 text-lg mb-6">{t('areaProjects.noProjects')}</p>
                {canCreateProject && (
                  <button
                    onClick={() => navigate(`/app/area/${areaId}/projects/create`)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('areaProjects.createFirstProject')}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {projectsData.projects.map((project) => (
                <div 
                  key={project.id} 
                  className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  {/* Header del proyecto */}
                  <div className="p-6">
                    {/* Título con botón de objetivos */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Icono del área con gradiente */}
                        <div 
                          className="flex items-center justify-center text-4xl p-3 rounded-xl shrink-0"
                          style={{ 
                            background: `linear-gradient(135deg, ${colorVariants.bg} 0%, ${colorVariants.bgLight} 100%)`,
                            filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.15))'
                          }}
                        >
                          {getAreaIcon(area.areaName)}
                        </div>
                        
                        {/* Título y descripción */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                            {project.title}
                          </h3>
                          
                          {/* Porcentaje de progreso */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm font-semibold text-gray-700">{t('areaProjects.progress')}:</span>
                            <span className="text-lg font-bold text-gray-900">{project.detail.progressPercentage}%</span>
                          </div>
                          
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {project.description}
                          </p>
                          
                          {/* Status badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              project.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                              project.status === 'COMPLETED' ? 'bg-gray-100 text-gray-700' :
                              project.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {t(`areaProjects.status.${project.status}`)}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              project.detail.status === 'PLANNING' ? 'bg-blue-100 text-blue-700' :
                              project.detail.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-700' :
                              project.detail.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {t(`areaProjects.status.${project.detail.status}`)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Botón de Objetivos - Siempre visible */}
                      <button 
                        onClick={() => navigate(`/app/projects/${project.id}/goals`)}
                        className="shrink-0 px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold text-white bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-sm sm:text-base whitespace-nowrap"
                      >
                        {t('areaProjects.buttons.viewGoals')}
                      </button>
                    </div>

                    {/* Grid de información */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      {/* Fechas */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 font-medium">{t('areaProjects.timeline')}</p>
                          <p className="font-semibold text-gray-700 truncate">
                            {new Date(project.detail.startDate).toLocaleDateString()} → {new Date(project.detail.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Acciones completadas */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
                        <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium">{t('areaProjects.completedActions')}</p>
                          <p className="font-bold text-blue-600">
                            {project.detail.completedActions}/{project.detail.totalActions}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Copyright />
      <BottomNav />
    </div>
  );
};

