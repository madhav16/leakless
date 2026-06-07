import morgan from 'morgan';
import { env } from '../config/env.js';

/**
 * HTTP request logger.
 * Uses 'dev' format in development, 'combined' in production.
 */
export const requestLogger = morgan(
  env.NODE_ENV === 'production' ? 'combined' : env.LOG_LEVEL,
);
