import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/shared/components';
import { userService, type UserMeResponse } from '@/infrastructure/services';
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
  
  // Calculate pending items
  const pendingGoals = summary.totalGoals - summary.completedGoals;
  const pendingActions = summary.totalActions - summary.completedActions;
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

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
        </div>
      </div>

      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Life Score */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="text-4xl font-bold text-indigo-600 mb-2">{lifeWheel.globalScore.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Life Score</div>
          </div>

          {/* Total Goals */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="text-4xl font-bold text-purple-600 mb-2">{summary.totalGoals}</div>
            <div className="text-sm text-gray-600">Total Goals</div>
          </div>

          {/* Completed Goals */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="text-4xl font-bold text-green-600 mb-2">{summary.completedGoals}</div>
            <div className="text-sm text-gray-600">Completed Goals</div>
          </div>

          {/* Pending Goals */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="text-4xl font-bold text-yellow-600 mb-2">{pendingGoals}</div>
            <div className="text-sm text-gray-600">Pending Goals</div>
          </div>
        </div>

        {/* Actions Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Actions Overview</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-3xl font-bold text-gray-900 mb-1">{summary.totalActions}</div>
              <div className="text-sm text-gray-600">Total Actions</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-3xl font-bold text-green-600 mb-1">{summary.completedActions}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <div className="text-3xl font-bold text-yellow-600 mb-1">{pendingActions}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
        </div>

        {/* Life Wheel Areas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Life Areas</h3>
            <button 
              onClick={() => navigate('/home')}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View Wheel →
            </button>
          </div>
          <div className="space-y-3">
            {lifeWheel.lifeAreas.map((area) => {
              const colors = getAreaColorVariants(area.areaName);
              const displayName = getAreaDisplayName(area.areaName);
              const icon = getAreaIcon(area.areaName);
              const totalProjects = area.projects?.length || 0;

              return (
                <div 
                  key={area.id} 
                  onClick={() => navigate(`/area/${area.id}/projects`)}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
                    {icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{displayName}</h4>
                    <p className="text-sm text-gray-600">{totalProjects} projects</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{area.score}</div>
                    <div className="text-xs text-gray-500">/10</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate('/projects')}
              className="flex flex-col items-center justify-center p-6 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
            >
              <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white text-2xl mb-3">
                📁
              </div>
              <span className="font-semibold text-gray-900 text-sm">Projects</span>
            </button>

            <button 
              onClick={() => navigate('/actions')}
              className="flex flex-col items-center justify-center p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
            >
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white text-2xl mb-3">
                ✓
              </div>
              <span className="font-semibold text-gray-900 text-sm">Actions</span>
            </button>

            <button 
              onClick={() => navigate('/home')}
              className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
            >
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl mb-3">
                🎯
              </div>
              <span className="font-semibold text-gray-900 text-sm">Life Wheel</span>
            </button>

            <button 
              onClick={() => navigate('/profile')}
              className="flex flex-col items-center justify-center p-6 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors"
            >
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white text-2xl mb-3">
                ⚙️
              </div>
              <span className="font-semibold text-gray-900 text-sm">Profile</span>
            </button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};
