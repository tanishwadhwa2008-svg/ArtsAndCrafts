/**
 * Standard API response envelope shared by the API and web clients.
 * Keeping a single shape makes error handling and typing predictable.
 */
export interface ApiError {
  code: string;
  message: string;
  /** Optional field-level validation details. */
  details?: Record<string, string[]>;
}

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiFailure {
  ok: false;
  error: ApiError;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

/** Cursor/offset pagination metadata returned by list endpoints. */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}
