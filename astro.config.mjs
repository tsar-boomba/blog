import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import compress from 'astro-compress';
import mdx from '@astrojs/mdx';
import robotsTxt from 'astro-robots-txt';

// https://astro.build/config
export default defineConfig({
	site: 'https://blog.igamble.dev',
	// Enable Preact to support Preact JSX components.
	integrations: [
		sitemap(),
		compress(),
		mdx(),
		robotsTxt({
			sitemap: true,
		}),
	],
});
