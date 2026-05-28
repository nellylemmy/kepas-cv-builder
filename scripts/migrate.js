import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pool from '../src/config/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '..', 'migrations');

await pool.query(`
  CREATE TABLE IF NOT EXISTS _migrations (
    name TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

const applied = new Set(
  (await pool.query('SELECT name FROM _migrations')).rows.map(r => r.name),
);

const files = (await fs.readdir(dir)).filter(f => f.endsWith('.sql')).sort();
let count = 0;
for (const f of files) {
  if (applied.has(f)) {
    console.log(`Skip  ${f} (already applied)`);
    continue;
  }
  const sql = await fs.readFile(path.join(dir, f), 'utf8');
  console.log(`Apply ${f}…`);
  await pool.query(sql);
  await pool.query('INSERT INTO _migrations(name) VALUES ($1)', [f]);
  count += 1;
}
console.log(`Done. Applied ${count} new migration(s).`);
await pool.end();
