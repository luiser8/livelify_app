import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BottomNav, PageHeader, ConfirmModal } from '@/shared/components';
import { useAuth } from '@/features/auth/context';
import { contextService, subscriptionService, type Context, type UserSubscription } from '@/infrastructure/services';

/**
 * Página de Profile
 */
export const ProfilePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [contexts, setContexts] = useState<Context[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newContextName, setNewContextName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contextToDelete, setContextToDelete] = useState<Context | null>(null);

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
      // Asegurar que siempre tenga el @ al principio
      const contextNameWithAt = newContextName.startsWith('@') ? newContextName : `@${newContextName}`;
      const newContext = await contextService.addContext({ name: contextNameWithAt });
      setContexts([...contexts, newContext]);
      setNewContextName('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating context:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleOpenDeleteModal = (context: Context) => {
    if (!context.canDelete) {
      return; // No abrir modal si no se puede eliminar
    }
    setContextToDelete(context);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    if (!deleting) {
      setShowDeleteModal(false);
      setContextToDelete(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!contextToDelete) return;

    try {
      setDeleting(true);
      await contextService.deleteContext(contextToDelete.id);
      setContexts(contexts.filter(ctx => ctx.id !== contextToDelete.id));
      setShowDeleteModal(false);
      setContextToDelete(null);
    } catch (error) {
      console.error('Error deleting context:', error);
      alert(t('profile.contexts.deleteError'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      <PageHeader 
        title={t('profile.title')}
        subtitle={t('profile.subtitle')}
        showBackButton={true}
        showSearch={false}
        showFilter={false}
      />

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="space-y-6">
          {/* User Info Card - Full Width */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between gap-4">
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
              {/* Logout Button - Small */}
              <button
                onClick={logout}
                className="px-4 py-2 text-sm bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors"
              >
                {t('profile.actions.logout')}
              </button>
            </div>
          </div>

          {/* Grid Layout for Subscription and Contexts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subscription Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('profile.subscription.title')}</h3>
                <p className="text-sm text-gray-500">{t('profile.subtitle')}</p>
              </div>
              <button
                onClick={() => navigate('/subscription')}
                className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                {t('profile.subscription.upgradePlan')}
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
                      <p className="font-bold text-gray-900">{subscription.plan.name} {t('profile.subscription.plan')}</p>
                      <p className="text-sm text-gray-600">{subscription.plan.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">${subscription.price}</p>
                    <p className="text-xs text-gray-500">{t('profile.subscription.perMonth')}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t('profile.subscription.status')}</span>
                    <span className={`px-3 py-1 ${subscription.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} text-xs font-semibold rounded-full`}>
                      {subscription.active ? `✓ ${t('profile.subscription.active')}` : t('profile.subscription.inactive')}
                    </span>
                  </div>
                  {subscription.renewalDate && (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-600">{t('profile.subscription.renews')}</span>
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
                <p className="text-gray-600 font-medium mb-2">{t('profile.subscription.noActiveSubscription')}</p>
                <p className="text-sm text-gray-500 mb-4">{t('profile.subscription.unlockFeatures')}</p>
                <button
                  onClick={() => navigate('/subscription')}
                  className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {t('profile.subscription.chooseAPlan')}
                </button>
              </div>
            )}
          </div>

            {/* Contexts Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('profile.contexts.title')}</h3>
                <p className="text-sm text-gray-500">{t('profile.contexts.description')}</p>
              </div>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {showCreateForm ? t('profile.contexts.cancel') : t('profile.contexts.addContext')}
              </button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
              <form onSubmit={handleCreateContext} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profile.contexts.contextName')}
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
                    <span className="pl-4 text-gray-700 font-medium text-base select-none">@</span>
                    <input
                      type="text"
                      value={newContextName}
                      onChange={(e) => setNewContextName(e.target.value)}
                      placeholder={t('profile.contexts.placeholder')}
                      className="flex-1 px-2 py-2 border-0 outline-none bg-transparent"
                      disabled={creating}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={creating || !newContextName.trim()}
                    className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? t('profile.contexts.creating') : t('profile.contexts.create')}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {t('profile.contexts.prefixNote')}
                </p>
              </form>
            )}

            {/* Contexts List */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-500 text-sm mt-2">{t('profile.contexts.loading')}</p>
              </div>
            ) : contexts.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <p className="text-gray-500 mb-2">{t('profile.contexts.noContexts')}</p>
                <p className="text-sm text-gray-400">{t('profile.contexts.getStarted')}</p>
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
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-500">
                            {t('profile.contexts.created')} {new Date(context.createdAt).toLocaleDateString()}
                          </p>
                          {context.actionsCount > 0 && (
                            <span className="text-xs text-gray-500">•</span>
                          )}
                          {context.actionsCount > 0 && (
                            <p className="text-xs text-indigo-600 font-medium">
                              {t('profile.contexts.actionsCount', { count: context.actionsCount })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-200">
                        {t('profile.contexts.active')}
                      </span>
                      <button
                        onClick={() => handleOpenDeleteModal(context)}
                        disabled={!context.canDelete}
                        className={`p-2 rounded-lg transition-colors ${
                          context.canDelete 
                            ? 'text-red-600 hover:bg-red-50 cursor-pointer' 
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                        title={
                          context.canDelete 
                            ? t('profile.contexts.delete') 
                            : t('profile.contexts.cannotDelete', { count: context.actionsCount })
                        }
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
        </div>
      </main>

      <BottomNav />

      {/* Modal de confirmación para eliminar contexto */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title={t('profile.contexts.deleteModalTitle')}
        message={t('profile.contexts.deleteModalMessage', { name: contextToDelete?.name || '' })}
        confirmText={t('profile.contexts.deleteConfirm')}
        cancelText={t('profile.contexts.deleteCancel')}
        isLoading={deleting}
      />
    </div>
  );
};

