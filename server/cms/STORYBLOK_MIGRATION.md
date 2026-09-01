# Storyblok migration guide

When migrating from Prepr to Storyblok, map content models as follows:

| Normalized | Prepr | Storyblok |
|------------|-------|-----------|
| SkillWorld | Content model `SkillWorld` | Story type `skill-world` |
| WorldObject.objectType | Enum field | Block option `flying_text` / `interactive_object` |
| WorldObject.infoText | Text / Richtext | `textarea` or Richtext blok |
| WorldDetailPage | Content model `WorldDetailPage` | Story type `world-detail-page` |
| Panel | Repeatable component | Nested `panel` blok |

## Setup

1. Set `CMS_PROVIDER=storyblok` in `.env`
2. Implement `server/cms/providers/storyblok.js` using `@storyblok/js` or REST API
3. Transform Storyblok stories to the normalized schema in `server/cms/types.js`

The frontend and Three.js layers only consume normalized JSON — no changes required after the provider is implemented.
