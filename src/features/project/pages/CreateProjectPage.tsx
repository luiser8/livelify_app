import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { projectService, lifeWheelService, type LifeWheelArea } from '@/infrastructure/services';
import { getAreaIcon, getAreaColorVariants, getAreaTranslationKey, getSelectableAreas } from '@/shared/utils';
import { PageHeader, Copyright, BottomNav } from '@/shared/components';

/**
 * Página de creación de proyecto - Multi-step
 * Puede recibir un areaId opcional en la URL para pre-seleccionar el área
 */
export const CreateProjectPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { areaId: urlAreaId } = useParams<{ areaId?: string }>();
  
  const [lifeAreas, setLifeAreas] = useState<LifeWheelArea[]>([]);
  const [lifeAreasSelected, setLifeAreasSelected] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(urlAreaId ? 2 : 1); // Si viene con área, ir directo a step 2
  const [selectedAreaId, setSelectedAreaId] = useState<string>(urlAreaId || '');
  const [creating, setCreating] = useState(false);
  const [projectCountByArea, setProjectCountByArea] = useState<Map<string, number>>(new Map());
  
  // Calcular fechas mínimas y máximas
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Form data for project
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    expectedScore: 0,
    startDate: getTomorrowDate(),
    endDate: '',
  });

  // Estado para mensajes de validación de fechas
  const [dateError, setDateError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const lifeWheelData = await lifeWheelService.getMyLifeWheel();
        setLifeAreas(lifeWheelData.lifeAreas);
        setLifeAreasSelected(lifeWheelData.lifeAreasSelected || []);

        // Cargar TODOS los proyectos del usuario para contar proyectos por área
        try {
          const allProjectsData = await projectService.getAllProjects();
          const countMap = new Map<string, number>();
          
          // Contar TODOS los proyectos por área (sin importar el status)
          // Esto incluye ACTIVE, SOMEDAY, COMPLETED, CANCELLED
          allProjectsData.projects.forEach(project => {
            const currentCount = countMap.get(project.lifeWheelAreaId) || 0;
            countMap.set(project.lifeWheelAreaId, currentCount + 1);
          });
          
          setProjectCountByArea(countMap);
        } catch (error) {
          console.error('Error loading projects count:', error);
        }

        // Validar que TODAS las áreas estén completadas antes de permitir crear proyectos
        const allAreasAnswered = lifeWheelData.lifeAreas.length > 0 && 
          lifeWheelData.lifeAreas.every(area => area.isArchived);
        
        if (!allAreasAnswered) {
          // Si no todas las áreas están respondidas, redirigir al assessment
          navigate('/assessment/intro');
          return;
        }

        // Si viene con un areaId, verificar validaciones
        if (urlAreaId) {
          const selectedArea = lifeWheelData.lifeAreas.find(a => a.id === urlAreaId);

          // Validar que el área exista
          if (!selectedArea) {
            navigate('/home');
            return;
          }

          // Validar que el área esté entre las seleccionables
          const result = getSelectableAreas(lifeWheelData.lifeAreas);
          let enabledAreaIds = result.selectableAreaIds;

          // Priorizar lifeAreasSelected del backend si existe
          if (lifeWheelData.lifeAreasSelected && lifeWheelData.lifeAreasSelected.length === 3) {
            const backendSelectedIds = lifeWheelData.lifeAreasSelected
              .map((sel: any) => {
                const fullArea = lifeWheelData.lifeAreas.find((a: any) => a.areaId === sel.areaId);
                // Verificar que el área exista y no esté bloqueada
                return (fullArea && !fullArea.isBlocked) ? fullArea.id : null;
              })
              .filter(Boolean) as string[];

            if (backendSelectedIds.length === 3) {
              enabledAreaIds = new Set(backendSelectedIds);
            }
          } else if (result.requiresUserSelection && result.candidateAreas) {
            // Si no hay backend selection, intentar recuperar selección guardada en localStorage
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
          }

          if (!enabledAreaIds.has(urlAreaId)) {
            navigate('/home');
            return;
          }

          try {
            const projectsData = await projectService.getProjectsByArea(urlAreaId);
            // Contar TODOS los proyectos, no solo activos
            const totalProjects = projectsData.projects.length;

            // Si ya tiene 2 proyectos en total, redirigir
            if (totalProjects >= 2) {
              navigate(`/area/${urlAreaId}/projects`);
              return;
            }

            // Si el área ya alcanzó 10/10, redirigir (objetivo cumplido)
            if (selectedArea.score >= 10) {
              navigate(`/area/${urlAreaId}/projects`);
              return;
            }
          } catch (error) {
            console.error('Error checking project limit:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [urlAreaId, navigate]);

  const averageScore = lifeAreas.length > 0
    ? (lifeAreas.reduce((sum, area) => sum + area.score, 0) / lifeAreas.length).toFixed(1)
    : '0.0';

  const lowestArea = lifeAreas.length > 0
    ? lifeAreas.reduce((min, area) => area.score < min.score ? area : min)
    : null;

  // Verificar si todas las áreas están evaluadas
  const allAreasEvaluated = lifeAreas.length > 0 && lifeAreas.every(area => area.isArchived);

  // Obtener las áreas seleccionables usando la nueva lógica inteligente
  const getLowestScoringAreaIds = () => {
    if (!allAreasEvaluated) {
      // Si no todas están evaluadas, permitir solo las evaluadas y no bloqueadas
      return new Set(lifeAreas.filter(area => area.isArchived && !area.isBlocked).map(area => area.id));
    }

    // Priorizar lifeAreasSelected del backend si existe
    if (lifeAreasSelected && lifeAreasSelected.length === 3) {
      const backendSelectedIds = lifeAreasSelected
        .map((sel: any) => {
          const fullArea = lifeAreas.find((a: any) => a.areaId === sel.areaId);
          // Verificar que el área exista y no esté bloqueada
          return (fullArea && !fullArea.isBlocked) ? fullArea.id : null;
        })
        .filter(Boolean) as string[];

      if (backendSelectedIds.length === 3) {
        return new Set(backendSelectedIds);
      }
    }

    // Si no hay backend selection, usar la lógica inteligente
    const result = getSelectableAreas(lifeAreas);
    
    // Si requiere selección del usuario, intentar recuperar de localStorage
    if (result.requiresUserSelection && result.candidateAreas) {
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
            parsed.areaIds.every((id: string) => {
              const area = lifeAreas.find(a => a.id === id);
              // Verificar que el área exista, esté en las seleccionables y no esté bloqueada
              return area && !area.isBlocked && allSelectableAreas.some(selArea => selArea.id === id);
            });

          if (stillValid) {
            return new Set(parsed.areaIds);
          }
        } catch (e) {
          console.error('Error parsing stored selection:', e);
        }
      }
    }

    return result.selectableAreaIds;
  };

  const enabledAreaIds = getLowestScoringAreaIds();

  const handleSelectArea = (areaId: string) => {
    // Solo permitir seleccionar áreas habilitadas
    if (!enabledAreaIds.has(areaId)) {
      return;
    }

    // Verificar que el área no tenga ya 2 proyectos en total (sin importar status)
    const totalProjectsCount = projectCountByArea.get(areaId) || 0;
    if (totalProjectsCount >= 2) {
      // Redirigir al área si ya tiene 2 proyectos en total
      navigate(`/area/${areaId}/projects`);
      return;
    }

    // Verificar que el área no haya alcanzado el puntaje máximo de 10/10
    const selectedArea = lifeAreas.find(a => a.id === areaId);
    if (selectedArea && selectedArea.score >= 10) {
      // Si ya tiene 10/10, redirigir al área (objetivo cumplido)
      navigate(`/area/${areaId}/projects`);
      return;
    }

    // Si todo está bien, continuar al siguiente paso
    setSelectedAreaId(areaId);
    setCurrentStep(2);
  };

  // Validar duración del proyecto (3-6 meses)
  const validateProjectDuration = (startDate: string, endDate: string): boolean => {
    if (!startDate || !endDate) return false;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calcular diferencia en meses
    const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const daysDiff = end.getDate() - start.getDate();

    // Ajustar si los días hacen que no llegue al mes completo
    const totalMonths = daysDiff >= 0 ? monthsDiff : monthsDiff - 1;

    if (totalMonths < 3) {
      setDateError(t('projects.create.dateErrorMin'));
      return false;
    }

    if (totalMonths > 6) {
      setDateError(t('projects.create.dateErrorMax'));
      return false;
    }

    setDateError('');
    return true;
  };

  // Calcular fecha mínima y máxima para End Date basada en Start Date
  const getMinEndDate = (startDate: string): string => {
    if (!startDate) return '';
    const start = new Date(startDate);
    start.setMonth(start.getMonth() + 3);
    return start.toISOString().split('T')[0];
  };

  const getMaxEndDate = (startDate: string): string => {
    if (!startDate) return '';
    const start = new Date(startDate);
    start.setMonth(start.getMonth() + 6);
    return start.toISOString().split('T')[0];
  };

  // Manejar cambio de fecha de inicio
  const handleStartDateChange = (newStartDate: string) => {
    setFormData({ ...formData, startDate: newStartDate, endDate: '' });
    setDateError('');
  };

  // Manejar cambio de fecha de fin
  const handleEndDateChange = (newEndDate: string) => {
    setFormData({ ...formData, endDate: newEndDate });
    validateProjectDuration(formData.startDate, newEndDate);
  };

  const handleCreateProject = async () => {
    if (!selectedAreaId) return;

    // Validar fechas antes de crear
    if (!validateProjectDuration(formData.startDate, formData.endDate)) {
      return;
    }

    try {
      setCreating(true);
      
      // Verificar una vez más el límite de proyectos antes de crear (doble validación)
      const projectsData = await projectService.getProjectsByArea(selectedAreaId);
      const totalProjects = projectsData.projects.length;

      if (totalProjects >= 2) {
        // Si ya tiene 2 proyectos en total, redirigir
        navigate(`/area/${selectedAreaId}/projects`);
        return;
      }

      // Verificar que el área no haya alcanzado 10/10 (doble validación)
      const areaToValidate = lifeAreas.find(a => a.id === selectedAreaId);
      if (areaToValidate && areaToValidate.score >= 10) {
        // Si ya tiene 10/10, redirigir (objetivo cumplido)
        navigate(`/area/${selectedAreaId}/projects`);
        return;
      }

      await projectService.createFromLifeWheelArea({
        lifeWheelAreaId: selectedAreaId,
        ...formData,
      });

      // Navigate back to appropriate page after creating project
      if (urlAreaId) {
        navigate(`/area/${urlAreaId}/projects`);
      } else {
        navigate('/projects');
      }
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setCreating(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">{t('projects.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <PageHeader 
        title={t('projects.create.title')}
        subtitle={t('projects.create.subtitle')}
        backPath={urlAreaId ? `/area/${urlAreaId}/projects` : '/projects'}
        showSearch={false}
        showFilter={false}
      />

      {/* Progress indicator */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between mb-2 gap-2">
            <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
              {t('projects.create.step')} {currentStep} {t('projects.create.of')} 2
            </span>
            <span className="text-xs sm:text-sm text-gray-500 truncate">
              {currentStep === 1 && t('projects.create.step1Title')}
              {currentStep === 2 && t('projects.create.step2Title')}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 2) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6">
        {/* Step 1: Choose Area */}
        {currentStep === 1 && (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{t('projects.create.step1Title')}</h2>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto px-4">
                {t('projects.create.step1Description')}
              </p>
            </div>

            {/* Life Wheel visualization */}
            <div className="text-center mb-4 sm:mb-6">
              <div className="inline-flex items-center gap-2 mb-2 flex-wrap justify-center">
                <span className="text-xs sm:text-sm text-gray-600">{t('projects.create.yourLifeWheel')}</span>
                <span className="text-xs sm:text-sm font-bold text-gray-900">{t('projects.create.avg')}: {averageScore}/10</span>
              </div>
              <p className="text-xs text-gray-500 px-4">{t('projects.create.recommendation')}</p>
            </div>

            {/* Areas grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {lifeAreas.map((area) => {
                const potentialPoints = Math.max(0, 10 - area.score);
                const isEvaluated = area.isArchived;
                const totalProjectsCount = projectCountByArea.get(area.id) || 0;
                const hasReachedLimit = totalProjectsCount >= 2;
                const hasMaxScore = area.score >= 10; // Ya alcanzó el objetivo de 10/10
                const isEnabled = enabledAreaIds.has(area.id) && !hasReachedLimit && !hasMaxScore;
                const isLocked = isEvaluated && (!enabledAreaIds.has(area.id) || hasReachedLimit || hasMaxScore);
                
                return (
                  <button
                    key={area.id}
                    onClick={() => handleSelectArea(area.id)}
                    disabled={!isEnabled}
                    className={`bg-white border-2 rounded-2xl p-4 sm:p-5 transition-all text-left group ${
                      isEnabled
                        ? 'border-gray-200 hover:border-indigo-500 cursor-pointer' 
                        : isLocked
                          ? 'border-red-200 opacity-60 cursor-not-allowed'
                          : 'border-amber-200 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className={`flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0 ${isEnabled ? 'group-hover:scale-110' : ''} transition-transform relative`} style={{ filter: isEnabled ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' : 'grayscale(50%)' }}>
                        {getAreaIcon(area.areaName)}
                        {!isEvaluated && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {isLocked && hasReachedLimit && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {isLocked && !hasReachedLimit && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-sm sm:text-base mb-1 truncate ${isEnabled ? 'text-gray-900' : isLocked ? 'text-red-700' : 'text-amber-700'}`}>
                          {t(getAreaTranslationKey(area.areaName))}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base sm:text-lg font-bold text-gray-900">{!area.isArchived ? '—' : area.score}</span>
                          <span className="text-xs sm:text-sm text-gray-500">/10</span>
                          {/* Mostrar contador de proyectos totales - siempre visible en áreas evaluadas */}
                          {isEvaluated && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-auto ${
                              hasReachedLimit 
                                ? 'bg-red-100 text-red-700' 
                                : totalProjectsCount > 0
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-600'
                            }`}>
                              {totalProjectsCount}/2 {t('projects.create.projects')}
                            </span>
                          )}
                        </div>
                        {isEnabled ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                              +{potentialPoints} {t('projects.create.potential')}
                            </span>
                          </div>
                        ) : hasMaxScore ? (
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                            ✅ {t('projects.create.goalAchieved')}
                          </span>
                        ) : hasReachedLimit ? (
                          <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full font-medium">
                            🔒 {t('projects.create.maxReached')}
                          </span>
                        ) : isLocked ? (
                          <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full font-medium">
                            🔒 {t('projects.create.locked')}
                          </span>
                        ) : (
                          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full font-medium">
                            ⓘ {t('projects.create.assessmentRequired')}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Warning for unevaluated areas */}
            {lifeAreas.some(area => !area.isArchived) && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm sm:text-base text-amber-900 mb-1">{t('projects.create.assessmentRequired')}</p>
                    <p className="text-xs sm:text-sm text-amber-800 mb-3">
                      {t('projects.create.assessmentRequiredMessage')}
                    </p>
                    <button
                      onClick={() => navigate('/home')}
                      className="w-full sm:w-auto px-4 py-2 bg-amber-600 text-white font-medium text-xs sm:text-sm rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      {t('projects.create.completeAssessment')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Info about locked areas (high scoring) */}
            {allAreasEvaluated && lifeAreas.some(area => !enabledAreaIds.has(area.id)) && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm sm:text-base text-blue-900 mb-1">{t('projects.create.focusLowestTitle')}</p>
                    <p className="text-xs sm:text-sm text-blue-800">
                      {t('projects.create.focusLowestMessage')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Recommendation */}
            {lowestArea && lowestArea.isArchived && enabledAreaIds.has(lowestArea.id) && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm sm:text-base text-gray-900 mb-1">{t('projects.create.aiRecommendation')}</p>
                    <p className="text-xs sm:text-sm text-gray-700">
                      {t('projects.create.aiRecommendationMessage', { areaName: lowestArea.areaName, score: lowestArea.score })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* View All Areas Details */}
            <div className="text-center pt-4">
              <button 
                onClick={() => navigate('/home')}
                className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
              >
                {t('projects.create.viewAllAreas')}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Project Details */}
        {currentStep === 2 && (
          <div className="space-y-4 sm:space-y-6">
            {selectedAreaId && (
              <>
                {(() => {
                  const selectedArea = lifeAreas.find(a => a.id === selectedAreaId);
                  const colorVariants = selectedArea ? getAreaColorVariants(selectedArea.areaName) : null;
                  return selectedArea && colorVariants ? (
                    <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }}>
                        {getAreaIcon(selectedArea.areaName)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600">{t('projects.create.selectedArea')}</p>
                        <p className="font-bold text-sm sm:text-base text-gray-900 truncate">{t(getAreaTranslationKey(selectedArea.areaName))}</p>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Title */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    {t('projects.create.projectTitle')} *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={t('projects.create.projectTitlePlaceholder')}
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    {t('projects.create.description')} *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={t('projects.create.descriptionPlaceholder')}
                    required
                  />
                </div>

                {/* Expected Score */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    {t('projects.create.expectedScore')} *
                  </label>
                  <input
                    type="number"
                    value={formData.expectedScore}
                    onChange={(e) => setFormData({ ...formData, expectedScore: parseInt(e.target.value) })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={t('projects.create.expectedScorePlaceholder')}
                    min={0}
                    max={10}
                    required
                  />
                </div>

                {/* Dates */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        {t('projects.create.startDate')} *
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        min={getTomorrowDate()}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">{t('projects.create.startDateHelp')}</p>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        {t('projects.create.endDate')} *
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleEndDateChange(e.target.value)}
                        min={getMinEndDate(formData.startDate)}
                        max={getMaxEndDate(formData.startDate)}
                        disabled={!formData.startDate}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {formData.startDate 
                          ? `${t('projects.create.between')} ${getMinEndDate(formData.startDate)} ${t('projects.create.and')} ${getMaxEndDate(formData.startDate)}`
                          : t('projects.create.selectStartFirst')}
                      </p>
                    </div>
                  </div>

                  {/* Error de validación de fechas */}
                  {dateError && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-red-700 font-medium">{dateError}</p>
                      </div>
                    </div>
                  )}

                  {/* Info sobre duración */}
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div className="text-xs text-blue-700">
                        <p className="font-semibold mb-1">{t('projects.create.durationGuidelines')}</p>
                        <ul className="space-y-1 list-disc list-inside">
                          <li>{t('projects.create.guidelineStart')}</li>
                          <li>{t('projects.create.guidelineMin')}</li>
                          <li>{t('projects.create.guidelineMax')}</li>
                          <li>{t('projects.create.guidelineRecommended')}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="w-full sm:flex-1 py-2.5 sm:py-3 px-4 sm:px-6 text-sm sm:text-base border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                  >
                    {t('projects.create.back')}
                  </button>
                  <button
                    onClick={handleCreateProject}
                    disabled={creating || !formData.title || !formData.description || !formData.startDate || !formData.endDate || !!dateError}
                    className="w-full sm:flex-1 py-2.5 sm:py-3 px-4 sm:px-6 text-sm sm:text-base bg-indigo-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? t('projects.create.creating') : t('projects.create.createProject')}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <Copyright />
      <BottomNav />
    </div>
  );
};

