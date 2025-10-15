import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BottomNav, PageHeader, Copyright } from '@/shared/components';
import {
  actionService,
  goalService,
  contextService,
  projectService,
  type ActionItem as Action,
  type EnergyLevel,
  type Goal,
  type Context,
  type Project,
} from '@/infrastructure/services';

/**
 * Página de Actions agrupadas por Contextos
 */
export const ActionsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [actions, setActions] = useState<Action[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [contexts, setContexts] = useState<Context[]>([]);
  const [stats, setStats] = useState({
    totalActions: 0,
    completedActions: 0,
    pendingActions: 0,
    overdueActions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [expandedContext, setExpandedContext] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedContextFilter, setSelectedContextFilter] = useState<string>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [formData, setFormData] = useState({
    goalId: '',
    title: '',
    description: '',
    energy: 'MEDIUM' as EnergyLevel,
    timeEstimate: 30,
    dueDate: '',
    contextId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [actionsData, goalsData, contextsData, projectsData] = await Promise.all([
        actionService.getMyActions(),
        goalService.getMyGoals(),
        contextService.getMyContexts(),
        projectService.getAllProjects(),
      ]);
      
      setActions(actionsData.actions || []);
      setStats({
        totalActions: actionsData.totalActions || 0,
        completedActions: actionsData.completedActions || 0,
        pendingActions: actionsData.pendingActions || 0,
        overdueActions: actionsData.overdueActions || 0,
      });
      setGoals(goalsData.goals || []);
      setContexts(contextsData.contexts || []);
      setProjects(projectsData.projects || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar goals por proyecto seleccionado
  const filteredGoals = useMemo(() => {
    if (!selectedProjectId) return [];
    return goals.filter(goal => {
      const project = projects.find(p => p.detail.id === goal.projectDetailId);
      return project?.id === selectedProjectId;
    });
  }, [selectedProjectId, goals, projects]);

  // Manejar cambio de proyecto
  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    // Resetear goalId cuando cambie el proyecto
    setFormData({ ...formData, goalId: '' });
  };

  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.goalId || !formData.title.trim() || !formData.contextId) {
      return;
    }

    try {
      setCreating(true);
      await actionService.createAction({
        goalId: formData.goalId,
        title: formData.title,
        description: formData.description,
        energy: formData.energy,
        timeEstimate: formData.timeEstimate,
        dueDate: formData.dueDate,
        contextId: formData.contextId,
      });

      await fetchData();
      setShowCreateForm(false);
      setSelectedProjectId('');
      setFormData({
        goalId: '',
        title: '',
        description: '',
        energy: 'MEDIUM',
        timeEstimate: 30,
        dueDate: '',
        contextId: '',
      });
    } catch (error) {
      console.error('Error creating action:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleCompleteAction = async (actionId: string) => {
    try {
      await actionService.completeAction(actionId);
      await fetchData();
    } catch (error) {
      console.error('Error completing action:', error);
    }
  };


  // Helper para obtener información del goal y proyecto de una acción
  const getActionMetadata = (action: Action) => {
    const goal = goals.find(g => g.id === action.goalId);
    if (!goal) return { goal: null, project: null };
    
    const project = projects.find(p => p.detail.id === goal.projectDetailId);
    return { goal, project };
  };

  // Agrupar acciones por contexto
  const actionsByContext = useMemo(() => {
    const filtered = selectedContextFilter === 'all' 
      ? actions 
      : actions.filter(a => a.contextId === selectedContextFilter);
    
    return contexts.reduce((acc, context) => {
      const contextActions = filtered.filter(a => a.contextId === context.id);
      acc[context.id] = {
        context,
        actions: contextActions,
        activeCount: contextActions.filter(a => !a.completed).length,
        completedCount: contextActions.filter(a => a.completed).length,
      };
      return acc;
    }, {} as Record<string, { context: Context; actions: Action[]; activeCount: number; completedCount: number }>);
  }, [actions, contexts, selectedContextFilter]);

  // Helpers
  const getEnergyColor = (energy: EnergyLevel) => {
    switch (energy) {
      case 'LOW': return 'bg-green-100 text-green-700';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
      case 'HIGH': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getEnergyIcon = (energy: EnergyLevel) => {
    switch (energy) {
      case 'LOW': return '🟢';
      case 'MEDIUM': return '🟡';
      case 'HIGH': return '🔴';
      default: return '⚪';
    }
  };

  const getGoalTypeBadge = (goalType: string) => {
    switch (goalType) {
      case 'BE': return 'bg-red-100 text-red-700';
      case 'DO': return 'bg-purple-100 text-purple-700';
      case 'HAVE': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">{t('actions.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      <PageHeader 
        title={t('actions.title')}
        subtitle={t('actions.subtitle')}
        showBackButton={true}
        showSearch={false}
        showFilter={false}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{stats.totalActions}</div>
            <div className="text-sm text-gray-500">{t('actions.totalActions')}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{stats.pendingActions}</div>
            <div className="text-sm text-gray-500">{t('actions.pending')}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{stats.completedActions}</div>
            <div className="text-sm text-gray-500">{t('actions.completed')}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-red-600">{stats.overdueActions}</div>
            <div className="text-sm text-gray-500">{t('actions.overdue')}</div>
          </div>
        </div>

        {/* Filtro de contextos y botón crear */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedContextFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedContextFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {t('actions.allContexts')}
            </button>
            {contexts.map(context => (
              <button
                key={context.id}
                onClick={() => setSelectedContextFilter(context.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedContextFilter === context.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {context.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('actions.newAction')}
          </button>
        </div>

        {/* Formulario de creación */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl border-2 border-indigo-200 p-6 mb-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('actions.createNewAction')}</h3>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setSelectedProjectId('');
                  setFormData({
                    goalId: '',
                    title: '',
                    description: '',
                    energy: 'MEDIUM',
                    timeEstimate: 30,
                    dueDate: '',
                    contextId: '',
                  });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateAction} className="space-y-4">
              {/* Paso 1: Seleccionar Proyecto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('actions.step1')}
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">{t('actions.chooseProject')}</option>
                  {projects.filter(p => p.status === 'ACTIVE').map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">{t('actions.selectProjectHint')}</p>
              </div>

              {/* Paso 2: Seleccionar Goal (solo visible si hay proyecto seleccionado) */}
              {selectedProjectId && (
                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                    <p className="text-sm font-semibold text-indigo-900">
                      {projects.find(p => p.id === selectedProjectId)?.title}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-2">
                      {t('actions.step2')}
                    </label>
                    <select
                      value={formData.goalId}
                      onChange={(e) => setFormData({ ...formData, goalId: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    >
                      <option value="">{t('actions.chooseGoal')}</option>
                      {filteredGoals.length > 0 ? (
                        filteredGoals.map((goal) => (
                          <option key={goal.id} value={goal.id}>
                            [{goal.goalType}] {goal.content}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>{t('actions.noGoalsAvailable')}</option>
                      )}
                    </select>
                    <p className="text-xs text-indigo-600 mt-1">
                      {filteredGoals.length} {filteredGoals.length === 1 ? t('actions.goal') : t('actions.goals')} {t('actions.available')}
                    </p>
                  </div>
                </div>
              )}

              {/* Context */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('actions.context')}</label>
                <select
                  value={formData.contextId}
                  onChange={(e) => setFormData({ ...formData, contextId: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">{t('actions.selectContext')}</option>
                  {contexts.map((context) => (
                    <option key={context.id} value={context.id}>{context.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('actions.actionTitle')}</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder={t('actions.titlePlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('actions.description')}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder={t('actions.descriptionPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('actions.energy')}</label>
                  <select
                    value={formData.energy}
                    onChange={(e) => setFormData({ ...formData, energy: e.target.value as EnergyLevel })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="LOW">🟢 {t('actions.low')}</option>
                    <option value="MEDIUM">🟡 {t('actions.medium')}</option>
                    <option value="HIGH">🔴 {t('actions.high')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('actions.time')}</label>
                  <input
                    type="number"
                    value={formData.timeEstimate}
                    onChange={(e) => setFormData({ ...formData, timeEstimate: parseInt(e.target.value) || 0 })}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('actions.dueDate')}</label>
                  <input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
                >
                  {t('actions.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {creating ? t('actions.creating') : t('actions.createAction')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de acciones agrupadas por contexto */}
        <div className="space-y-4">
          {contexts.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
              <svg className="w-16 h-16 text-amber-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <h3 className="text-xl font-semibold text-amber-900 mb-2">{t('actions.noContexts')}</h3>
              <p className="text-amber-800 mb-4">{t('actions.needContexts')}</p>
              <button
                onClick={() => navigate('/profile')}
                className="py-2 px-4 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 transition-all"
              >
                {t('actions.goToProfile')}
              </button>
            </div>
          ) : (
            <>
              {Object.values(actionsByContext).filter(item => item.actions.length > 0).map(({ context, actions: contextActions, activeCount, completedCount }) => (
                <div 
                  key={context.id} 
                  className="border-2 rounded-2xl overflow-hidden transition-all bg-white border-gray-200 shadow-sm hover:shadow-md"
                >
                  {/* Context Header */}
                  <div 
                    className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedContext(expandedContext === context.id ? null : context.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{context.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center gap-1">
                                <span className="font-medium text-blue-600">{activeCount}</span>
                                <span>{t('actions.active')}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="font-medium text-green-600">{completedCount}</span>
                                <span>{t('actions.completed')}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="font-medium text-gray-900">{contextActions.length}</span>
                                <span>{t('actions.total')}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button className="text-2xl transition-transform" style={{ transform: expandedContext === context.id ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        ▼
                      </button>
                    </div>
                  </div>

                  {/* Actions List */}
                  {expandedContext === context.id && (
                    <div className="bg-gray-50 p-5 border-t-2">
                      {/* Lista de acciones */}
                      {contextActions.length > 0 ? (
                        <div className="space-y-3">
                          {contextActions.map((action, index) => {
                            const { goal, project } = getActionMetadata(action);
                            return (
                              <div 
                                key={action.id}
                                className={`rounded-xl p-4 border-2 transition-all ${
                                  action.completed
                                    ? 'bg-green-50 border-green-200 opacity-75'
                                    : action.isOverdue 
                                      ? 'bg-red-50 border-red-300 shadow-sm' 
                                      : 'bg-white border-gray-200 hover:shadow-md'
                                }`}
                              >
                                <div className="flex items-start gap-4">
                                  <div className="flex items-center gap-2 pt-1">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs">
                                      {index + 1}
                                    </span>
                                  </div>

                                  <div className="flex-1">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                      <h5 className={`font-semibold text-base ${action.completed ? 'line-through text-gray-600' : 'text-gray-900'}`}>
                                        {action.title}
                                      </h5>
                                      
                                      {!action.completed && (
                                        <button
                                          onClick={() => handleCompleteAction(action.id)}
                                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all shadow-md flex items-center gap-2 flex-shrink-0"
                                        >
                                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                          </svg>
                                          {t('actions.complete')}
                                        </button>
                                      )}
                                    </div>
                                    
                                    {action.description && (
                                      <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                                    )}

                                    {/* Goal and Project Info */}
                                    {goal && (
                                      <div className="mb-3 p-3 bg-gray-100 rounded-lg border border-gray-200">
                                        <div className="flex items-start gap-2">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${getGoalTypeBadge(goal.goalType)}`}>
                                                {goal.goalType}
                                              </span>
                                              <span className="text-xs font-medium text-gray-700">{t('actions.goalLabel')}</span>
                                            </div>
                                            <p className="text-sm text-gray-900 font-medium mb-1">{goal.content}</p>
                                            {project && (
                                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                                </svg>
                                                <span className="font-medium">{t('actions.projectLabel')}</span>
                                                <span>{project.title}</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    
                                    <div className="flex flex-wrap gap-2 text-xs">
                                      <span className={`px-2 py-1 rounded-full font-medium ${getEnergyColor(action.energy)}`}>
                                        {getEnergyIcon(action.energy)} {action.energy}
                                      </span>
                                      <span className="px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
                                        ⏱️ {action.timeEstimate}{t('actions.min')}
                                      </span>
                                      <span className={`px-2 py-1 rounded-full font-medium ${
                                        action.isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                      }`}>
                                        📅 {new Date(action.dueDate).toLocaleDateString()}
                                        {action.isOverdue && ` (${Math.abs(action.daysUntilDue)}${t('actions.daysOverdue')})`}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 bg-white rounded-lg">
                          <p className="mb-2">{t('actions.noActionsInContext')}</p>
                          <p className="text-sm">{t('actions.createActionAbove')}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </main>

      <Copyright />
      <BottomNav />
    </div>
  );
};
