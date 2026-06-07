import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Run schema.sql and optionally seed.sql.
 * Usage: node src/config/dbInit.js [--seed]
 */
async function init() {
  const shouldSeed = process.argv.includes('--seed');
  const conn = await pool.getConnection();

  try {
    const schemaPath = join(__dirname, '../../database/schema.sql');
    const schema = await readFile(schemaPath, 'utf8');

    console.log('🔄  Running schema...');
    const statements = schema
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);

    for (const stmt of statements) {
      await conn.query(stmt);
    }
    console.log('✅  Schema applied');

    if (shouldSeed) {
      const seedPath = join(__dirname, '../../database/seed.sql');
      const seed = await readFile(seedPath, 'utf8');

      console.log('🔄  Running seed...');
      const seedStatements = seed
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean);

      for (const stmt of seedStatements) {
        await conn.query(stmt);
      }
      console.log('✅  Seed data inserted');
    }
  } finally {
    conn.release();
    await pool.end();
  }
}

init().catch((err) => {
  console.error('❌  Database init failed:', err);
  process.exit(1);
});
