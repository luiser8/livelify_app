import { BottomNav } from '@/shared/components';
import { useAuth } from '@/features/auth/context';

/**
 * Página de Profile
 */
export const ProfilePage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-900">Profile</h1>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-50 rounded-lg p-6 mb-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-600">
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

