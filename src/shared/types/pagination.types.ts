export interface PaginationParams {
  readonly page?: number;
  readonly limit?: number;
}

export interface Paginated<T> {
  readonly items: ReadonlyArray<T>;
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}
