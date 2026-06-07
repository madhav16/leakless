import { HTTP_STATUS } from '../constants/httpStatus.js';

/**
 * Send a standardized success response.
 *
 * @param {import('express').Response} res
 * @param {unknown} data
 * @param {string} [message]
 * @param {number} [statusCode]
 */
export function sendSuccess(
  res,
  data = null,
  message = 'Success',
  statusCode = HTTP_STATUS.OK,
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Send a standardized error response.
 *
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} [statusCode]
 * @param {unknown} [errors]
 */
export function sendError(
  res,
  message = 'Something went wrong',
  statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  errors = null,
) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

/**
 * Send a paginated list response.
 *
 * @param {import('express').Response} res
 * @param {unknown[]} data
 * @param {{ page: number, limit: number, total: number }} pagination
 * @param {string} [message]
 */
export function sendPaginated(res, data, pagination, message = 'Success') {
  const { page, limit, total } = pagination;

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  });
}
