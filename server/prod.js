import http from 'node:http';
import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createProjectsHandler } from '../vite-projects-api.js';
import { createContactHandler } from '../vite-contact-api.js';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || '0.0.0.0';

try {
  const text = readFileSync(path.join(ROOT, '.env'), 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (process.env[key] === undefined) process.env[key] = value;
  }
} catch {
  // Railway injects vars directly; a local .env is optional
}

const MIME = {
  html: 'text/html; charset=utf-8',
  js: 'text/javascript; charset=utf-8',
  css: 'text/css; charset=utf-8',
  json: 'application/json',
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  ico: 'image/x-icon',
  woff: 'font/woff',
  woff2: 'font/woff2',
  txt: 'text/plain; charset=utf-8',
};

const projects = createProjectsHandler({
  root: ROOT,
  token: process.env.PREPR_ACCESS_TOKEN,
});
const contact = createContactHandler(process.env);

function pipe(req, res, handlers) {
  let index = 0;
  const next = () => {
    const handler = handlers[index++];
    if (!handler) return serveStatic(req, res);
    return Promise.resolve(handler(req, res, next)).catch((error) => {
      console.error(`[prod] ${error.message}`);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end('Internal server error');
      }
    });
  };
  return next();
}

function safeFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  const resolved = path.resolve(DIST, `.${clean}`);
  if (!resolved.startsWith(DIST)) return null;
  return resolved;
}

async function serveStatic(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.end('Method not allowed');
    return;
  }

  const urlPath = req.url?.split('?')[0] || '/';
  const filePath = safeFile(urlPath.endsWith('/') ? `${urlPath}index.html` : urlPath);
  if (!filePath) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).slice(1);
    res.statusCode = 200;
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    res.end(req.method === 'HEAD' ? undefined : data);
    return;
  } catch {
    // SPA fallback — React Router owns every non-file path
  }

  try {
    const index = await fs.readFile(path.join(DIST, 'index.html'));
    res.statusCode = 200;
    res.setHeader('Content-Type', MIME.html);
    res.end(req.method === 'HEAD' ? undefined : index);
  } catch {
    res.statusCode = 500;
    res.end('Missing dist/. Run npm run build first.');
  }
}

const server = http.createServer((req, res) => {
  pipe(req, res, [projects, contact]);
});

server.listen(PORT, HOST, () => {
  console.log(`[prod] listening on http://${HOST}:${PORT}`);
  if (!process.env.PREPR_ACCESS_TOKEN) {
    console.warn('[prod] PREPR_ACCESS_TOKEN is not set — /api/projects will use projects.json');
  }
});
