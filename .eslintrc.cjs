/* eslint-disable no-undef */
module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 12, //latest version of ES
		tsconfigRootDir: __dirname,
	},
	extends: [
		'eslint:recommended',
		'plugin:astro/recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:prettier/recommended',
		'prettier',
	],
	plugins: ['@typescript-eslint', 'prettier'],
	rules: {
		'react/display-name': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-empty-interface': 'off',
		'@typescript-eslint/no-unnecessary-type-constraint': 'off',
		'react/no-unescaped-entities': 'off',
		'react-hooks/exhaustive-deps': 'off',
		'no-constant-condition': 'off',
		'@typescript-eslint/ban-types': 'off',
		'@typescript-eslint/no-non-null-assertion': 'off',
		quotes: 'off',
		'@typescript-eslint/quotes': [
			0,
			'single',
			{
				avoidEscape: true,
			},
		],
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		indent: 'off',
		'prettier/prettier': [
			'error',
			{
				semi: true,
				trailingComma: 'all',
				endOfLine: 'auto',
				printWidth: 100,
				tabWidth: 4,
				useTabs: true,
				bracketSpacing: true,
				singleQuote: true,
				jsxSingleQuote: true,
			},
		],
	},
	overrides: [
		{
			// Define the configuration for `.astro` file.
			files: ['*.astro'],
			// Allows Astro components to be parsed.
			parser: 'astro-eslint-parser',
			// Parse the script in `.astro` as TypeScript by adding the following configuration.
			// It's the setting you need when using TypeScript.
			parserOptions: {
				parser: '@typescript-eslint/parser',
				extraFileExtensions: ['.astro'],
			},
			rules: {
				// override/add rules settings here, such as:
				// "astro/no-set-html-directive": "error"
			},
		},
		// ...
	],
};
