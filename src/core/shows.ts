import { readdir } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { paths } from '$utils';
import { AniFillerError, type Comments, type ShowFull, schema_show_full, show } from './base';

export async function shows_collect() {
	const files = await _get_files();
	const shows: ShowFull[] = [];
	const comments: Comments = {};

	for (const file of files) {
		if (!file.endsWith('.json')) continue;
		const slug = basename(file, '.json');
		let mod: { default: ReturnType<JSON['parse']> };
		try {
			mod = await import(`${join(paths.shows, file)}`);
		} catch (e) {
			throw new Error(`Failed to import file ${file}: ${(e as Error).message}`);
		}
		const data = mod.default;
		if (!('$schema' in data)) throw new Error(`File ${file} does not have a $schema property`);
		delete data.$schema;

		const x = show(data, slug);
		if (x.comments) comments[slug] = x.comments;

		const existing = shows.find(
			(s) => s.mappings.anilist_id === x.mappings.anilist_id || s.mappings.mal_id === x.mappings.mal_id,
		);
		if (existing)
			throw new AniFillerError(
				`Duplicate mapping found in file ${file} for show ${x.title} (Anilist ID: ${x.mappings.anilist_id}, MAL ID: ${x.mappings.mal_id})`,
				slug,
			);
		const first_ep = x.episodes[0];
		if (first_ep.episode !== 1)
			throw new AniFillerError(
				`First episode is not episode 1. Found episode ${first_ep.episode} instead.`,
				slug,
			);

		shows.push(
			schema_show_full.assert({
				slug,
				title: x.title,
				mappings: {
					anilist_id: x.mappings.anilist_id,
					mal_id: x.mappings.mal_id,
				},
				episodes: x.episodes.map((e) => ({
					episode: e.episode,
					title: e.title,
					type: e.type,
					aired_date: e.aired_date,
					...(e.override_date ? { override_date: e.override_date } : {}),
				})),
			}),
		);
	}
	return { shows, comments };
}

async function _get_files() {
	console.log(`Reading shows from ${paths.shows}...`);
	await Bun.$`bun check --fix ${paths.shows}/*.json`.quiet();
	return readdir(paths.shows).then((x) =>
		x.toSorted((a, b) => {
			const a_name = basename(a, '.json');
			const b_name = basename(b, '.json');
			return a_name.localeCompare(b_name);
		}),
	);
}
