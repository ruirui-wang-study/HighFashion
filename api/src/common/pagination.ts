export function resolvePagination(page?: number, pageSize?: number, maxPageSize = 100) {
  const resolvedPage = Number.isInteger(page) && (page ?? 0) > 0 ? page! : 1;
  const resolvedPageSize = Number.isInteger(pageSize) && (pageSize ?? 0) > 0 ? Math.min(pageSize!, maxPageSize) : 25;
  return {
    page: resolvedPage,
    pageSize: resolvedPageSize,
    skip: (resolvedPage - 1) * resolvedPageSize,
  };
}

export function paginatedResult<T>(items: T[], total: number, page: number, pageSize: number) {
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
