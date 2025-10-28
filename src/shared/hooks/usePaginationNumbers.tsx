/**
 * Hook para generar los números de página visibles en el componente de paginación
 * @param currentPage - Página actual
 * @param totalPages - Total de páginas
 * @param maxVisiblePages - Número máximo de páginas visibles (por defecto 5)
 * @returns Array con los números de página y '...' para las elipsis
 */
export const usePaginationNumbers = (
  currentPage: number, 
  totalPages: number, 
  maxVisiblePages: number = 5
): (number | string)[] => {
  const pages: (number | string)[] = [];
  
  // Si el total de páginas es menor o igual al máximo visible, mostrar todas
  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Siempre mostrar la primera página
  pages.push(1);

  // Calcular el rango de páginas intermedias
  const halfVisible = Math.floor((maxVisiblePages - 2) / 2);
  let startPage = Math.max(2, currentPage - halfVisible);
  let endPage = Math.min(totalPages - 1, currentPage + halfVisible);

  // Ajustar si estamos cerca del inicio
  if (currentPage <= halfVisible + 1) {
    endPage = Math.min(maxVisiblePages - 1, totalPages - 1);
  }

  // Ajustar si estamos cerca del final
  if (currentPage >= totalPages - halfVisible) {
    startPage = Math.max(2, totalPages - maxVisiblePages + 2);
  }

  // Agregar elipsis inicial si es necesario
  if (startPage > 2) {
    pages.push('...');
  }

  // Agregar páginas intermedias
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // Agregar elipsis final si es necesario
  if (endPage < totalPages - 1) {
    pages.push('...');
  }

  // Siempre mostrar la última página
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}