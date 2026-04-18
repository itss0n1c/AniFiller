import { shows_collect } from '$core/shows';
import { join, paths } from '$utils';
import { AniFillerError, type ShowFull, type Warning } from '../base';
import { _validate_shows } from './incomplete';

const warnings_path = join(paths.meta, 'warnings.json');
const save_warnings = (warnings: Warning[]) => Bun.write(warnings_path, JSON.stringify(warnings, null, 4));

export async function validate() {
	const { shows, comments } = await shows_collect();
	await _validate_episodes(shows);
	const warnings = await _validate_shows(shows);
	await save_warnings(warnings);

	console.log(`Successfully validated ${shows.length} shows!`);

	return { shows, comments };
}

async function _validate_episodes(shows: ShowFull[]) {
	for (const show of shows) {
		const seen_episodes = new Set<number>();
		let previous_episode = show.episodes[0];
		for (const ep of show.episodes) {
			if (seen_episodes.has(ep.episode))
				throw new AniFillerError(
					`Duplicate episode number ${ep.episode} found in show ${show.title}`,
					show.slug,
				);

			if (
				ep !== previous_episode &&
				!ep.override_date &&
				!previous_episode.override_date &&
				ep.aired_date < previous_episode.aired_date
			) {
				console.log({ ep, previous_episode });
				throw new AniFillerError(
					`Episode ${ep.episode} has aired_date ${ep.aired_date}, which is earlier than episode ${previous_episode.episode}'s aired_date ${previous_episode.aired_date}`,
					show.slug,
				);
			}

			seen_episodes.add(ep.episode);
			previous_episode = ep;
		}
		const max_episode = Math.max(...seen_episodes);
		for (let i = 1; i <= max_episode; i++) {
			if (!seen_episodes.has(i))
				throw new AniFillerError(`Missing episode number ${i} in show ${show.title}`, show.slug);
		}
	}
}

if (import.meta.main) await validate();
