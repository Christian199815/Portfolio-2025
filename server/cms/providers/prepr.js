import { log } from '../../../client/debug.js';

const _fileName = 'cms/prepr';

const SKILL_WORLDS_QUERY = `
query GetSkillWorlds {
  SkillWorlds {
    items {
      _id
      discipline
      title
      description
      world_objects {
        object_type
        label
        info_text
        link_type
        link_target
        position_x
        position_y
        position_z
      }
    }
  }
}
`;

const WORLD_DETAIL_PAGES_QUERY = `
query GetWorldDetailPages {
  WorldDetailPages {
    items {
      _slug
      title
      discipline
      panels {
        heading
        body
        image { url }
        cta_label
        cta_url
      }
    }
  }
}
`;

function normalizeObject(raw, index, discipline) {
  const hasPosition =
    raw.position_x != null || raw.position_y != null || raw.position_z != null;

  return {
    id: raw._id || `${discipline}-obj-${index}`,
    objectType: raw.object_type === 'interactive_object' ? 'interactive_object' : 'flying_text',
    label: raw.label || '',
    infoText: raw.info_text || '',
    linkType: raw.link_type || 'none',
    linkTarget: raw.link_target || '',
    position: hasPosition
      ? {
          x: Number(raw.position_x) || 0,
          y: Number(raw.position_y) || 0,
          z: Number(raw.position_z) || -2,
        }
      : null,
  };
}

function transformSkillWorlds(data) {
  const items = data?.SkillWorlds?.items;
  if (!Array.isArray(items) || items.length === 0) return [];

  const deviceMap = {
    'web-design': 'computer',
    'web-programming': 'ipad',
    'game-programming': 'vr',
    'game-design': 'tv',
  };

  return items.map((item) => ({
    discipline: item.discipline,
    title: item.title || '',
    description: item.description || '',
    device: deviceMap[item.discipline] || 'computer',
    objects: (item.world_objects || []).map((obj, i) =>
      normalizeObject(obj, i, item.discipline)
    ),
  }));
}

function transformDetailPages(data) {
  const items = data?.WorldDetailPages?.items;
  if (!Array.isArray(items) || items.length === 0) return [];

  return items.map((item) => ({
    slug: item._slug,
    title: item.title || '',
    discipline: item.discipline,
    panels: (item.panels || []).map((panel) => ({
      heading: panel.heading || '',
      body: panel.body || '',
      image: panel.image?.url || '',
      ctaLabel: panel.cta_label || '',
      ctaUrl: panel.cta_url || '',
    })),
  }));
}

/**
 * @param {typeof import('../../server.js')} fetchFromPrepr - injected fetch fn
 */
export function createPreprProvider(fetchFromPrepr) {
  return {
    async fetchSkillWorlds() {
      try {
        const data = await fetchFromPrepr(SKILL_WORLDS_QUERY);
        const worlds = transformSkillWorlds(data);
        if (worlds.length > 0) {
          log(_fileName, true, `Loaded ${worlds.length} skill worlds from Prepr`);
          return worlds;
        }
      } catch (err) {
        log(_fileName, true, `Prepr skill worlds failed: ${err.message}`);
      }
      return null;
    },

    async fetchWorldDetailPages() {
      try {
        const data = await fetchFromPrepr(WORLD_DETAIL_PAGES_QUERY);
        const pages = transformDetailPages(data);
        if (pages.length > 0) {
          log(_fileName, true, `Loaded ${pages.length} world detail pages from Prepr`);
          return pages;
        }
      } catch (err) {
        log(_fileName, true, `Prepr detail pages failed: ${err.message}`);
      }
      return null;
    },
  };
}
