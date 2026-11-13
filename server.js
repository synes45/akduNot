// Serves dist/ and stores the published weights in a local JSON file.
// Run: npm run build && node server.js   (PORT, DATA_FILE, ADMIN_HASH are optional env vars)
import http from 'node:http';
import { createHash } from 'node:crypto';
import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, 'dist');
const DATA_FILE = process.env.DATA_FILE || join(HERE, 'data', 'weights.json');
const PORT = process.env.PORT || 3000;
// SHA-256 of the admin password (same value the admin page checks)
const HASH = process.env.ADMIN_HASH || '944a8abc097c3c6dac783c882030ad6c23b2c7acc3c8b8670bdf60df11d745c9';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };

const body = req => new Promise((ok, no) => {
  let s = '';
  req.on('data', c => { s += c; if (s.length > 50_000) { no(new Error('big')); req.destroy(); } });
  req.on('end', () => ok(s));
  req.on('error', no);
});

const api = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') {
    try { return res.end(await readFile(DATA_FILE, 'utf8')); } catch { return res.end('{}'); }
  }
  if (req.method === 'PUT') {
    try {
      const { password, weights } = JSON.parse(await body(req));
      if (createHash('sha256').update(String(password)).digest('hex') !== HASH) { res.statusCode = 401; return res.end('{"error":"auth"}'); }
      if (!weights || typeof weights !== 'object' || Array.isArray(weights)) throw new Error('shape');
      await mkdir(dirname(DATA_FILE), { recursive: true });
      await writeFile(DATA_FILE + '.tmp', JSON.stringify(weights, null, 2));
      await rename(DATA_FILE + '.tmp', DATA_FILE); // atomic replace
      return res.end('{"ok":true}');
    } catch { res.statusCode = 400; return res.end('{"error":"bad"}'); }
  }
  res.statusCode = 405; res.end();
};

http.createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path === '/api/weights') return api(req, res);
  let file = normalize(join(ROOT, path));
  if (!file.startsWith(ROOT)) { res.statusCode = 403; return res.end(); }
  let data;
  try { data = await readFile(file); } catch {
    // SPA fallback only for extensionless routes like /admin
    if (extname(path)) { res.statusCode = 404; return res.end(); }
    file = join(ROOT, 'index.html'); data = await readFile(file);
  }
  res.setHeader('Content-Type', TYPES[extname(file)] || 'application/octet-stream');
  res.setHeader('Cache-Control', path.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache');
  res.end(data);
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
