import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import robotsTxt from 'astro-robots-txt';

// plugin in separate file don't work 🤷
import type { Plugin } from 'unified';
import type { Code, Root } from 'mdast';
import { visit } from 'unist-util-visit';
import playformCompress from '@playform/compress';
import hljs from 'highlight.js';

type BlockParams = {
	file?: string;
	noBadge?: boolean;
};

const parseLangRe = /(?=(?:file=(?<file>\S*))?)(?=(?:noBadge=(?<noBadge>true|false))?)/g;
const langColorMap: {
	[k: string]: {
		bg: string;
		fg: string;
	};
} = {
	css: {
		bg: '#264de4',
		fg: '#fff',
	},
	typescript: {
		bg: '#007acc',
		fg: '#fff',
	},
	tsx: {
		bg: '#007acc',
		fg: '#fff',
	},
	java: {
		bg: '#ed8b00',
		fg: '#fff',
	},
	rust: {
		bg: '#dea584',
		fg: '#fff',
	},
	astro: {
		bg: '#ff5a03',
		fg: '#fff',
	},
	toml: {
		bg: '#9c4221',
		fg: '#fff',
	},
};

const langToName: {
	[k: string]: string;
} = {
	typescript: 'ts',
	javascript: 'js',
};

export const remarkCustomCodeBlock: () => Promise<Plugin<any[], Root>> = async () => {
	return () => async (tree) => {
		const codeNodes: Code[] = [];
		visit(tree, 'code', (node) => {
			codeNodes.push(node);
		});

		for (const node of codeNodes) {
			const rawLang = node.lang ?? 'plaintext';
			const metaMatch = parseLangRe.exec(node.meta ?? '');
			if (!metaMatch) {
				return console.warn(
					'Meta section of code fence should match format <file (optional)> <noBadge (true or false, optional)',
				);
			}
			const { file, noBadge = false } = metaMatch.groups as unknown as BlockParams;

			const lang = (() => {
				if (rawLang === 'ts') return 'typescript';
				if (rawLang === 'js') return 'javascript';
				if (rawLang === 'rs') return 'rust';
				return rawLang;
			})();
			let codeHtml = hljs.highlight(node.value, {
				language: lang,
			}).value;
			const html = `
				<div class='code-wrapper ${file ? 'code-with-file-name' : ''}'>
					${file ? `<div class='code-file-name'>${file}</div>` : ''}
					<div style='position:relative'>
					${
						!noBadge
							? `<div
							class='language-badge'
							style='background-color:${langColorMap[lang]?.bg ?? '#888'};color:${langColorMap[lang]?.fg ?? '#fff'}'
						>
							${langToName[lang]?.toUpperCase() ?? lang.toUpperCase()}
						</div>`
							: ''
					}
						<div class='code-block ${lang}'>${codeHtml}</div>
					</div>
				</div>
				`.trim();
			node.value = html;
			(node as any).type = 'html';
			(node as any).children = [];
		}
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
		mdx(),
		robotsTxt({
			sitemap: true,
		}),
		playformCompress(),
	],
	markdown: {
		syntaxHighlight: false,
		remarkPlugins: [await remarkCustomCodeBlock()],
	},
});
