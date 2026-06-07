import { AppError } from '../utils/AppError.js';
import { sendError } from '../utils/response.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { env } from '../config/env.js';

/**
 * Centralized error handling middleware.
 * Must be registered LAST in the Express middleware chain.
 *
 * Handles:
 * - AppError (known operational errors)
 * - Zod validation errors (z.ZodError)
 * - MySQL duplicate entry (ER_DUP_ENTRY)
 * - Generic uncaught errors
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // ── Zod validation error ──────────────────────────────────
  if (err.name === 'ZodError') {
    const fieldErrors = err.flatten().fieldErrors;
    return sendError(
      res,
      'Validation failed',
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      fieldErrors,
    );
  }

  // ── Known operational error ───────────────────────────────
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.meta);
  }

  // ── MySQL duplicate entry ─────────────────────────────────
  if (err.code === 'ER_DUP_ENTRY') {
    return sendError(res, 'Duplicate entry — resource already exists.', HTTP_STATUS.CONFLICT);
  }

  // ── MySQL foreign key constraint ──────────────────────────
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return sendError(
      res,
      'Referenced resource does not exist.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  // ── Unknown / programmer error ────────────────────────────
  const isDev = env.NODE_ENV === 'development';

  console.error('💥  Unhandled error:', err);

  return sendError(
    res,
    isDev ? err.message : 'Internal server error',
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    isDev ? { stack: err.stack } : null,
  );
}
