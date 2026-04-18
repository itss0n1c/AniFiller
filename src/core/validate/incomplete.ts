import { cache_list } from '$core/cache';
import { type ShowFull, schema_warning, type Warning } from '../base';

export async function _validate_shows(shows: ShowFull[]) {
	const warnings: Warning[] = [];
	const cache = await cache_list(shows);

	for (const show of shows) {
		const mal_id = show.mappings.mal_id;
		if (mal_id === null) continue;
		const cache_item = cache.find((c) => c.mal_id === mal_id);
		if (!cache_item) throw new Error(`missing cache item for mal_id ${mal_id} (${show.title})`);

		if (cache_item.episode_count > show.episodes.length)
			warnings.push(
				schema_warning.assert({
					mal_id,
					slug: show.slug,
					warning_type: 'episodes-missing',
					total_count: cache_item.episode_count,
					current_count: show.episodes.length,
				}),
			);
		if (cache_item.anilist_id !== -1 && cache_item.anilist_id !== show.mappings.anilist_id)
			warnings.push(
				schema_warning.assert({
					mal_id,
					slug: show.slug,
					warning_type: 'mapping-mismatch',
					mapping: { anilist_id: cache_item.anilist_id },
				}),
			);
	}

	return warnings;
}
