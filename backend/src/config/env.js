import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  PORT: z.coerce.number().default(3001),

  // Database
  DB_HOST: z.string().min(1, 'DB_HOST is required'),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string().min(1, 'DB_USER is required'),
  DB_PASSWORD: z.string().optional(),
  DB_NAME: z.string().min(1, 'DB_NAME is required'),
  DB_CONNECTION_LIMIT: z.coerce.number().default(10),
  DB_QUEUE_LIMIT: z.coerce.number().default(0),
  DB_WAIT_FOR_CONNECTIONS: z
    .string()
    .transform((v) => v === 'true')
    .default('true'),

  // CORS
  CORS_ORIGIN: z.string().url().default('http://localhost:5173'),

  // Logging
  LOG_LEVEL: z.string().default('dev'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌  Invalid environment variables:\n', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
