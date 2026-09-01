export function uniqueValues(projects, prop) {
  const seen = new Map();
  return projects
    .filter((p) => p[prop])
    .map((p) => p[prop])
    .filter((value) => {
      const lower = value.toLowerCase();
      if (seen.has(lower)) return false;
      seen.set(lower, true);
      return true;
    })
    .sort();
}

export function filterByIndustry(projects, industry) {
  if (!industry) return projects;
  if (industry === 'web') return projects.filter((p) => p.category?.toLowerCase().includes('web'));
  if (industry === 'game') return projects.filter((p) => p.category?.toLowerCase().includes('game'));
  return projects;
}

export function applyFilters(projects, { category, productType, projectType, sortBy } = {}) {
  const filtered = projects.filter((project) => {
    const matchesCategory = !category || project.category === category;
    const matchesProductType = !productType || project.typeOfProduct === productType;
    const matchesProjectType = !projectType || project.typeOfProject === projectType;
    return matchesCategory && matchesProductType && matchesProjectType;
  });

  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.projectDate) - new Date(b.projectDate);
      case 'name':
        return a.projectname.localeCompare(b.projectname);
      case 'newest':
      default:
        return new Date(b.projectDate) - new Date(a.projectDate);
    }
  });

  return filtered;
}

export function normalizeProject(project) {
  const clone = structuredClone(project);
  const fixUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('./')) return url.replace(/^\.\//, '/');
    return url.startsWith('/') ? url : `/${url}`;
  };

  clone.projectFeaturedImage = fixUrl(clone.projectFeaturedImage);
  clone.projectImages = (clone.projectImages || []).map(fixUrl);
  clone.projectProgress = (clone.projectProgress || []).map((progress) => ({
    ...progress,
    progressContent: (progress.progressContent || []).map((content) => ({
      ...content,
      url: fixUrl(content.url),
    })),
  }));
  return clone;
}

export function catalog(projects) {
  const normalized = projects.map(normalizeProject);
  return {
    projects: normalized,
    categories: uniqueValues(normalized, 'category'),
    productTypes: uniqueValues(normalized, 'typeOfProduct'),
    projectTypes: uniqueValues(normalized, 'typeOfProject'),
    source: normalized[0]?.source ?? 'local',
  };
}
