import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/shared/components';
import { userService, type UserMeResponse, type LifeArea } from '@/infrastructure/services';
import { getAreaDisplayName, getAreaColorVariants, getAreaIcon } from '@/shared/utils/lifeAreaHelpers';

/**
 * Página de Dashboard
 */
export const DashboardPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<UserMeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await userService.getMe();
        setData(response);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  const { user, lifeWheel, summary } = data;
  
  // Get all active transformation areas (areas with projects)
  const activeAreas = lifeWheel.lifeAreas.filter(area => area.projects.length > 0);

  // Calculate goals by type for an area
  const getGoalsByType = (area: LifeArea) => {
    const goals = area.projects.flatMap(p => p.goals);
    return {
      BE: goals.filter(g => g.goalType === 'BE').length,
      DO: goals.filter(g => g.goalType === 'DO').length,
      HAVE: goals.filter(g => g.goalType === 'HAVE').length,
    };
  };

  // Get all incomplete actions (from all areas)
  const allActions = lifeWheel.lifeAreas
    .flatMap(area => area.projects)
    .flatMap(project => project.goals)
    .flatMap(goal => goal.actions)
    .filter(action => !action.isCompleted)
    .slice(0, 5); // Show only first 5

  // Calculate active transformations count (areas with projects)
  const activeTransformations = activeAreas.length;

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Calculate days active (mock - you can calculate from user.createdAt if available)
  const daysActive = 23;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getGreeting()}, {user.firstName}!
            </h1>
            <p className="text-sm text-gray-500">Ready to transform your day?</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-orange-600 transition-colors">
              🔥 {daysActive} day streak
            </button>
            <button className="relative p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Life Wheel - All Areas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900">Life Wheel</h2>
            <div className="px-4 py-2 bg-green-50 rounded-lg">
              <span className="text-2xl font-bold text-green-600">{lifeWheel.globalScore.toFixed(1)}</span>
              <span className="text-sm text-gray-600 ml-1">avg</span>
            </div>
          </div>
          {lifeWheel.lifeAreas.map((area) => {
              const colors = getAreaColorVariants(area.areaName);
              const displayName = getAreaDisplayName(area.areaName);
              const icon = getAreaIcon(area.areaName);
              const goalsByType = getGoalsByType(area);
              const areaProgress = Math.round((area.score / 10) * 100);

              return (
                <div key={area.id} className={`${colors.bgLighter} rounded-2xl shadow-sm border ${colors.border} p-6`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center text-2xl`}>
                        {icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{displayName}</h3>
                        <p className="text-sm text-gray-600">Day 23/90 • Active</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">{areaProgress}%</div>
                      <p className="text-sm text-gray-500">Complete</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="h-3 bg-white rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colors.bg} transition-all duration-500`}
                        style={{ width: `${areaProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">67 days remaining</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{goalsByType.BE}</div>
                      <div className="text-xs text-gray-600">BE goals</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{goalsByType.DO}</div>
                      <div className="text-xs text-gray-600">DO actions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{goalsByType.HAVE}</div>
                      <div className="text-xs text-gray-600">HAVE results</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Morning workout • meal prep
                    </span>
                    <button 
                      onClick={() => navigate(`/area/${area.id}/projects`)}
                      className={`px-6 py-2 ${colors.bg} text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity`}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Today's Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Today's Actions</h3>
              <p className="text-sm text-gray-500">{summary.completedActions}/{summary.totalActions} complete</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-semibold text-sm">✓ {summary.completedActions}/3 complete</span>
            </div>
          </div>

          {allActions.length > 0 ? (
            <div className="space-y-2">
              {allActions.map((action, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{action.content || 'Action item'}</p>
                    <p className="text-xs text-gray-500">Health & Nutrition</p>
                  </div>
                  <span className="text-xs text-gray-400">10 min</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-sm">No actions for today</p>
              <button className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                + Add action
              </button>
            </div>
          )}

          <button className="mt-4 w-full py-2 text-center text-indigo-600 font-medium text-sm hover:bg-indigo-50 rounded-lg transition-colors">
            View all actions →
          </button>
        </div>

        {/* Your Progress */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Your Progress</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Days Active */}
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="text-4xl font-bold text-purple-600 mb-2">{daysActive}</div>
              <div className="text-sm text-gray-600 mb-1">Days Active</div>
              <div className="text-xs text-purple-600 font-medium">↑ +1 today</div>
            </div>

            {/* Active Transformations */}
            <div className="bg-green-50 rounded-xl p-4">
              <div className="text-4xl font-bold text-green-600 mb-2">{activeTransformations}</div>
              <div className="text-sm text-gray-600 mb-1">Active Transformations</div>
              <div className="text-xs text-green-600 font-medium">→ 25% complete</div>
            </div>

            {/* Tasks Completed */}
            <div className="bg-yellow-50 rounded-xl p-4">
              <div className="text-4xl font-bold text-yellow-600 mb-2">{summary.completedGoals}</div>
              <div className="text-sm text-gray-600 mb-1">Tasks Completed</div>
              <div className="text-xs text-yellow-600 font-medium">🎯 +2 today</div>
            </div>

            {/* Life Score */}
            <div className="bg-red-50 rounded-xl p-4">
              <div className="text-4xl font-bold text-red-600 mb-2">{lifeWheel.globalScore.toFixed(1)}</div>
              <div className="text-sm text-gray-600 mb-1">Life Score</div>
              <div className="text-xs text-red-600 font-medium">↑ +0.3 this week</div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-sm font-medium text-gray-900">This week's improvement</span>
            <span className="text-lg font-bold text-green-600">+4.5%</span>
          </div>
        </div>

        {/* Today's Insight */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-sm border border-indigo-100 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
              💡
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Today's Insight</h3>
              <p className="text-sm text-gray-700 mb-3">
                "You're building incredible momentum, {user.firstName}! Your {daysActive}-day streak shows real commitment. 
                {activeAreas.length > 0 && ` ${getAreaDisplayName(activeAreas[0].areaName)} transformations typically show visible results after 21 days - you're almost there!`}"
              </p>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700">
                  🎯 Next milestone
                </div>
                <span className="text-xs text-gray-600">7-day streak (2 days to go)</span>
              </div>
            </div>
          </div>
        </div>

        {/* This Week's Progress */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">This Week's Progress</h3>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              View Details
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Health actions completed</span>
                <span className="text-sm font-semibold text-gray-900">12/15</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '80%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Workout sessions</span>
                <span className="text-sm font-semibold text-gray-900">5/5</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Meal prep sessions</span>
                <span className="text-sm font-semibold text-gray-900">3/3</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Milestones */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Milestones</h3>

          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                7
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">7 Day Streak</h4>
                <p className="text-sm text-gray-600">Complete actions for 2 more days</p>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-orange-600">2</div>
                <div className="text-xs text-gray-500">days left</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                30
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">30-Day Mark</h4>
                <p className="text-sm text-gray-600">Finish transformation milestone</p>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-green-600">7</div>
                <div className="text-xs text-gray-500">days left</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                💪
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Health Transformation</h4>
                <p className="text-sm text-gray-600">Complete your 90-day journey</p>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-purple-600">67</div>
                <div className="text-xs text-gray-500">days left</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Achievements</h3>

          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                ✓
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm">First Onboarding</h4>
                <p className="text-xs text-gray-600">Started your health transformation</p>
              </div>
              <span className="text-xs text-gray-400">3 days ago</span>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                🔥
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm">5-Day Streak</h4>
                <p className="text-xs text-gray-600">Completed daily activities</p>
              </div>
              <span className="text-xs text-gray-400">Today</span>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                📈
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm">Life Score Boost</h4>
                <p className="text-xs text-gray-600">Life score increased 10%</p>
              </div>
              <span className="text-xs text-gray-400">This week</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/actions')}
              className="flex flex-col items-center justify-center p-6 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
            >
              <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white text-2xl mb-3">
                ➕
              </div>
              <span className="font-semibold text-gray-900">Add Action</span>
            </button>

            <button 
              onClick={() => navigate('/home')}
              className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
            >
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl mb-3">
                🎯
              </div>
              <span className="font-semibold text-gray-900">View Wheel</span>
            </button>

            <button 
              className="flex flex-col items-center justify-center p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
            >
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white text-2xl mb-3">
                📊
              </div>
              <span className="font-semibold text-gray-900">Weekly Review</span>
            </button>

            <button 
              className="flex flex-col items-center justify-center p-6 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors"
            >
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white text-2xl mb-3">
                💡
              </div>
              <span className="font-semibold text-gray-900">Get Insights</span>
            </button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};
