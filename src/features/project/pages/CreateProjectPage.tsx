import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectService, lifeWheelService, currencyService, budgetService, type LifeArea, type Currency } from '@/infrastructure/services';
import { getAreaIcon, getAreaColorVariants } from '@/shared/utils/lifeAreaHelpers';

/**
 * Página de creación de proyecto - Multi-step
 * Puede recibir un areaId opcional en la URL para pre-seleccionar el área
 */
export const CreateProjectPage = () => {
  const navigate = useNavigate();
  const { areaId: urlAreaId } = useParams<{ areaId?: string }>();
  
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(urlAreaId ? 2 : 1); // Si viene con área, ir directo a step 2
  const [selectedAreaId, setSelectedAreaId] = useState<string>(urlAreaId || '');
  const [createdProjectId, setCreatedProjectId] = useState<string>('');
  const [creating, setCreating] = useState(false);
  
  // Form data for project
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  // Form data for budget
  const [budgetData, setBudgetData] = useState({
    currencyCode: 'USD',
    monthlyIncomeTarget: 0,
    dailyIncomeTarget: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [lifeWheelData, currenciesData] = await Promise.all([
          lifeWheelService.getMyLifeWheel(),
          currencyService.getAllCurrencies(),
        ]);
        setLifeAreas(lifeWheelData.lifeAreas);
        setCurrencies(currenciesData.currencies);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const averageScore = lifeAreas.length > 0 
    ? (lifeAreas.reduce((sum, area) => sum + area.score, 0) / lifeAreas.length).toFixed(1)
    : '0.0';
  
  const lowestArea = lifeAreas.length > 0
    ? lifeAreas.reduce((min, area) => area.score < min.score ? area : min)
    : null;

  const handleSelectArea = (areaId: string) => {
    setSelectedAreaId(areaId);
    setCurrentStep(2);
  };

  const handleCreateProject = async () => {
    if (!selectedAreaId) return;

    try {
      setCreating(true);
      const result = await projectService.createFromLifeWheelArea({
        lifeWheelAreaId: selectedAreaId,
        ...formData,
      });

      // Guardar el ID del proyecto creado y pasar al step 3 (Budget)
      setCreatedProjectId(result.project.id);
      setCurrentStep(urlAreaId ? 3 : 4); // Step 3 si vino con área, Step 4 si no
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateBudget = async () => {
    if (!createdProjectId) return;

    try {
      setCreating(true);
      await budgetService.createForProject({
        projectId: createdProjectId,
        ...budgetData,
      });

      // Navigate back to appropriate page
      if (urlAreaId) {
        navigate(`/area/${urlAreaId}/projects`);
      } else {
        navigate('/projects');
      }
    } catch (error) {
      console.error('Error creating budget:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleSkipBudget = () => {
    // Skip budget creation and navigate to projects
    if (urlAreaId) {
      navigate(`/area/${urlAreaId}/projects`);
    } else {
      navigate('/projects');
    }
  };

  // Auto-calculate daily target when monthly changes
  const handleMonthlyTargetChange = (value: number) => {
    const dailyTarget = value > 0 ? parseFloat((value / 30).toFixed(2)) : 0;
    setBudgetData({
      ...budgetData,
      monthlyIncomeTarget: value,
      dailyIncomeTarget: dailyTarget,
    });
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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(urlAreaId ? `/area/${urlAreaId}/projects` : '/projects')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-center flex-1">
              <h1 className="text-lg font-semibold text-gray-900">Create Project</h1>
              <p className="text-xs text-gray-500">90-Day Transformation</p>
            </div>
            <div className="w-10"></div>
          </div>
        </div>
      </header>

      {/* Progress indicator */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {urlAreaId ? '3' : '4'}
            </span>
            <span className="text-sm text-gray-500">
              {currentStep === 1 && 'Choose Focus Area'}
              {currentStep === 2 && 'Project Details'}
              {(currentStep === 3 || currentStep === 4) && 'Budget Setup'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / (urlAreaId ? 3 : 4)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
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
                
                return (
                  <button
                    key={area.id}
                    onClick={() => handleSelectArea(area.id)}
                    className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-indigo-500 transition-all text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${colorVariants.bg} rounded-xl flex items-center justify-center text-2xl shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        {getAreaIcon(area.areaName)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{area.areaName}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-bold text-gray-900">{area.score}</span>
                          <span className="text-sm text-gray-500">/10</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                            +{potentialPoints} potential
                          </span>
                          {lowestArea?.id === area.id && (
                            <span className="text-xs text-gray-600">Available</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* AI Recommendation */}
            {lowestArea && (
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date (90 days recommended) *
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
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
                    disabled={creating || !formData.title || !formData.description || !formData.endDate}
                    className="flex-1 py-3 px-6 bg-indigo-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? 'Creating Project...' : 'Continue to Budget'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 3/4: Budget Setup */}
        {(currentStep === 3 || currentStep === 4) && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">Set Your Financial Target</h2>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Optional</span>
              </div>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Define your income goals for this project. This helps track your progress and stay motivated. You can add this later.
              </p>
            </div>

            {/* Budget Form */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">
              <div className="space-y-6">
                {/* Currency Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency *
                  </label>
                  <select
                    value={budgetData.currencyCode}
                    onChange={(e) => setBudgetData({ ...budgetData, currencyCode: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    {currencies.map((currency) => (
                      <option key={currency.id} value={currency.code}>
                        {currency.symbol} {currency.name} ({currency.code})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">Select your preferred currency for this project</p>
                </div>

                {/* Monthly Target */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Income Target *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      {currencies.find(c => c.code === budgetData.currencyCode)?.symbol || '$'}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={budgetData.monthlyIncomeTarget || ''}
                      onChange={(e) => handleMonthlyTargetChange(parseFloat(e.target.value) || 0)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">How much do you want to earn per month from this project?</p>
                </div>

                {/* Daily Target (Auto-calculated) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Income Target
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      {currencies.find(c => c.code === budgetData.currencyCode)?.symbol || '$'}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={budgetData.dailyIncomeTarget || ''}
                      onChange={(e) => setBudgetData({ ...budgetData, dailyIncomeTarget: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Auto-calculated (Monthly ÷ 30 days). You can adjust manually.
                  </p>
                </div>

                {/* Summary Card */}
                {budgetData.monthlyIncomeTarget > 0 && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-5">
                    <h4 className="font-bold text-gray-900 mb-3">📊 Your Financial Goals</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Monthly Target</p>
                        <p className="text-lg font-bold text-gray-900">
                          {currencies.find(c => c.code === budgetData.currencyCode)?.symbol}
                          {budgetData.monthlyIncomeTarget.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Daily Target</p>
                        <p className="text-lg font-bold text-gray-900">
                          {currencies.find(c => c.code === budgetData.currencyCode)?.symbol}
                          {budgetData.dailyIncomeTarget.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info Box */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 mb-1">Track Your Progress</p>
                      <p className="text-xs text-gray-700">
                        Your budget will help you track daily progress and stay motivated. You can adjust these targets anytime.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Primary Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSkipBudget}
                  disabled={creating}
                  className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Skip for Now
                </button>
                <button
                  onClick={handleCreateBudget}
                  disabled={creating || budgetData.monthlyIncomeTarget <= 0}
                  className="flex-1 py-3 px-6 bg-green-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating Budget...' : 'Complete Setup'}
                </button>
              </div>

              {/* Back Button */}
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                disabled={creating}
                className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Back to Project Details
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

