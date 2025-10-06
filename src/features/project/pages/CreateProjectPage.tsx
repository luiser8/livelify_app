import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectService, lifeWheelService, type LifeWheelArea } from '@/infrastructure/services';
import { getAreaIcon, getAreaColorVariants } from '@/shared/utils/lifeAreaHelpers';
import { PageHeader } from '@/shared/components';

/**
 * Página de creación de proyecto - Multi-step
 * Puede recibir un areaId opcional en la URL para pre-seleccionar el área
 */
export const CreateProjectPage = () => {
  const navigate = useNavigate();
  const { areaId: urlAreaId } = useParams<{ areaId?: string }>();
  
  const [lifeAreas, setLifeAreas] = useState<LifeWheelArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(urlAreaId ? 2 : 1); // Si viene con área, ir directo a step 2
  const [selectedAreaId, setSelectedAreaId] = useState<string>(urlAreaId || '');
  const [creating, setCreating] = useState(false);
  
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

        // Si viene con un areaId, verificar validaciones
        if (urlAreaId) {
          const selectedArea = lifeWheelData.lifeAreas.find(a => a.id === urlAreaId);
          
          // Validar que el área esté evaluada (score > 0)
          if (selectedArea && selectedArea.score === 0) {
            console.log('Area not evaluated yet, redirecting...');
            navigate('/home');
            return;
          }

          // Validar que el área esté en las 3 más bajas (si todas están evaluadas)
          const allEvaluated = lifeWheelData.lifeAreas.every(area => area.score > 0);
          if (allEvaluated) {
            const sortedAreas = [...lifeWheelData.lifeAreas].sort((a, b) => a.score - b.score);
            const lowestThreeIds = new Set(sortedAreas.slice(0, 3).map(a => a.id));
            
            if (!lowestThreeIds.has(urlAreaId)) {
              console.log('Area not in lowest 3, redirecting...');
              navigate('/home');
              return;
            }
          }
          
          try {
            const projectsData = await projectService.getProjectsByArea(urlAreaId);
            const activeProjects = projectsData.projects.filter(p => p.status === 'ACTIVE');
            
            // Si ya tiene 2 proyectos activos, redirigir
            if (activeProjects.length >= 2) {
              console.log('Area has reached project limit, redirecting...');
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
  const allAreasEvaluated = lifeAreas.length > 0 && lifeAreas.every(area => area.score > 0);

  // Obtener las 3 áreas con menor puntaje (solo si todas están evaluadas)
  const getLowestScoringAreaIds = () => {
    if (!allAreasEvaluated) {
      // Si no todas están evaluadas, permitir todas las evaluadas
      return new Set(lifeAreas.filter(area => area.score > 0).map(area => area.id));
    }
    
    // Si todas están evaluadas, solo las 3 más bajas
    const sortedAreas = [...lifeAreas].sort((a, b) => a.score - b.score);
    const lowestThree = sortedAreas.slice(0, 3);
    return new Set(lowestThree.map(area => area.id));
  };

  const enabledAreaIds = getLowestScoringAreaIds();

  const handleSelectArea = (areaId: string) => {
    // Solo permitir seleccionar áreas habilitadas
    if (enabledAreaIds.has(areaId)) {
      setSelectedAreaId(areaId);
      setCurrentStep(2);
    }
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
      setDateError('El proyecto debe durar mínimo 3 meses');
      return false;
    }
    
    if (totalMonths > 6) {
      setDateError('El proyecto debe durar máximo 6 meses');
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
          <p className="text-gray-500 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <PageHeader 
        title="Create Project"
        subtitle="90-Day Transformation"
        backPath={urlAreaId ? `/area/${urlAreaId}/projects` : '/projects'}
        showSearch={false}
        showFilter={false}
      />

      {/* Progress indicator */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of 2
            </span>
            <span className="text-sm text-gray-500">
              {currentStep === 1 && 'Choose Focus Area'}
              {currentStep === 2 && 'Project Details'}
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
      <main className="max-w-7xl mx-auto w-full px-6 py-6">
        {/* Step 1: Choose Area */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Focus Area</h2>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Select the life area you want to transform over the next 90 days. Focus on one area for maximum impact.
              </p>
            </div>

            {/* Life Wheel visualization */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600">Your Life Wheel</span>
                <span className="text-sm font-bold text-gray-900">Avg: {averageScore}/10</span>
              </div>
              <p className="text-xs text-gray-500">We recommend starting with your lowest scoring area</p>
            </div>

            {/* Areas grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lifeAreas.map((area) => {
                const colorVariants = getAreaColorVariants(area.areaName);
                const potentialPoints = Math.max(0, 10 - area.score);
                const isEvaluated = area.score > 0;
                const isEnabled = enabledAreaIds.has(area.id);
                const isLocked = isEvaluated && !isEnabled;
                
                return (
                  <button
                    key={area.id}
                    onClick={() => handleSelectArea(area.id)}
                    disabled={!isEnabled}
                    className={`bg-white border-2 rounded-2xl p-5 transition-all text-left group ${
                      isEnabled
                        ? 'border-gray-200 hover:border-indigo-500 cursor-pointer' 
                        : isLocked
                          ? 'border-red-200 opacity-60 cursor-not-allowed'
                          : 'border-amber-200 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${colorVariants.bg} rounded-xl flex items-center justify-center text-2xl shadow-sm flex-shrink-0 ${isEnabled ? 'group-hover:scale-110' : ''} transition-transform relative`}>
                        {getAreaIcon(area.areaName)}
                        {!isEvaluated && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {isLocked && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-bold mb-1 ${isEnabled ? 'text-gray-900' : isLocked ? 'text-red-700' : 'text-amber-700'}`}>
                          {area.areaName}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-bold text-gray-900">{area.score === 0 ? '—' : area.score}</span>
                          <span className="text-sm text-gray-500">/10</span>
                        </div>
                        {isEnabled ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                              +{potentialPoints} potential
                            </span>
                            {lowestArea?.id === area.id && (
                              <span className="text-xs text-gray-600">Available</span>
                            )}
                          </div>
                        ) : isLocked ? (
                          <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full font-medium">
                            🔒 Locked - Focus on lower scoring areas
                          </span>
                        ) : (
                          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full font-medium">
                            ⓘ Assessment Required
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Warning for unevaluated areas */}
            {lifeAreas.some(area => area.score === 0) && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-amber-900 mb-1">Assessment Required</p>
                    <p className="text-sm text-amber-800 mb-3">
                      Some areas are not yet evaluated. You need to complete the Life Wheel assessment for each area before you can create projects in them.
                    </p>
                    <button
                      onClick={() => navigate('/home')}
                      className="px-4 py-2 bg-amber-600 text-white font-medium text-sm rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      Complete Assessment
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Info about locked areas (high scoring) */}
            {allAreasEvaluated && lifeAreas.some(area => !enabledAreaIds.has(area.id)) && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-blue-900 mb-1">Focus on Your Lowest Areas</p>
                    <p className="text-sm text-blue-800">
                      You can only create projects in your <span className="font-bold">3 lowest scoring areas</span>. This strategy helps you focus on what needs the most improvement. Higher scoring areas are temporarily locked 🔒 until you improve these priority areas.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Recommendation */}
            {lowestArea && lowestArea.score > 0 && enabledAreaIds.has(lowestArea.id) && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 mb-1">AI Recommendation</p>
                    <p className="text-sm text-gray-700">
                      Based on your Life Wheel assessment, <span className="font-semibold">{lowestArea.areaName}</span> has the lowest score ({lowestArea.score}/10) and highest improvement potential! Starting here could improve your overall life score by 15%.
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
                View All Areas Details
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Project Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {selectedAreaId && (
              <>
                {(() => {
                  const selectedArea = lifeAreas.find(a => a.id === selectedAreaId);
                  const colorVariants = selectedArea ? getAreaColorVariants(selectedArea.areaName) : null;
                  return selectedArea && colorVariants ? (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className={`w-12 h-12 ${colorVariants.bg} rounded-xl flex items-center justify-center text-2xl shadow-sm`}>
                        {getAreaIcon(selectedArea.areaName)}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Selected Area</p>
                        <p className="font-bold text-gray-900">{selectedArea.areaName}</p>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Improve Physical Fitness"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Describe your transformation goals and action plan..."
                    required
                  />
                </div>

                {/* Dates */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        min={getTomorrowDate()}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Must start from tomorrow onwards</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date (3-6 months) *
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleEndDateChange(e.target.value)}
                        min={getMinEndDate(formData.startDate)}
                        max={getMaxEndDate(formData.startDate)}
                        disabled={!formData.startDate}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.startDate 
                          ? `Between ${getMinEndDate(formData.startDate)} and ${getMaxEndDate(formData.startDate)}`
                          : 'Select start date first'}
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
                        <p className="font-semibold mb-1">📅 Project Duration Guidelines</p>
                        <ul className="space-y-1 list-disc list-inside">
                          <li>Start date must be from tomorrow onwards</li>
                          <li>Minimum duration: 3 months</li>
                          <li>Maximum duration: 6 months</li>
                          <li>90 days (3 months) is recommended for optimal transformation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreateProject}
                    disabled={creating || !formData.title || !formData.description || !formData.startDate || !formData.endDate || !!dateError}
                    className="flex-1 py-3 px-6 bg-indigo-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? 'Creating Project...' : 'Create Project'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

