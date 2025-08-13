import { RecommendationError, RecommendationErrorType, ERROR_MESSAGES, ERROR_STATUS_CODES } from '../types/error.types';

/**
 * Create a recommendation error object
 */
export function createRecommendationError(
  type: RecommendationErrorType,
  details?: string,
  context?: Record<string, any>
): RecommendationError {
  return {
    type,
    message: ERROR_MESSAGES[type],
    details,
    code: `${type}_${Date.now()}`,
    timestamp: new Date(),
    context
  };
}

/**
 * Get HTTP status code for error type
 */
export function getErrorStatusCode(errorType: RecommendationErrorType): number {
  return ERROR_STATUS_CODES[errorType];
}

/**
 * Log error with context
 */
export function logRecommendationError(error: RecommendationError): void {
  console.error('Recommendation Error:', {
    type: error.type,
    message: error.message,
    details: error.details,
    code: error.code,
    timestamp: error.timestamp,
    context: error.context
  });
}

/**
 * Validate recommendation parameters
 */
export function validateRecommendationParams(productId: number, limit: number): { isValid: boolean; error?: RecommendationError } {
  if (!productId || productId <= 0) {
    return {
      isValid: false,
      error: createRecommendationError(
        RecommendationErrorType.VALIDATION_ERROR,
        `Invalid product ID: ${productId}`,
        { productId, limit }
      )
    };
  }

  if (!limit || limit <= 0 || limit > 50) {
    return {
      isValid: false,
      error: createRecommendationError(
        RecommendationErrorType.VALIDATION_ERROR,
        `Invalid limit: ${limit}. Must be between 1 and 50`,
        { productId, limit }
      )
    };
  }

  return { isValid: true };
}

/**
 * Handle database errors
 */
export function handleDatabaseError(error: any, context: string): RecommendationError {
  const isConnectionError = error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND';
  const isQueryError = error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_FIELD_ERROR';
  
  if (isConnectionError) {
    return createRecommendationError(
      RecommendationErrorType.DATABASE_ERROR,
      `Database connection failed: ${error.message}`,
      { context, errorCode: error.code }
    );
  }

  if (isQueryError) {
    return createRecommendationError(
      RecommendationErrorType.DATABASE_ERROR,
      `Database query error: ${error.message}`,
      { context, errorCode: error.code }
    );
  }

  return createRecommendationError(
    RecommendationErrorType.DATABASE_ERROR,
    `Database error: ${error.message}`,
    { context, errorCode: error.code }
  );
}

/**
 * Handle algorithm errors
 */
export function handleAlgorithmError(error: any, algorithm: string): RecommendationError {
  return createRecommendationError(
    RecommendationErrorType.ALGORITHM_ERROR,
    `Algorithm '${algorithm}' failed: ${error.message}`,
    { algorithm, error: error.message }
  );
}

/**
 * Handle insufficient data errors
 */
export function handleInsufficientDataError(dataType: string, required: number, actual: number): RecommendationError {
  return createRecommendationError(
    RecommendationErrorType.INSUFFICIENT_DATA,
    `Insufficient ${dataType} data. Required: ${required}, Actual: ${actual}`,
    { dataType, required, actual }
  );
}

/**
 * Format error for API response
 */
export function formatErrorResponse(error: RecommendationError): any {
  return {
    success: false,
    error,
    message: error.message,
    statusCode: getErrorStatusCode(error.type)
  };
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: RecommendationError): boolean {
  const retryableTypes = [
    RecommendationErrorType.NETWORK_ERROR,
    RecommendationErrorType.DATABASE_ERROR,
    RecommendationErrorType.CACHE_ERROR
  ];
  
  return retryableTypes.includes(error.type);
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: RecommendationError): string {
  const userMessages = {
    [RecommendationErrorType.PRODUCT_NOT_FOUND]: 'Sorry, we couldn\'t find this product for recommendations.',
    [RecommendationErrorType.INSUFFICIENT_DATA]: 'We don\'t have enough data to show recommendations right now.',
    [RecommendationErrorType.DATABASE_ERROR]: 'We\'re experiencing technical difficulties. Please try again later.',
    [RecommendationErrorType.VALIDATION_ERROR]: 'Invalid request. Please check your parameters.',
    [RecommendationErrorType.ALGORITHM_ERROR]: 'We\'re having trouble processing recommendations. Please try again.',
    [RecommendationErrorType.NETWORK_ERROR]: 'Network connection issue. Please check your internet connection.',
    [RecommendationErrorType.RATE_LIMIT_ERROR]: 'Too many requests. Please wait a moment before trying again.',
    [RecommendationErrorType.CACHE_ERROR]: 'Temporary service issue. Please try again.',
    [RecommendationErrorType.CONFIGURATION_ERROR]: 'Service configuration issue. Please contact support.'
  };

  return userMessages[error.type] || 'An unexpected error occurred. Please try again.';
} 