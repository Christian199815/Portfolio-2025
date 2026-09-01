import fs from 'node:fs/promises';
import path from 'node:path';

const PREPR_ENDPOINT = 'https://graphql.prepr.io';
const CACHE_TTL = 5 * 60 * 1000;

const PROJECTS_QUERY = `
query GetDetailPages {
  Detailpages {
    items {
      _id
      _slug
      project_name
      project_body_text
      project_featured_text
      project_featured_image { url }
      project_images_gallery { url }
      project_categories
      project_types_select
      project_products_select
      project_date
      project_languages { body slug }
      project_progress {
        progress_name
        progress_body_text
        progress_content { duration url }
      }
      project_quote
      project_link
    }
  }
}
`;

let cache = { at: 0, projects: null };

const readable = (value) => (value ? String(value).replace(/_/g, ' ') : value);

// Railway/dotenv sometimes store the wrapping quotes as part of the value
const cleanToken = (token) => token?.trim().replace(/^["']|["']$/g, '') || '';

// Prepr stores thumbnail-sized URLs (w_388); the width segment is swappable.
const atWidth = (url, width) => (url ? url.replace(/\/w_\d+\//, `/w_${width}/`) : '');

function transformPreprProject(item) {
  const gallery = Array.isArray(item.project_images_gallery)
    ? item.project_images_gallery
    : [item.project_images_gallery].filter(Boolean);

  return {
    id: item._id,
    slug: item._slug || '',
    projectname: item.project_name || 'Untitled',
    projectBodyText: item.project_body_text || '',
    projectFeaturedText: item.project_featured_text || '',
    projectFeaturedImage: atWidth(item.project_featured_image?.url, 1600),
    projectImages: gallery.map((img) => atWidth(img?.url, 1200)).filter(Boolean),
    category: readable(item.project_categories) || '',
    typeOfProject: readable(item.project_types_select) || '',
    typeOfProduct: readable(item.project_products_select) || '',
    projectDate: item.project_date || '',
    projectLanguages: (item.project_languages || []).map((lang) => lang.body || lang.slug),
    projectProgress: (item.project_progress || []).map((progress) => ({
      progressName: progress.progress_name || '',
      progressBodyText: progress.progress_body_text || '',
      progressContent: Array.isArray(progress.progress_content)
        ? progress.progress_content.map((content) => ({
            duration: content.duration ?? null,
            url: content.url ?? null,
          }))
        : [],
    })),
    projectQuote: item.project_quote || '',
    link: item.project_link || '',
    source: 'prepr',
  };
}

async function fetchFromPrepr(token) {
  const response = await fetch(`${PREPR_ENDPOINT}/${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query: PROJECTS_QUERY }),
  });

  if (!response.ok) throw new Error(`Prepr responded ${response.status}`);

  const payload = await response.json();
  if (payload.errors?.length && !payload.data) {
    throw new Error(payload.errors[0]?.message || 'Prepr GraphQL error');
  }

  const items = payload.data?.Detailpages?.items;
  if (!Array.isArray(items) || items.length === 0) return [];

  return items.map(transformPreprProject);
}

async function loadLocalProjects(root) {
  const raw = await fs.readFile(path.join(root, 'projects.json'), 'utf8');
  const data = JSON.parse(raw);
  return (data.projects || []).map((project) => ({
    ...project,
    category: readable(project.category),
    typeOfProject: readable(project.typeOfProject),
    typeOfProduct: readable(project.typeOfProduct),
    source: 'local',
  }));
}

/**
 * Prepr is the source of truth; projects.json is the offline fallback.
 */
export async function getProjects({ root, token }) {
  if (cache.projects && Date.now() - cache.at < CACHE_TTL) return cache.projects;

  if (token) {
    try {
      const projects = await fetchFromPrepr(cleanToken(token));
      if (projects.length) {
        cache = { at: Date.now(), projects };
        console.log(`[projects] loaded ${projects.length} projects from Prepr`);
        return projects;
      }
      console.warn('[projects] Prepr returned no projects, using projects.json');
    } catch (error) {
      console.warn(`[projects] Prepr fetch failed (${error.message}), using projects.json`);
    }
  } else {
    console.warn('[projects] PREPR_ACCESS_TOKEN not set, using projects.json');
  }

  const projects = await loadLocalProjects(root);
  cache = { at: Date.now(), projects };
  return projects;
}

export function clearProjectsCache() {
  cache = { at: 0, projects: null };
}
