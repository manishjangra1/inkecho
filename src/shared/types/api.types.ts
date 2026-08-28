export interface ApiResponse<T> {
  readonly success: true;
  readonly data: T;
  readonly correlationId: string;
}

export interface ApiErrorDetail {
  readonly field: string;
  readonly message: string;
}

export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly correlationId: string;
  readonly details?: ReadonlyArray<ApiErrorDetail>;
  readonly snapshot?: unknown;
}

export interface ApiErrorResponse {
  readonly success: false;
  readonly error: ApiError;
}

export type ActionResponse<T> =
  | { readonly success: true; readonly data: T; readonly correlationId?: string }
  | { readonly success: false; readonly error: ApiError };

export interface HealthCheckResponse {
  readonly status: 'healthy' | 'degraded' | 'unhealthy';
  readonly timestamp: string;
  readonly uptime: number;
  readonly version: string;
  readonly environment: string;
}
