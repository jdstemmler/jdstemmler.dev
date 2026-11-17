// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://jdstemmler.dev',
  trailingSlash: 'always',
  integrations: [
    mdx(),
    // The survey is unlisted: reachable by link, absent from the sitemap.
    sitemap({ filter: (page) => !page.includes('/ai-usage-survey/') }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'css-variables',
    },
  },
});
