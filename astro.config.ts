import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import robotsTxt from 'astro-robots-txt';

// plugin in separate file don't work 🤷
import { type Plugin } from 'unified';
import { type Code, type Root } from 'mdast';
import { visit } from 'unist-util-visit';
import playformCompress from '@playform/compress';
import hljs from 'highlight.js';
import { JSDOM } from 'jsdom';
import child_process from 'node:child_process';
const spawn = child_process.spawn;

type BlockParams = {
	file?: string;
	noBadge?: boolean;
	topLevel?: boolean;
};

const BLUE_KEYWORDS = [
	'let',
	'const',
	'type',
	'struct',
	'enum',
	'interface',
	'trait',
	'class',
	'function',
];

const parseLangRe =
	/(?=(?:file=(?<file>\S*))?)(?=(?:noBadge=(?<noBadge>true|false))?)(?=(?:topLevel=(?<topLevel>true|false))?)/g;
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

const highlightRust = async (rustCode: string, topLevel: boolean): Promise<string> => {
	console.log('highlighting rust...');
	const child = spawn(
		process.env.RUST_ANALYZER ||
			'/Users/isaiahgamble/Documents/GitHub/rust-analyzer/target/release/rust-analyzer',
		['highlight', '--no-wrap-spans', '--no-style'],
		{
			stdio: 'pipe',
		},
	);

	await new Promise((res, rej) =>
		child.stdin.write(topLevel ? rustCode : `{${rustCode}}`, (err) => {
			if (err) rej(err);
			else res(undefined);
		}),
	);
	await new Promise((res) => child.stdin.end(res));

	return new Promise<string>((res) => {
		let inputString = '';

		child.stdout.setEncoding('utf8'); // Ensure data is treated as UTF-8 characters

		child.stdout.on('data', (chunk) => {
			inputString += chunk; // Append each data chunk to the string
		});

		child.stdout.on('end', () => {
			// All data has been received, 'inputString' now contains the complete stdin content
			res(
				topLevel
					? inputString
					: inputString.slice(
							'<span class="brace">}</span>'.length,
							inputString.length - 1 - '<span class="brace">}</span>'.length,
						),
			);
		});
	});
};

/** Apply highlight.js to code blocks */
const remarkCustomCodeBlock: () => Plugin<any[], Root> = () => {
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
			const {
				file,
				noBadge = false,
				topLevel = false,
			} = metaMatch.groups as unknown as BlockParams;

			const lang = (() => {
				if (rawLang === 'ts') return 'typescript';
				if (rawLang === 'js') return 'javascript';
				if (rawLang === 'rs') return 'rust';
				return rawLang;
			})();
			let codeHtml;
			if (lang === 'rust') {
				codeHtml = await highlightRust(node.value, topLevel);
			} else {
				codeHtml = hljs.highlight(node.value, {
					language: lang,
				}).value;
			}

			const dom = new JSDOM(codeHtml);

			dom.window.document.querySelectorAll('span').forEach((span) => {
				if (
					(span.className === 'hljs-keyword' ||
						span.className === 'hljs-name' ||
						span.className === 'hljs-punctuation' ||
						span.className.includes('keyword')) &&
					span.textContent !== null
				) {
					if (
						BLUE_KEYWORDS.includes(span.textContent) &&
						span.className !== 'hljs-name'
					) {
						span.classList.add('blue-keyword');
					} else if (span.textContent === 'self' || span.textContent === 'Self') {
						span.classList.add('green-keyword');
					} else {
						span.classList.add('bold-keyword');
					}
				}
			});

			const finalHtml = `
				<div class='code-wrapper'>
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
						<div class='code-block ${file ? 'code-with-file-name' : ''} ${lang}'>${dom.serialize()}</div>
					</div>
				</div>
				`.trim();
			node.value = finalHtml;
			(node as any).type = 'html';
			(node as any).children = [];
		}
	};
};

/** Convert external links to target=_blank */
const mdLinksTargetBlank = (): Plugin<any[], Root> => {
	return () => (tree) => {
		visit(tree, 'link', (node) => {
			if (
				node.url.startsWith('http') &&
				node.children.length === 1 &&
				node.children[0].type === 'text'
			) {
				const href = node.url;
				const text = node.children[0].value;
				(node as any).type = 'html';
				(node as any).value = `<a href="${href}" target="_blank">${text}</a>`;
				(node as any).children = [];
			}
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
		mdx(),
		robotsTxt({
			sitemap: true,
		}),
		playformCompress({
			Exclude: '.*\.html',
		}),
	],
	markdown: {
		syntaxHighlight: false,
		remarkPlugins: [remarkCustomCodeBlock(), mdLinksTargetBlank()],
	},
});
