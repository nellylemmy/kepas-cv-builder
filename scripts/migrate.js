import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pool from '../src/config/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '..', 'migrations');

const files = (await fs.readdir(dir)).filter(f => f.endsWith('.sql')).sort();
for (const f of files) {
  const sql = await fs.readFile(path.join(dir, f), 'utf8');
  console.log(`Applying ${f}…`);
  await pool.query(sql);
}
console.log(`Applied ${files.length} migration(s).`);
await pool.end();
