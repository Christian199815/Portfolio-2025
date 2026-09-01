import { useCallback, useEffect, useMemo, useState } from 'react';
import { applyFilters, filterByIndustry } from '../../projects-query.js';

const ENDPOINTS = ['/api/projects', '/projects-data.json'];

async function readCatalog(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  const text = await res.text();
  if (!text || text.trimStart().startsWith('<')) return null;
  const json = JSON.parse(text);
  if (!Array.isArray(json.projects)) return null;
  return json;
}

async function loadCatalog() {
  for (const url of ENDPOINTS) {
    try {
      const catalog = await readCatalog(url);
      if (catalog) return catalog;
    } catch {
      // HTML fallback pages throw; try the next source
    }
  }
  throw new Error('Failed to load projects');
}

export function useProjects(filters = {}) {
  const [catalog, setCatalog] = useState({
    projects: [],
    categories: [],
    productTypes: [],
    projectTypes: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { industry, category, productType, projectType, sortBy } = filters;

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setCatalog(await loadCatalog());
    } catch (err) {
      setError(err.message);
      setCatalog({ projects: [], categories: [], productTypes: [], projectTypes: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const projects = useMemo(
    () =>
      applyFilters(filterByIndustry(catalog.projects, industry), {
        category,
        productType,
        projectType,
        sortBy,
      }),
    [catalog.projects, industry, category, productType, projectType, sortBy],
  );

  return {
    projects,
    categories: catalog.categories,
    productTypes: catalog.productTypes,
    projectTypes: catalog.projectTypes,
    loading,
    error,
    refetch: fetchProjects,
  };
}

export function useProject(id) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const direct = await fetch(`/api/projects/${id}`);
        if (direct.ok) {
          const text = await direct.text();
          if (text && !text.trimStart().startsWith('<')) {
            const json = JSON.parse(text);
            if (!cancelled) setProject(json.project);
            return;
          }
        }

        const catalog = await loadCatalog();
        const match = catalog.projects.find((item) => item.id === id || item.slug === id);
        if (!match) throw new Error('Project not found');
        if (!cancelled) setProject(match);
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setProject(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { project, loading, error };
}
