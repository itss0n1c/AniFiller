import { existsSync } from 'node:fs';
import { basename, join } from 'node:path';
import { type Comments, type ShowFull, validate, type Warning } from '$core';
import { paths } from '$utils';

const comments_path = join(paths.meta, 'comments.json');
const warnings_path = join(paths.meta, 'warnings.json');

const out_path = join(paths.dist, 'anifiller.json');
const out_min_path = join(paths.dist, 'anifiller.min.json');

async function save_dist(shows: ShowFull[]) {
	await Bun.write(out_path, JSON.stringify(shows, null, 4));
	await Bun.write(out_min_path, JSON.stringify(shows));
	console.log(`Wrote ${shows.length} shows to ${basename(out_path)} and ${basename(out_min_path)}`);
}

const save_comments = (comments: Comments) => Bun.write(comments_path, JSON.stringify(comments, null, 4));

async function save_readme(shows: ShowFull[]) {
	const path = join(paths.root, 'README.md');
	const exists = existsSync(path);
	const readme_template = await Bun.file(join(paths.root, '.github/README_template.md')).text();
	const readme_content = readme_template.replace('{show_count}', shows.length.toLocaleString('en-US'));
	await Bun.write(path, readme_content);
	console.log(`${exists ? 'Updated' : 'Created'} README.md.`);
}

const { shows, comments } = await validate();

await save_readme(shows);
await save_comments(comments);

await save_dist(shows);
