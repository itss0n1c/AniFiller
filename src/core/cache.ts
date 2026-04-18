import { existsSync } from 'node:fs';
import { type } from 'arktype';
import { type KuroiruRes, kuroiru_media } from '$core/kuroiru';
import { join, paths, wait } from '$utils';
import type { ShowFull } from './base';
import { shows_collect } from './shows';

const schema_cache_item = type({
	mal_id: 'number',
	anilist_id: 'number',
	episode_count: 'number',
	status: type.enumerated('currently_airing', 'finished_airing', 'not_yet_aired'),
});
export type CacheItem = typeof schema_cache_item.infer;
export const schema_cache = schema_cache_item.array();

const cache_path = join(paths.meta, 'cache', 'shows.json');

export async function cache_list(shows: ShowFull[]) {
	console.log();
	console.log(`Checking cache for ${shows.length} shows...`);
	const all_mal_ids = shows.map((s) => s.mappings.mal_id).filter((x) => x !== null);
	const cache = await _get_cache();
	const mal_ids = all_mal_ids.filter((x) => !cache.some((c) => c.mal_id === x && c.status === 'finished_airing'));

	for (let i = 0; i < mal_ids.length; i++) {
		const x = mal_ids[i];
		const media = shows.find((s) => s.mappings.mal_id === x);
		if (!media) continue;
		const existingIndex = cache.findIndex((c) => c.mal_id === x);
		const existing = existingIndex !== -1;
		const res = await kuroiru_media(x);
		const item = schema_cache_item.assert({
			mal_id: x,
			anilist_id: _int_or_null(res.al) ?? -1,
			episode_count: res.lastep,
			status: _format_status(res.status),
		});
		if (!existing) cache.push(item);
		else cache[existingIndex] = item;
		await Bun.write(cache_path, JSON.stringify(cache, null, 4));
		console.log(`${i + 1}/${mal_ids.length} ${existing ? 'updated' : 'added'} cache for [${x}] ${media.title}`);
		await wait(500);
	}

	console.log(`cache updated for ${mal_ids.length} shows\n`);
	return cache;
}

const _get_cache = async () => schema_cache.assert(existsSync(cache_path) ? await Bun.file(cache_path).json() : []);

function _int_or_null(x: unknown) {
	if (typeof x === 'number') return x;
	if (typeof x === 'string') {
		const parsed = Number.parseInt(x, 10);
		if (!Number.isNaN(parsed)) return parsed;
	}
	return null;
}

function _format_status(status: KuroiruRes['status']): CacheItem['status'] {
	if (status === 'Currently Airing') return 'currently_airing';
	if (status === 'Finished Airing') return 'finished_airing';
	if (status === 'Not yet aired') return 'not_yet_aired';
	throw new Error(`unknown status: ${status}`);
}

if (import.meta.main)
	await shows_collect()
		.then((x) => x.shows)
		.then(cache_list);
