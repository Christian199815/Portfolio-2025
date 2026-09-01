import * as local from './providers/local.js';
import { createPreprProvider } from './providers/prepr.js';
import * as storyblok from './providers/storyblok.js';

let cachedWorlds = null;
let cachedPages = null;

/**
 * @param {(query: string) => Promise<object|null>} fetchFromPrepr
 */
export function initCms(fetchFromPrepr) {
  const provider = process.env.CMS_PROVIDER || 'local';
  const prepr = createPreprProvider(fetchFromPrepr);

  return {
    provider,

    async getSkillWorlds() {
      if (cachedWorlds) return cachedWorlds;

      let worlds = null;

      if (provider === 'prepr') {
        worlds = await prepr.fetchSkillWorlds();
      } else if (provider === 'storyblok') {
        worlds = await storyblok.fetchSkillWorlds();
      }

      cachedWorlds = worlds?.length ? worlds : await local.fetchSkillWorlds();
      return cachedWorlds;
    },

    async getWorldDetailPage(slug) {
      const pages = await this.getWorldDetailPages();
      return pages.find((p) => p.slug === slug) || null;
    },

    async getWorldDetailPages() {
      if (cachedPages) return cachedPages;

      let pages = null;
      const preprProvider = createPreprProvider(fetchFromPrepr);

      if (provider === 'prepr') {
        pages = await preprProvider.fetchWorldDetailPages();
      } else if (provider === 'storyblok') {
        pages = await storyblok.fetchWorldDetailPages();
      }

      if (pages?.length) {
        cachedPages = pages;
      } else {
        const localData = await local.loadLocalWorlds();
        cachedPages = localData.worldDetailPages;
      }

      return cachedPages;
    },
  };
}
