import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://vishwamaggarwal.com',
  integrations: [sitemap()],
});
