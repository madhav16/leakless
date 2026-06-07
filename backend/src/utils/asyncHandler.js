/**
 * asyncHandler — wraps async route handlers to eliminate try/catch boilerplate.
 * Any rejected promise is forwarded to Express's next(err) error handler.
 *
 * @param {import('express').RequestHandler} fn  Async route handler
 * @returns {import('express').RequestHandler}
 *
 * @example
 * router.get('/', asyncHandler(async (req, res) => {
 *   const data = await someService.getData();
 *   sendSuccess(res, data);
 * }));
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
