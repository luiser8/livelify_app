import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { goalService, projectService, actionService, type Goal, type GoalType, type Project } from '@/infrastructure/services';
import { PageHeader, BottomNav } from '@/shared/components';
import { getAreaIcon, getAreaColorVariants } from '@/shared/utils/lifeAreaHelpers';

/**
 * Página de gestión de Goals (BE, DO, HAVE) de un proyecto
 */
export const ProjectGoalsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  
  const [project, setProject] = useState<Project | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalActionCounts, setGoalActionCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<'BE' | 'DO' | 'HAVE'>('BE');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Form state para crear goal
  const [formData, setFormData] = useState({
    content: '',
    baseCapital: 0,
    currencyCode: 'USD',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        
        const [allProjects, allGoals, allActions] = await Promise.all([
          projectService.getAllProjects(),
          goalService.getMyGoals(),
          actionService.getMyActions(),
        ]);

        const currentProject = allProjects.projects.find(p => p.id === projectId);
        setProject(currentProject || null);

        if (currentProject && allGoals && allGoals.goals) {
          // Filtrar goals por el projectDetailId del proyecto actual
          const projectGoals = allGoals.goals.filter(
            g => g.projectDetailId === currentProject.detail.id
          );
          setGoals(projectGoals);

          // Contar acciones por goal
          const counts: Record<string, number> = {};
          projectGoals.forEach(goal => {
            counts[goal.id] = allActions.actions.filter(action => action.goalId === goal.id).length;
          });
          setGoalActionCounts(counts);
        } else {
          setGoals([]);
        }
      } catch (error) {
        console.error('Error fetching goals:', error);
        setGoals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const handleCreateGoal = async (goalType: GoalType) => {
    if (!project || !formData.content.trim()) return;

    try {
      setCreating(true);
      const result = await goalService.createGoal({
        projectDetailId: project.detail.id,
        goalType,
        content: formData.content,
        baseCapital: formData.baseCapital,
        currencyCode: formData.currencyCode,
      });

      setGoals([...goals, result.goal]);
      setFormData({ content: '', baseCapital: 0, currencyCode: 'USD' });
      setShowCreateForm(false);

      // Avanzar al siguiente step
      if (goalType === 'BE' && goals.filter(g => g.goalType === 'BE').length >= 2) {
        setCurrentStep('DO');
      } else if (goalType === 'DO' && goals.filter(g => g.goalType === 'DO').length >= 2) {
        setCurrentStep('HAVE');
      }
    } catch (error) {
      console.error('Error creating goal:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await goalService.deleteGoal(goalId);
      setGoals(goals.filter(g => g.id !== goalId));
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const getGoalsByType = (type: GoalType) => goals.filter(g => g.goalType === type);

  const getStepTitle = () => {
    switch (currentStep) {
      case 'BE': return t('projects.goals.beTitle');
      case 'DO': return t('projects.goals.doTitle');
      case 'HAVE': return t('projects.goals.haveTitle');
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 'BE': return t('projects.goals.beDescription');
      case 'DO': return t('projects.goals.doDescription');
      case 'HAVE': return t('projects.goals.haveDescription');
    }
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case 'BE': return '🎯';
      case 'DO': return '⚡';
      case 'HAVE': return '🏆';
    }
  };

  const getStepColor = () => {
    switch (currentStep) {
      case 'BE': return 'from-red-500 to-pink-600';
      case 'DO': return 'from-purple-500 to-indigo-600';
      case 'HAVE': return 'from-blue-500 to-cyan-600';
    }
  };

  const goalExamples = {
    BE: [
      'I am someone who communicates openly and honestly in all my relationships.',
      'I am someone who expresses emotions openly and creates safe spaces for vulnerability in my relationships.',
      'I am someone who truly listens to understand, not just to respond, making others feel heard and valued.',
    ],
    DO: [
      'I will practice active listening for 15 minutes daily with my partner.',
      'I will schedule weekly date nights without distractions.',
      'I will express gratitude to my loved ones every day.',
    ],
    HAVE: [
      'I will have resolved 3 major conflicts with compassion.',
      'I will have deepened trust with 5 close relationships.',
      'I will have created 10 meaningful memories with family.',
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">{t('projects.goals.loading')}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">{t('projects.goals.projectNotFound')}</p>
          <button onClick={() => navigate('/projects')} className="mt-4 text-indigo-600 hover:text-indigo-700">
            {t('projects.goals.backToProjects')}
          </button>
        </div>
      </div>
    );
  }

  const currentGoals = getGoalsByType(currentStep);
  const beGoals = getGoalsByType('BE');
  const doGoals = getGoalsByType('DO');
  const haveGoals = getGoalsByType('HAVE');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader 
        title={project.title}
        subtitle={t('projects.goals.subtitle')}
        backPath="/projects"
        showSearch={false}
        showFilter={false}
      />

      {/* Goals Stats */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{goals.length}</div>
              <div className="text-xs text-gray-500">{t('projects.goals.totalGoals')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{beGoals.length}</div>
              <div className="text-xs text-gray-500">BE</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{doGoals.length}</div>
              <div className="text-xs text-gray-500">DO</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{haveGoals.length}</div>
              <div className="text-xs text-gray-500">HAVE</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto w-full px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentStep('BE')}
              className={`flex-1 py-3 px-4 font-semibold transition-all relative ${
                currentStep === 'BE' 
                  ? 'text-red-600 border-b-2 border-red-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>🎯 {t('projects.goals.beGoals')}</span>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{beGoals.length}</span>
              </div>
            </button>
            <button
              onClick={() => setCurrentStep('DO')}
              className={`flex-1 py-3 px-4 font-semibold transition-all relative ${
                currentStep === 'DO' 
                  ? 'text-purple-600 border-b-2 border-purple-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>⚡ {t('projects.goals.doGoals')}</span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{doGoals.length}</span>
              </div>
            </button>
            <button
              onClick={() => setCurrentStep('HAVE')}
              className={`flex-1 py-3 px-4 font-semibold transition-all relative ${
                currentStep === 'HAVE' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>🏆 {t('projects.goals.haveGoals')}</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{haveGoals.length}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-6 py-6">
        {/* Tab Header */}
        <div className={`bg-gradient-to-r ${getStepColor()} rounded-2xl p-6 mb-6 text-white shadow-lg`}>
          <div className="text-5xl mb-3">{getStepIcon()}</div>
          <h2 className="text-3xl font-bold mb-2">{getStepTitle()}</h2>
          <p className="text-white/90 text-lg">{getStepSubtitle()}</p>
        </div>

        {/* Tips */}
        <div className="bg-white rounded-xl p-5 mb-6 border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-3">💡 {t('projects.goals.writingTips', { type: currentStep })}</h3>
          <div className="space-y-2">
            {currentStep === 'BE' && (
              <>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <p className="text-sm text-gray-700">{t('projects.goals.beTip1')}</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <p className="text-sm text-gray-700">{t('projects.goals.beTip2')}</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <p className="text-sm text-gray-700">{t('projects.goals.beTip3')}</p>
                </div>
              </>
            )}
            {currentStep === 'DO' && (
              <>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <p className="text-sm text-gray-700">{t('projects.goals.doTip1')}</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <p className="text-sm text-gray-700">{t('projects.goals.doTip2')}</p>
                </div>
              </>
            )}
            {currentStep === 'HAVE' && (
              <>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <p className="text-sm text-gray-700">{t('projects.goals.haveTip1')}</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <p className="text-sm text-gray-700">{t('projects.goals.haveTip2')}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Current Goals */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">{t('projects.goals.yourGoals', { type: currentStep })}</h3>
            {currentGoals.length < 3 && (
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className={`py-2 px-4 rounded-lg font-medium transition-all ${
                  currentStep === 'BE' ? 'bg-red-600 hover:bg-red-700' :
                  currentStep === 'DO' ? 'bg-purple-600 hover:bg-purple-700' :
                  'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                + {t('projects.goals.addGoal', { type: currentStep })}
              </button>
            )}
          </div>

          {currentGoals.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-300">
              <div className="text-6xl mb-4">{getStepIcon()}</div>
              <p className="text-gray-500 text-lg mb-6">{t('projects.goals.noGoals', { type: currentStep })}</p>
              <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">{getStepSubtitle()}</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className={`py-3 px-6 rounded-xl font-semibold text-white transition-all ${
                  currentStep === 'BE' ? 'bg-red-600 hover:bg-red-700' :
                  currentStep === 'DO' ? 'bg-purple-600 hover:bg-purple-700' :
                  'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {t('projects.goals.createFirst', { type: currentStep })}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {currentGoals.map((goal, index) => (
                <div key={goal.id} className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-gray-300 transition-all shadow-sm hover:shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          currentStep === 'BE' ? 'bg-red-100 text-red-700' :
                          currentStep === 'DO' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {currentStep} #{index + 1}
                        </span>
                        {goal.progress > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  currentStep === 'BE' ? 'bg-red-500' :
                                  currentStep === 'DO' ? 'bg-purple-500' :
                                  'bg-blue-500'
                                }`}
                                style={{ width: `${goal.progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-600">{goal.progress}%</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-900 text-lg mb-3 leading-relaxed">{goal.content}</p>
                      {goal.baseCapital > 0 && (
                        <div className="flex items-center gap-6 text-sm bg-gray-50 rounded-lg p-3">
                          <div>
                            <span className="text-gray-500">{t('projects.goals.baseCapital')}: </span>
                            <span className="font-bold text-gray-900">{goal.currencyCode} ${goal.baseCapital.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">{t('projects.goals.multiplier')}: </span>
                            <span className="font-bold text-indigo-600">{goal.multiplier}x</span>
                          </div>
                          <div>
                            <span className="text-gray-500">{t('projects.goals.target')}: </span>
                            <span className="font-bold text-green-600">{goal.currencyCode} ${(goal.baseCapital * goal.multiplier).toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors flex-shrink-0"
                      title={t('projects.goals.deleteGoal')}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Botón de acciones */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => navigate(`/actions?goalId=${goal.id}`)}
                      className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                        currentStep === 'BE' ? 'bg-red-50 text-red-700 hover:bg-red-100' :
                        currentStep === 'DO' ? 'bg-purple-50 text-purple-700 hover:bg-purple-100' :
                        'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      <span>{t('projects.goals.viewActions')}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        currentStep === 'BE' ? 'bg-red-100 text-red-700' :
                        currentStep === 'DO' ? 'bg-purple-100 text-purple-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {goalActionCounts[goal.id] || 0}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Form */}
        {showCreateForm && currentGoals.length < 3 && (
          <div className={`rounded-2xl p-6 mb-6 border-2 shadow-lg ${
            currentStep === 'BE' ? 'bg-red-50 border-red-200' :
            currentStep === 'DO' ? 'bg-purple-50 border-purple-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <h4 className="font-bold text-gray-900 text-xl mb-4">✨ {t('projects.goals.createNew', { type: currentStep })}</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('projects.goals.goalDescription')} *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder={`e.g., ${goalExamples[currentStep][0]}`}
                  maxLength={120}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.content.length}/120 characters</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('projects.goals.baseCapital')} ({t('projects.goals.optional')})
                  </label>
                  <input
                    type="number"
                    value={formData.baseCapital || ''}
                    onChange={(e) => setFormData({ ...formData, baseCapital: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('projects.goals.currencyCode')}
                  </label>
                  <select
                    value={formData.currencyCode}
                    onChange={(e) => setFormData({ ...formData, currencyCode: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="MXN">MXN</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({ content: '', baseCapital: 0, currencyCode: 'USD' });
                  }}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {t('projects.goals.cancel')}
                </button>
                <button
                  onClick={() => handleCreateGoal(currentStep)}
                  disabled={creating || !formData.content.trim()}
                  className={`flex-1 py-3 px-4 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    currentStep === 'BE' ? 'bg-red-600 hover:bg-red-700' :
                    currentStep === 'DO' ? 'bg-purple-600 hover:bg-purple-700' :
                    'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {creating ? t('projects.goals.creating') : `✓ ${t('projects.goals.addGoal', { type: currentStep })}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Examples Section */}
        {!showCreateForm && (
          <div className={`rounded-2xl p-6 mb-6 border-2 ${
            currentStep === 'BE' ? 'bg-red-50 border-red-200' :
            currentStep === 'DO' ? 'bg-purple-50 border-purple-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <h4 className={`font-bold text-lg mb-3 ${
              currentStep === 'BE' ? 'text-red-900' :
              currentStep === 'DO' ? 'text-purple-900' :
              'text-blue-900'
            }`}>
              💡 {t('projects.goals.examples', { type: currentStep })}
            </h4>
            <div className="space-y-3">
              {goalExamples[currentStep].map((example, index) => (
                <div key={index} className={`flex items-start gap-3 p-3 bg-white rounded-lg ${
                  currentStep === 'BE' ? 'border border-red-200' :
                  currentStep === 'DO' ? 'border border-purple-200' :
                  'border border-blue-200'
                }`}>
                  <span className={`font-bold ${
                    currentStep === 'BE' ? 'text-red-600' :
                    currentStep === 'DO' ? 'text-purple-600' :
                    'text-blue-600'
                  }`}>{index + 1}</span>
                  <p className={`text-sm flex-1 ${
                    currentStep === 'BE' ? 'text-red-900' :
                    currentStep === 'DO' ? 'text-purple-900' :
                    'text-blue-900'
                  }`}>{example}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

