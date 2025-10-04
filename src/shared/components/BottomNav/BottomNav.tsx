import { useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: (isActive: boolean) => React.ReactNode;
  matchPaths?: string[]; // Rutas adicionales que también activan este item
}

/**
 * Componente de navegación inferior
 * Barra de navegación fija en la parte inferior de la pantalla
 */
export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: (isActive) => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={isActive ? 2.5 : 2} 
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
          />
        </svg>
      ),
    },
    {
      id: 'wheel',
      label: 'Wheel',
      path: '/home',
      icon: (isActive) => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={isActive ? 2.5 : 2} 
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
          />
        </svg>
      ),
      matchPaths: ['/assessment'],
    },
    {
      id: 'projects',
      label: 'Projects',
      path: '/projects',
      icon: (isActive) => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={isActive ? 2.5 : 2} 
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" 
          />
        </svg>
      ),
      matchPaths: ['/area'],
    },
    {
      id: 'actions',
      label: 'Actions',
      path: '/actions',
      icon: (isActive) => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={isActive ? 2.5 : 2} 
            d="M4 6h16M4 10h16M4 14h16M4 18h16" 
          />
        </svg>
      ),
    },
    {
      id: 'profile',
      label: 'Profile',
      path: '/profile',
      icon: (isActive) => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={isActive ? 2.5 : 2} 
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
          />
        </svg>
      ),
    },
  ];

  const isActive = (item: NavItem) => {
    // Verificar si la ruta actual coincide exactamente
    if (location.pathname === item.path) return true;
    
    // Verificar si la ruta actual coincide con alguna de las rutas adicionales
    if (item.matchPaths) {
      return item.matchPaths.some(matchPath => location.pathname.startsWith(matchPath));
    }
    
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center py-3 px-4 min-w-[80px] transition-all hover:bg-gray-50"
              >
                <div className={active ? 'text-indigo-600' : 'text-gray-500'}>
                  {item.icon(active)}
                </div>
                <span
                  className={`text-xs mt-1 ${
                    active
                      ? 'text-indigo-600 font-semibold'
                      : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

