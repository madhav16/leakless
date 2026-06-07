import 'dotenv/config';
import app from './app.js';
import { env } from './config/env.js';
import { testDbConnection } from './config/db.js';
import pool from './config/db.js';

const { PORT } = env;

async function bootstrap() {
  // Validate DB connection before accepting traffic
  await testDbConnection();

  const server = app.listen(PORT, () => {
    console.log(`🚀  LeakLess API running on http://localhost:${PORT}`);
    console.log(`📁  Environment: ${env.NODE_ENV}`);
    console.log(`🩺  Health: http://localhost:${PORT}/health`);
  });

  // ── Graceful Shutdown ──────────────────────────────────
  async function shutdown(signal) {
    console.log(`\n⚡  Received ${signal} — shutting down gracefully...`);
    server.close(async () => {
      console.log('🔌  HTTP server closed');
      await pool.end();
      console.log('🔌  Database pool closed');
      process.exit(0);
    });

    // Force exit after 10 seconds
    setTimeout(() => {
      console.error('⛔  Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    console.error('🔥  Unhandled Rejection:', reason);
  });
}

bootstrap();
