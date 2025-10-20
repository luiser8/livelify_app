import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BottomNav, PageHeader, ConfirmModal, Copyright } from '@/shared/components';
import { useAuth } from '@/features/auth/context';
import { contextService, type Context } from '@/infrastructure/services';

/**
 * Página de Profile
 */
export const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [contexts, setContexts] = useState<Context[]>([]);
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
        const [contextsData] = await Promise.all([
          contextService.getMyContexts(),
        ]);
        setContexts(contextsData.contexts);
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

      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        <div className="space-y-4 sm:space-y-6">
          {/* User Info Card - Full Width */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg sm:text-2xl font-bold text-indigo-600">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-xl font-semibold text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              {/* Logout Button - Responsive */}
              <button
                onClick={logout}
                className="px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap flex-shrink-0"
              >
                {t('profile.actions.logout')}
              </button>
            </div>
          </div>

          {/* Grid Layout for Subscription and Contexts */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 sm:gap-6">

            {/* Contexts Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">{t('profile.contexts.title')}</h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{t('profile.contexts.description')}</p>
              </div>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
              >
                {showCreateForm ? t('profile.contexts.cancel') : t('profile.contexts.addContext')}
              </button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
              <form onSubmit={handleCreateContext} className="mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  {t('profile.contexts.contextName')}
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex items-center border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
                    <span className="pl-3 sm:pl-4 text-gray-700 font-medium text-sm sm:text-base select-none">@</span>
                    <input
                      type="text"
                      value={newContextName}
                      onChange={(e) => setNewContextName(e.target.value)}
                      placeholder={t('profile.contexts.placeholder')}
                      className="flex-1 px-2 py-2 text-sm sm:text-base border-0 outline-none bg-transparent"
                      disabled={creating}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={creating || !newContextName.trim()}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
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
                    className="flex items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-2"
                  >
                    <div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">{context.name}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                          <p className="text-xs text-gray-500 truncate">
                            {t('profile.contexts.created')} {new Date(context.createdAt).toLocaleDateString()}
                          </p>
                          {context.actionsCount > 0 && (
                            <>
                              <span className="hidden sm:inline text-xs text-gray-500">•</span>
                              <p className="text-xs text-indigo-600 font-medium">
                                {t('profile.contexts.actionsCount', { count: context.actionsCount })}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <span className="hidden sm:inline text-xs text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-200 whitespace-nowrap">
                        {t('profile.contexts.active')}
                      </span>
                      <button
                        onClick={() => handleOpenDeleteModal(context)}
                        disabled={!context.canDelete}
                        className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
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
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      <Copyright />
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

