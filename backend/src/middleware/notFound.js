import { sendError } from '../utils/response.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

/**
 * Catch-all 404 handler.
 * Register this BEFORE the error handler but AFTER all routes.
 */
export function notFound(req, res) {
  sendError(
    res,
    `Route not found: ${req.method} ${req.originalUrl}`,
    HTTP_STATUS.NOT_FOUND,
  );
}
