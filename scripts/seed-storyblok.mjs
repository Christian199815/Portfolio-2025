#!/usr/bin/env node
/**
 * Push component schemas + seed dummy stories to Storyblok.
 *
 * Requires:
 *   STORYBLOK_MANAGEMENT_TOKEN — Personal access token from Storyblok account settings
 *
 * Usage:
 *   node scripts/seed-storyblok.mjs
 *   node scripts/seed-storyblok.mjs --stories-only
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { dummyStories } from '../src/storyblok/dummyStories.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SPACE_ID = '293914003359902';
const MAPI = `https://mapi.storyblok.com/v1/spaces/${SPACE_ID}`;

const token = process.env.STORYBLOK_MANAGEMENT_TOKEN;
const storiesOnly = process.argv.includes('--stories-only');

if (!token) {
  console.error('Missing STORYBLOK_MANAGEMENT_TOKEN in environment.');
  console.error('Create one at: https://app.storyblok.com/#/me/account?tab=token');
  process.exit(1);
}

async function api(path, options = {}) {
  const res = await fetch(`${MAPI}${path}`, {
    ...options,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    throw new Error(`Storyblok API ${res.status}: ${JSON.stringify(data)}`);
  }

  return data;
}

async function pushComponents() {
  const componentsPath = join(ROOT, '.storyblok/components/293914003359902/components.json');
  const components = JSON.parse(readFileSync(componentsPath, 'utf8'));

  console.log(`Pushing ${components.length} components…`);
  for (const component of components) {
    try {
      await api('/components/', {
        method: 'POST',
        body: JSON.stringify({ component }),
      });
      console.log(`  + created ${component.name}`);
    } catch (err) {
      if (String(err.message).includes('422') || String(err.message).includes('has already been taken')) {
        const existing = await api(`/components/${component.name}`);
        await api(`/components/${existing.component?.id ?? existing.id}`, {
          method: 'PUT',
          body: JSON.stringify({ component }),
        });
        console.log(`  ↻ updated ${component.name}`);
      } else {
        throw err;
      }
    }
  }
}

async function upsertStory(slug, storyDef) {
  let existing = null;
  try {
    const list = await api(`/stories?with_slug=${slug}`);
    existing = list.stories?.[0] ?? null;
  } catch {
    existing = null;
  }

  const payload = {
    story: {
      name: storyDef.name,
      slug: storyDef.slug,
      content: storyDef.content,
    },
  };

  if (existing) {
    await api(`/stories/${existing.id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    console.log(`  ↻ updated story /${slug}`);
  } else {
    await api('/stories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    console.log(`  + created story /${slug}`);
  }
}

async function seedStories() {
  console.log('Seeding dummy stories…');
  for (const [slug, storyDef] of Object.entries(dummyStories)) {
    await upsertStory(slug, storyDef);
  }
}

async function main() {
  if (!storiesOnly) {
    await pushComponents();
  }
  await seedStories();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
