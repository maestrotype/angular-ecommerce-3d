// Error types for recommendations system
export enum RecommendationErrorType {
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA',
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  ALGORITHM_ERROR = 'ALGORITHM_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR'
}

export interface RecommendationError {
  type: RecommendationErrorType;
  message: string;
  details?: string;
  code?: string;
  timestamp: Date;
  context?: Record<string, any>;
}

export interface ErrorResponse {
  success: false;
  error: RecommendationError;
  message: string;
}

// Error messages for different scenarios
export const ERROR_MESSAGES = {
  PRODUCT_NOT_FOUND: 'Product not found in recommendations system',
  INSUFFICIENT_DATA: 'Insufficient data to generate recommendations',
  DATABASE_ERROR: 'Database error occurred while processing recommendations',
  VALIDATION_ERROR: 'Invalid parameters provided for recommendations',
  ALGORITHM_ERROR: 'Error occurred during recommendation algorithm execution',
  NETWORK_ERROR: 'Network error while fetching recommendations',
  RATE_LIMIT_ERROR: 'Too many requests for recommendations',
  CACHE_ERROR: 'Error accessing recommendation cache',
  CONFIGURATION_ERROR: 'Recommendation system configuration error'
} as const;

// HTTP status codes for different error types
export const ERROR_STATUS_CODES = {
  [RecommendationErrorType.PRODUCT_NOT_FOUND]: 404,
  [RecommendationErrorType.INSUFFICIENT_DATA]: 422,
  [RecommendationErrorType.DATABASE_ERROR]: 500,
  [RecommendationErrorType.VALIDATION_ERROR]: 400,
  [RecommendationErrorType.ALGORITHM_ERROR]: 500,
  [RecommendationErrorType.NETWORK_ERROR]: 503,
  [RecommendationErrorType.RATE_LIMIT_ERROR]: 429,
  [RecommendationErrorType.CACHE_ERROR]: 500,
  [RecommendationErrorType.CONFIGURATION_ERROR]: 500
} as const; 