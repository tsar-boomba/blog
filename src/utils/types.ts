export type PostFrontmatter = {
	title: string;
	summary: string;
	author: string;
	publishDate: string;
	tags: string[];
	editDate?: string;
	published?: false;
	noCode?: true;
};

export type PrimaryShades =
	| 100
	| 200
	| 300
	| 400
	| 500
	| 600
	| 700
	| 800
	| 900
	| 1000
	| 1100
	| 1200;
