/**
 * Error handling utilities for the QR Box Demo
 */

export class AppError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    throw new AppError(
      data.message || `API Error (${status})`,
      status,
      { response: data }
    );
  } else if (error.request) {
    // Network error
    throw new AppError(
      'Network error - please check your connection',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  } else {
    // Other error
    throw new AppError(
      error.message || 'Unknown error occurred',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
};

export const logError = (error, context = '') => {
  console.error(`[QR Box Error] ${context}:`, {
    message: error.message,
    code: error.code,
    timestamp: error.timestamp,
    details: error.details,
    stack: error.stack
  });
};

export const isAppError = (error) => {
  return error instanceof AppError;
}; 