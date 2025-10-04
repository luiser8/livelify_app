import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav, PageHeader } from '@/shared/components';
import { useAuth } from '@/features/auth/context';
import { contextService, subscriptionService, type Context, type UserSubscription } from '@/infrastructure/services';

/**
 * Página de Profile
 */
export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [contexts, setContexts] = useState<Context[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newContextName, setNewContextName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [contextsData, subscriptionData] = await Promise.all([
          contextService.getMyContexts(),
          subscriptionService.getMySubscription(),
        ]);
        setContexts(contextsData.contexts);
        setSubscription(subscriptionData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateContext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContextName.trim()) return;

    try {
      setCreating(true);
      const newContext = await contextService.addContext({ name: newContextName });
      setContexts([...contexts, newContext]);
      setNewContextName('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating context:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      <PageHeader 
        title="Profile"
        subtitle="Manage your account settings"
        showBackButton={true}
        showSearch={false}
        showFilter={false}
      />

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* User Info Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-indigo-600">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Subscription Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Subscription</h3>
                <p className="text-sm text-gray-500">Manage your plan</p>
              </div>
              <button
                onClick={() => navigate('/subscription')}
                className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                View Plans
              </button>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : subscription ? (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-2xl">
                      {subscription.planName === 'BASICO' ? '🌱' : subscription.planName === 'INTERMEDIO' ? '⚡' : '👑'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{subscription.plan.name} Plan</p>
                      <p className="text-sm text-gray-600">{subscription.plan.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">${subscription.price}</p>
                    <p className="text-xs text-gray-500">per month</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`px-3 py-1 ${subscription.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} text-xs font-semibold rounded-full`}>
                      {subscription.active ? '✓ Active' : 'Inactive'}
                    </span>
                  </div>
                  {subscription.renewalDate && (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-600">Renews</span>
                      <span className="text-xs text-gray-500">
                        {new Date(subscription.renewalDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium mb-2">No Active Subscription</p>
                <p className="text-sm text-gray-500 mb-4">Choose a plan to unlock all features</p>
                <button
                  onClick={() => navigate('/subscription')}
                  className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Choose a Plan
                </button>
              </div>
            )}
          </div>

          {/* Contexts Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">My Contexts</h3>
                <p className="text-sm text-gray-500">Manage your work contexts</p>
              </div>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {showCreateForm ? 'Cancel' : '+ Add Context'}
              </button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
              <form onSubmit={handleCreateContext} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Context Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newContextName}
                    onChange={(e) => setNewContextName(e.target.value)}
                    placeholder="e.g., @home, @work, @gym"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={creating}
                    required
                  />
                  <button
                    type="submit"
                    disabled={creating || !newContextName.trim()}
                    className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? 'Creating...' : 'Create'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Use @ prefix for better organization (e.g., @home, @work)
                </p>
              </form>
            )}

            {/* Contexts List */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-500 text-sm mt-2">Loading contexts...</p>
              </div>
            ) : contexts.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <p className="text-gray-500 mb-2">No contexts yet</p>
                <p className="text-sm text-gray-400">Create your first context to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {contexts.map((context) => (
                  <div
                    key={context.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{context.name}</p>
                        <p className="text-xs text-gray-500">
                          Created {new Date(context.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-200">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full py-3 px-4 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

