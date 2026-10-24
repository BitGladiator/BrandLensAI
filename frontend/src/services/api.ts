import {
  HealthResponse,
  ReviewRequest,
  ReviewResponse,
  ApiErrorResponse,
} from '../types/review';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
).replace(/\/+$/, '');

export class ApiError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function parseValidationErrors(errorBody: ApiErrorResponse): string {
  if (typeof errorBody.detail === 'string') {
    return errorBody.detail;
  }
  if (Array.isArray(errorBody.detail) && errorBody.detail.length > 0) {
    return errorBody.detail
      .map((item) => {
        const field = item.loc ? item.loc.slice(1).join(' -> ') : 'Field';
        const msg = item.msg || 'Invalid value';
        return field ? `${field}: ${msg}` : msg;
      })
      .join('; ');
  }
  return 'Validation failed for request payload.';
}

export async function checkHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const url = `${API_BASE_URL}/api/health`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      throw new ApiError(
        `Backend health check returned HTTP ${response.status}`,
        response.status
      );
    }

    const data = await response.json();
    if (typeof data !== 'object' || data === null || data.status !== 'ok') {
      throw new ApiError('Unexpected health response shape from server');
    }

    return data as HealthResponse;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('Health check request timed out or was cancelled.');
    }
    const message =
      err instanceof Error ? err.message : 'Unable to connect to backend server';
    throw new ApiError(
      `Backend unavailable at ${API_BASE_URL}. Ensure the FastAPI server is running. (${message})`
    );
  }
}

export async function reviewDraft(
  request: ReviewRequest,
  signal?: AbortSignal
): Promise<ReviewResponse> {
  const url = `${API_BASE_URL}/api/review`;

  // Pre-validate client side to avoid redundant round-trips
  if (!request.draft_text || !request.draft_text.trim()) {
    throw new ApiError('Draft text must not be empty or whitespace only.', 422);
  }

  if (request.draft_text.length > 20000) {
    throw new ApiError(
      `Draft exceeds the 20,000 character limit (${request.draft_text.length.toLocaleString()} characters).`,
      422
    );
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(request),
      signal,
    });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('Review request timed out. Please try again.');
    }
    const message = err instanceof Error ? err.message : 'Network error';
    throw new ApiError(
      `Unable to reach review service at ${API_BASE_URL}. Please check your connection and server status. (${message})`
    );
  }

  if (!response.ok) {
    let errorDetail = `Review failed with HTTP ${response.status}`;
    try {
      const errorJson = (await response.json()) as ApiErrorResponse;
      errorDetail = parseValidationErrors(errorJson);
    } catch {
      // response was not JSON
      const text = await response.text().catch(() => '');
      if (text) {
        errorDetail = text;
      }
    }
    throw new ApiError(errorDetail, response.status);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ApiError('Received invalid JSON from review server.');
  }

  if (
    typeof data !== 'object' ||
    data === null ||
    !('findings' in data) ||
    !Array.isArray((data as ReviewResponse).findings) ||
    typeof (data as ReviewResponse).review_summary !== 'string'
  ) {
    throw new ApiError('Server response did not conform to the expected review schema.');
  }

  return data as ReviewResponse;
}

export { API_BASE_URL };
