import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BottomNav, PageHeader } from '@/shared/components';
import {
  actionService,
  goalService,
  contextService,
  type ActionItem,
  type EnergyLevel,
  type Goal,
  type Context,
} from '@/infrastructure/services';

/**
 * Página de Actions agrupadas por Goals
 */
export const ActionsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const goalIdFromUrl = searchParams.get('goalId');
  
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [contexts, setContexts] = useState<Context[]>([]);
  const [stats, setStats] = useState({
    totalActions: 0,
    completedActions: 0,
    pendingActions: 0,
    overdueActions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(goalIdFromUrl);
  const [creatingForGoal, setCreatingForGoal] = useState<string | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string>(goalIdFromUrl || '');
  const [formData, setFormData] = useState({
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
      const [actionsData, goalsData, contextsData] = await Promise.all([
        actionService.getMyActions(),
        goalService.getMyGoals(),
        contextService.getMyContexts(),
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
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGoalId || !formData.title.trim() || !formData.contextId) {
      return;
    }

    try {
      setCreating(true);
      await actionService.createAction({
        goalId: selectedGoalId,
        title: formData.title,
        description: formData.description,
        energy: formData.energy,
        timeEstimate: formData.timeEstimate,
        dueDate: formData.dueDate,
        contextId: formData.contextId,
      });

      await fetchData();
      setCreatingForGoal(null);
      setFormData({
        title: '',
        description: '',
        energy: 'MEDIUM',
        timeEstimate: 30,
        dueDate: '',
        contextId: '',
      });
      setSelectedGoalId('');
    } catch (error) {
      console.error('Error creating action:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleComplete = async (actionId: string) => {
    try {
      await actionService.toggleActionCompletion(actionId);
      await fetchData();
    } catch (error) {
      console.error('Error toggling action:', error);
    }
  };

  const handleDeleteAction = async (actionId: string) => {
    if (!window.confirm('Are you sure you want to delete this action?')) return;

    try {
      await actionService.deleteAction(actionId);
      await fetchData();
    } catch (error) {
      console.error('Error deleting action:', error);
    }
  };

  // Agrupar acciones por goal
  const actionsByGoal = goals.reduce((acc, goal) => {
    const goalActions = actions.filter(a => a.goalId === goal.id);
    acc[goal.id] = {
      goal,
      actions: goalActions,
      activeCount: goalActions.filter(a => !a.completed).length,
      completedCount: goalActions.filter(a => a.completed).length,
    };
    return acc;
  }, {} as Record<string, { goal: Goal; actions: ActionItem[]; activeCount: number; completedCount: number }>);

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

  const getGoalTypeColor = (goalType: string) => {
    switch (goalType) {
      case 'BE': return 'bg-red-50 border-red-200 text-red-700';
      case 'DO': return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'HAVE': return 'bg-blue-50 border-blue-200 text-blue-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
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
          <p className="text-gray-500 mt-4">Loading actions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      <PageHeader 
        title="Actions"
        subtitle="Transform your goals into actionable steps"
        showBackButton={false}
        showSearch={false}
        showFilter={false}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{stats.totalActions}</div>
            <div className="text-sm text-gray-500">Total Actions</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{stats.pendingActions}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{stats.completedActions}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-red-600">{stats.overdueActions}</div>
            <div className="text-sm text-gray-500">Overdue</div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Actions by Goal</h2>
          <p className="text-gray-600">Manage actions organized by their goals (BE, DO, HAVE)</p>
        </div>

        {/* Lista de acciones agrupadas por goal */}
        <div className="space-y-6">
          {goals.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
              <svg className="w-16 h-16 text-amber-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-xl font-semibold text-amber-900 mb-2">No goals found</h3>
              <p className="text-amber-800 mb-4">You need to create goals first before you can create actions.</p>
              <button
                onClick={() => navigate('/projects')}
                className="py-2 px-4 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 transition-all"
              >
                Go to Projects →
              </button>
            </div>
          ) : (
            <>
              {Object.values(actionsByGoal).map(({ goal, actions: goalActions, activeCount, completedCount }) => (
                <div 
                  key={goal.id} 
                  className={`border-2 rounded-2xl overflow-hidden transition-all ${getGoalTypeColor(goal.goalType)}`}
                >
                  {/* Goal Header */}
                  <div 
                    className="p-5 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getGoalTypeBadge(goal.goalType)}`}>
                            {goal.goalType} Goal
                          </span>
                          {goal.progress > 0 && (
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-white/50 rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full ${
                                    goal.goalType === 'BE' ? 'bg-red-500' :
                                    goal.goalType === 'DO' ? 'bg-purple-500' :
                                    'bg-blue-500'
                                  }`}
                                  style={{ width: `${goal.progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium">{goal.progress}%</span>
                            </div>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{goal.content}</h3>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">{activeCount}</span>
                            <span className="text-gray-600">active</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-medium">{completedCount}</span>
                            <span className="text-gray-600">completed</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-medium">{goalActions.length}</span>
                            <span className="text-gray-600">total</span>
                          </span>
                        </div>
                      </div>
                      <button className="text-2xl transition-transform" style={{ transform: expandedGoal === goal.id ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        ▼
                      </button>
                    </div>
                  </div>

                  {/* Actions List */}
                  {expandedGoal === goal.id && (
                    <div className="bg-white p-5 border-t-2">
                      {/* Botón crear acción para este goal */}
                      {creatingForGoal !== goal.id && (
                        <button
                          onClick={() => {
                            setCreatingForGoal(goal.id);
                            setSelectedGoalId(goal.id);
                          }}
                          className="w-full mb-4 py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-primary-600 hover:text-primary-600 font-medium transition-all flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add Action to this Goal
                        </button>
                      )}

                      {/* Formulario inline */}
                      {creatingForGoal === goal.id && (
                        <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-4 mb-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-900">Add Action</h4>
                            <button
                              type="button"
                              onClick={() => {
                                setCreatingForGoal(null);
                                setFormData({
                                  title: '',
                                  description: '',
                                  energy: 'MEDIUM',
                                  timeEstimate: 30,
                                  dueDate: '',
                                  contextId: '',
                                });
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          <form onSubmit={handleCreateAction} className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                              <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                placeholder="e.g., Open savings account"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                              <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={2}
                                placeholder="Details about this action"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Energy</label>
                                <select
                                  value={formData.energy}
                                  onChange={(e) => setFormData({ ...formData, energy: e.target.value as EnergyLevel })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                >
                                  <option value="LOW">🟢 Low</option>
                                  <option value="MEDIUM">🟡 Medium</option>
                                  <option value="HIGH">🔴 High</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Time (min)</label>
                                <input
                                  type="number"
                                  value={formData.timeEstimate}
                                  onChange={(e) => setFormData({ ...formData, timeEstimate: parseInt(e.target.value) || 0 })}
                                  min="1"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                                <input
                                  type="datetime-local"
                                  value={formData.dueDate}
                                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Context *</label>
                                <select
                                  value={formData.contextId}
                                  onChange={(e) => setFormData({ ...formData, contextId: e.target.value })}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                >
                                  <option value="">Select</option>
                                  {contexts.map((context) => (
                                    <option key={context.id} value={context.id}>{context.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <button
                                type="button"
                                onClick={() => setCreatingForGoal(null)}
                                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all text-sm"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={creating}
                                className="flex-1 py-2 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50 text-sm"
                              >
                                {creating ? 'Creating...' : 'Create'}
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                      {/* Lista de acciones */}
                      {goalActions.length > 0 ? (
                        <div className="space-y-3">
                          {goalActions.map((action, index) => (
                            <div 
                              key={action.id}
                              className={`rounded-lg p-4 border transition-shadow ${
                                action.completed
                                  ? 'bg-green-50 border-green-200 opacity-75'
                                  : action.isOverdue 
                                    ? 'bg-red-50 border-red-200' 
                                    : 'bg-white border-gray-200 hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex items-center gap-2">
                                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-700 font-semibold text-xs">
                                    {index + 1}
                                  </span>
                                  <input
                                    type="checkbox"
                                    checked={action.completed}
                                    onChange={() => handleToggleComplete(action.id)}
                                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                  />
                                </div>

                                <div className="flex-1">
                                  <h5 className={`font-semibold mb-1 ${action.completed ? 'line-through text-gray-600' : 'text-gray-900'}`}>
                                    {action.title}
                                  </h5>
                                  {action.description && (
                                    <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                                  )}
                                  
                                  <div className="flex flex-wrap gap-2 text-xs">
                                    <span className={`px-2 py-1 rounded-full font-medium ${getEnergyColor(action.energy)}`}>
                                      {getEnergyIcon(action.energy)} {action.energy}
                                    </span>
                                    <span className="px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
                                      ⏱️ {action.timeEstimate}min
                                    </span>
                                    <span className={`px-2 py-1 rounded-full font-medium ${
                                      action.isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                      📅 {new Date(action.dueDate).toLocaleDateString()}
                                      {action.isOverdue && ` (${Math.abs(action.daysUntilDue)}d overdue)`}
                                    </span>
                                    <span className="px-2 py-1 rounded-full font-medium bg-purple-100 text-purple-700">
                                      📍 {action.contextName}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleDeleteAction(action.id)}
                                  className="text-gray-400 hover:text-red-600 transition-colors"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : creatingForGoal !== goal.id && (
                        <div className="text-center py-8 text-gray-500">
                          <p className="mb-2">No actions yet for this goal</p>
                          <p className="text-sm">Click the button above to add one</p>
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

      <BottomNav />
    </div>
  );
};
