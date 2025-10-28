import { usePaginationNumbers } from '../../hooks/usePaginationNumbers';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
  onPageChange: (page: number) => void;
  currentPage: number;
  totalPages: number;
  maxVisiblePages?: number;
  showPageInfo?: boolean;
}

/**
 * Componente de paginación reutilizable y mejorado
 */
export default function Pagination({
  onPageChange,
  currentPage,
  totalPages,
  maxVisiblePages = 5,
  showPageInfo = false,
}: PaginationProps) {
  const { t } = useTranslation();
  // Validaciones
  if (totalPages <= 0) return null;
  if (totalPages === 1) return null;

  const manejarAnterior = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const manejarSiguiente = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const manejarClickPagina = (page: number) => {
    if (page !== currentPage) {
      onPageChange(page);
    }
  };

  const numerosPagina = usePaginationNumbers(currentPage, totalPages, maxVisiblePages);

  return (
    <nav className="flex flex-col items-center gap-3 mt-6">
      {/* Info de página actual (opcional) */}
      {showPageInfo && (
        <div className="text-sm text-gray-600">
          Página <span className="font-semibold">{currentPage}</span> de{' '}
          <span className="font-semibold">{totalPages}</span>
        </div>
      )}

      {/* Controles de paginación */}
      <div className="flex rounded-lg shadow-sm overflow-hidden border border-gray-300">
        {/* Botón Anterior */}
        <button
          onClick={manejarAnterior}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-3 py-2 text-sm font-medium transition-colors
            ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
            }
          `}
          aria-label="Página anterior"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
              clipRule="evenodd"
            />
          </svg>
          <span className="ml-1 hidden sm:inline">{t('common.previous')}</span>
        </button>

        {/* Números de página */}
        {numerosPagina.map((pageNumber, index) =>
          pageNumber === '...' ? (
            <span
              key={`ellipsis-${index}`}
              className="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-400 bg-white border-l border-gray-300"
            >
              ...
            </span>
          ) : (
            <button
              key={`page-${pageNumber}`}
              onClick={() => manejarClickPagina(Number(pageNumber))}
              disabled={currentPage === pageNumber}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold border-l border-gray-300 transition-colors
                ${
                  currentPage === pageNumber
                    ? 'bg-indigo-600 text-white z-10 cursor-default'
                    : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                }
              `}
              aria-label={`Ir a página ${pageNumber}`}
              aria-current={currentPage === pageNumber ? 'page' : undefined}
            >
              {pageNumber}
            </button>
          )
        )}

        {/* Botón Siguiente */}
        <button
          onClick={manejarSiguiente}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center px-3 py-2 text-sm font-medium border-l border-gray-300 transition-colors
            ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
            }
          `}
          aria-label="Página siguiente"
        >
          <span className="mr-1 hidden sm:inline">{t('common.next')}</span>
          <svg
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
}
