import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const site = 'https://websites.lucakosowski.com';

export default defineConfig({
  site,
  outDir: './docs',
  output: 'static',
  compressHTML: false,
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => {
        const url = new URL(page);
        if (url.origin !== site) return false;
        if (url.pathname.startsWith('/answers/')) return false;
        return true;
      },
    }),
  ],
});
