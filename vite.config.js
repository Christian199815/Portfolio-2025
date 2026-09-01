import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';
import path from 'node:path';
import { projectsApiPlugin } from './vite-projects-api.js';
import { contactApiPlugin } from './vite-contact-api.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      ...(process.env.RAILWAY_ENVIRONMENT || process.env.CI ? [] : [mkcert()]),
      projectsApiPlugin({ preprToken: env.PREPR_ACCESS_TOKEN }),
      contactApiPlugin(env),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src'),
      },
    },
    define: {
      'import.meta.env.STORYBLOK_DELIVERY_API_TOKEN': JSON.stringify(
        env.STORYBLOK_DELIVERY_API_TOKEN,
      ),
      'import.meta.env.STORYBLOK_REGION': JSON.stringify(env.STORYBLOK_REGION || 'us'),
      'import.meta.env.STORYBLOK_API_BASE_URL': JSON.stringify(env.STORYBLOK_API_BASE_URL),
    },
  };
});
