// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://jdstemmler.dev',
  trailingSlash: 'always',
  integrations: [mdx()],
});
