export interface UsePaginationOptions<T> {
  data: T[];
  page: number;
  limit: number;
  sortFn?: (a: T, b: T) => number;
}

export const usePagination = <T,>(options: UsePaginationOptions<T>) => {
  const { data, page, limit, sortFn } = options;

  if (!Array.isArray(data) || data.length === 0 || page < 1 || limit < 1) {
    return {
      paginatedData: [] as T[],
      totalItems: 0,
      itemsPerPage: 0,
      totalPages: 0,
      currentPage: page,
      hasNextPage: false,
      hasPreviousPage: false
    };
  }

  // Aplicar ordenamiento si se proporciona una función
  const sortedData = sortFn ? [...data].sort(sortFn) : [...data];

  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = sortedData.slice(start, end);
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / limit);

  return {
    paginatedData,
    totalItems,
    itemsPerPage: paginatedData.length,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  };
}
