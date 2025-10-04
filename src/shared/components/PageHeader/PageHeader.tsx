import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  /**
   * Título principal del navbar
   */
  title: string;
  /**
   * Subtítulo opcional (aparece debajo del título)
   */
  subtitle?: string;
  /**
   * Si se muestra la flecha de volver atrás
   * @default true
   */
  showBackButton?: boolean;
  /**
   * Ruta a la que navegar al hacer clic en la flecha atrás
   * Si no se proporciona, usa navigate(-1)
   */
  backPath?: string;
  /**
   * Si se muestra el icono de búsqueda
   * @default false
   */
  showSearch?: boolean;
  /**
   * Si se muestra el icono de filtro
   * @default false
   */
  showFilter?: boolean;
  /**
   * Callback al hacer clic en el botón de búsqueda
   */
  onSearchClick?: () => void;
  /**
   * Callback al hacer clic en el botón de filtro
   */
  onFilterClick?: () => void;
  /**
   * Contenido adicional para el header (aparece después del título)
   */
  children?: React.ReactNode;
}

/**
 * Componente de header reutilizable para páginas
 * Incluye navegación hacia atrás, título y acciones opcionales
 */
export const PageHeader = ({
  title,
  subtitle,
  showBackButton = true,
  backPath,
  showSearch = false,
  showFilter = false,
  onSearchClick,
  onFilterClick,
  children,
}: PageHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Botón de volver atrás y título */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                aria-label="Go back"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-600 truncate">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Acciones (búsqueda, filtro, etc.) */}
          {(showSearch || showFilter) && (
            <div className="flex gap-2 ml-2">
              {showSearch && (
                <button
                  onClick={onSearchClick}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Search"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}
              {showFilter && (
                <button
                  onClick={onFilterClick}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Filter"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Contenido adicional */}
        {children}
      </div>
    </header>
  );
};

