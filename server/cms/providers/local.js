/** @returns {Promise<{ skillWorlds: import('./types.js').SkillWorld[], worldDetailPages: import('./types.js').WorldDetailPage[] }>} */
export async function loadLocalWorlds() {
  return { skillWorlds: [], worldDetailPages: [] };
}

/** @returns {Promise<import('./types.js').SkillWorld[]>} */
export async function fetchSkillWorlds() {
  const { skillWorlds } = await loadLocalWorlds();
  return skillWorlds;
}

/** @param {string} slug @returns {Promise<import('./types.js').WorldDetailPage|null>} */
export async function fetchWorldDetailPage(slug) {
  const { worldDetailPages } = await loadLocalWorlds();
  return worldDetailPages.find((p) => p.slug === slug) || null;
}

/** @param {import('./types.js').Discipline} discipline @returns {Promise<import('./types.js').SkillWorld|null>} */
export async function fetchSkillWorldByDiscipline(discipline) {
  const worlds = await fetchSkillWorlds();
  return worlds.find((w) => w.discipline === discipline) || null;
}
