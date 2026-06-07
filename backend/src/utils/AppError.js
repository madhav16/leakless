import { HTTP_STATUS } from '../constants/httpStatus.js';

/**
 * Custom application error.
 * Throw this inside services/controllers to trigger the centralized handler.
 *
 * @example
 * throw new AppError('Subscription not found', HTTP_STATUS.NOT_FOUND);
 */
export class AppError extends Error {
  /**
   * @param {string} message  Human-readable error description
   * @param {number} statusCode  HTTP status code (default 500)
   * @param {Record<string,unknown>} [meta]  Optional extra context (e.g. Zod field errors)
   */
  constructor(
    message,
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    meta = null,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.meta = meta;
    Error.captureStackTrace(this, this.constructor);
  }
}
