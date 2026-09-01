import fs from 'node:fs/promises';
import path from 'node:path';
import { getProjects, clearProjectsCache } from './projects-source.js';
import { applyFilters, catalog, filterByIndustry, normalizeProject } from './projects-query.js';

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export function createProjectsHandler({ root, token } = {}) {
  const load = () => getProjects({ root, token });

  return async function projectsHandler(req, res, next) {
    const url = new URL(req.url, 'http://localhost');

    if (url.pathname === '/api/projects') {
      try {
        if (url.searchParams.has('refresh')) clearProjectsCache();
        const all = await load();
        const data = catalog(all);
        data.projects = applyFilters(filterByIndustry(data.projects, url.searchParams.get('industry')), {
          category: url.searchParams.get('category') || '',
          productType: url.searchParams.get('productType') || '',
          projectType: url.searchParams.get('projectType') || '',
          sortBy: url.searchParams.get('sortBy') || 'newest',
        });
        return sendJson(res, 200, data);
      } catch {
        return sendJson(res, 500, { error: 'Failed to load projects' });
      }
    }

    if (url.pathname.startsWith('/api/projects/')) {
      const id = decodeURIComponent(url.pathname.split('/').pop());
      try {
        const all = await load();
        const project = all.find((p) => p.id === id || p.slug === id);
        if (!project) return sendJson(res, 404, { error: 'Project not found' });
        return sendJson(res, 200, { project: normalizeProject(project) });
      } catch {
        return sendJson(res, 500, { error: 'Failed to load project' });
      }
    }

    if (url.pathname.startsWith('/resources/')) {
      const filePath = path.join(root, 'public', url.pathname);
      try {
        const data = await fs.readFile(filePath);
        const ext = path.extname(filePath).slice(1);
        const types = {
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          gif: 'image/gif',
          webp: 'image/webp',
        };
        res.statusCode = 200;
        res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
        res.end(data);
        return;
      } catch {
        res.statusCode = 404;
        res.end('Not found');
        return;
      }
    }

    next();
  };
}

export function projectsApiPlugin({ preprToken } = {}) {
  let root = process.cwd();
  let outDir = path.join(root, 'dist');

  function attach(server) {
    server.middlewares.use(
      createProjectsHandler({ root: server.config.root, token: preprToken }),
    );
  }

  return {
    name: 'projects-api',
    configResolved(config) {
      root = config.root;
      outDir = path.resolve(config.root, config.build.outDir);
    },
    configureServer: attach,
    configurePreviewServer: attach,
    async closeBundle() {
      // Snapshot for hosts that only serve the built files (no /api)
      const all = await getProjects({ root, token: preprToken });
      await fs.mkdir(outDir, { recursive: true });
      await fs.writeFile(path.join(outDir, 'projects-data.json'), JSON.stringify(catalog(all)));
      console.log(`[projects] wrote ${all.length} projects to ${path.join(outDir, 'projects-data.json')}`);
    },
  };
}

