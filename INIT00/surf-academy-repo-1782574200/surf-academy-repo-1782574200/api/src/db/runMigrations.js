import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './pool.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, '../../../db/migrations');
for (const file of fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()) {
  const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
  await pool.query(sql);
}
await pool.end();
