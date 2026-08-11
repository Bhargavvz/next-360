// ============================================================
// Next360 — API Response Types
// ============================================================

/** Standard successful API response wrapper */
export interface ApiResponse<T> {
  success: true;
  data: T;
  message: string;
  timestamp: string;
}

/** Standard error API response */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
  timestamp: string;
}

/** Paginated response wrapper */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/** Sort direction for API queries */
export type SortDirection = 'ASC' | 'DESC';

/** Common query parameters for paginated endpoints */
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: SortDirection;
}
