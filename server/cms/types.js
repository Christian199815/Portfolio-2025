/**
 * @typedef {'web-design'|'web-programming'|'game-programming'|'game-design'} Discipline
 * @typedef {'flying_text'|'interactive_object'} ObjectType
 * @typedef {'detail_page'|'project'|'external'|'none'} LinkType
 * @typedef {'computer'|'ipad'|'vr'|'tv'} DeviceType
 *
 * @typedef {Object} WorldPosition
 * @property {number} x
 * @property {number} y
 * @property {number} z
 *
 * @typedef {Object} WorldObject
 * @property {string} id
 * @property {ObjectType} objectType
 * @property {string} label
 * @property {string} infoText
 * @property {LinkType} linkType
 * @property {string} linkTarget
 * @property {WorldPosition|null} [position]
 *
 * @typedef {Object} SkillWorld
 * @property {Discipline} discipline
 * @property {string} title
 * @property {string} description
 * @property {DeviceType} device
 * @property {WorldObject[]} objects
 *
 * @typedef {Object} WorldPanel
 * @property {string} heading
 * @property {string} body
 * @property {string} [image]
 * @property {string} [ctaLabel]
 * @property {string} [ctaUrl]
 *
 * @typedef {Object} WorldDetailPage
 * @property {string} slug
 * @property {string} title
 * @property {Discipline} discipline
 * @property {WorldPanel[]} panels
 */

export const DISCIPLINES = [
  'web-design',
  'web-programming',
  'game-programming',
  'game-design',
];

export const DEVICE_BY_DISCIPLINE = {
  'web-design': 'computer',
  'web-programming': 'ipad',
  'game-programming': 'vr',
  'game-design': 'tv',
};
