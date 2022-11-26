import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import compress from 'astro-compress';
import mdx from '@astrojs/mdx';
import robotsTxt from 'astro-robots-txt';

// plugin in separate file don't work 🤷
import type { Plugin } from 'unified';
import type { Root } from 'mdast';
import { getHighlighter, Lang } from 'shiki';
import type { Highlighter } from 'shiki';
import { visit } from 'unist-util-visit';

type BlockParams = {
	file?: string;
	noBadge?: boolean;
};

let highlighterCache: Promise<Highlighter>;
const parseLangRe = /(?=(?:file=(?<file>\S*))?)(?=(?:noBadge=(?<noBadge>true|false))?)/g;
export const remarkCustomCodeBlock: () => Promise<Plugin<any[], Root>> = async () => {
	if (!highlighterCache)
		highlighterCache = getHighlighter({
			theme: 'css-variables',
		});
	const highlighter = await highlighterCache;

	return () => (tree) => {
		visit(tree, 'code', (node) => {
			const rawLang = node.lang ?? 'plaintext';
			const metaMatch = parseLangRe.exec(node.meta ?? '');

			if (!metaMatch) {
				return console.warn(
					'Meta section of code fence should match format <file (optional)> <noBadge (true or false, optional)',
				);
			}

			const { file, noBadge = false } = metaMatch.groups as unknown as BlockParams;

			const langColorMap: { [K in Lang]?: { bg: string; fg: string } } = {
				css: { bg: '#264de4', fg: '#fff' },
				ts: { bg: '#007acc', fg: '#fff' },
				tsx: { bg: '#007acc', fg: '#fff' },
				java: { bg: '#ed8b00', fg: '#fff' },
				rust: { bg: '#dea584', fg: '#fff' },
				astro: { bg: '#ff5a03', fg: '#fff' },
				toml: { bg: '#9c4221', fg: '#fff' },
			};

			const lang: Lang = (() => {
				const lang = rawLang as Lang;

				if (lang === 'typescript') return 'ts';
				if (lang === 'javascript') return 'js';
				if (lang === 'rs') return 'rust';
				return lang;
			})();

			let codeHtml: string = highlighter.codeToHtml(node.value, { lang });
			if (file) {
				codeHtml = codeHtml.replace(`shiki`, `shiki shiki-with-file-name`);
			}
			const html = `
				<div class='shiki-wrapper'>
					${file ? `<div class='code-file-name'>${file}</div>` : ''}
					<div style='position:relative'>
					${
						!noBadge
							? `<div
							class='language-badge'
							style='background-color:${langColorMap[lang]?.bg ?? '#888'};color:${
									langColorMap[lang]?.fg ?? '#fff'
							  }'
						>
							${lang.toUpperCase()}
						</div>`
							: ''
					}
						${codeHtml}
					</div>
				</div>
				`.trim();

			node.value = html;
			(node as any).type = 'html';
			(node as any).children = [];
		});
	};
};

// https://astro.build/config
export default defineConfig({
	site: 'https://blog.igamble.dev',
	vite: {
		server: {
			watch: {
				ignored: ['**/node_modules/**', '**/api/**'],
			},
		},
	},
	// Enable Preact to support Preact JSX components.
	integrations: [
		sitemap(),
		compress(),
		mdx(),
		robotsTxt({
			sitemap: true,
		}),
	],
	markdown: {
		syntaxHighlight: false,
		extendDefaultPlugins: true,
		remarkPlugins: [await remarkCustomCodeBlock()],
	},
});
