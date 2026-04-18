import { get_json } from '$utils';

export const kuroiru_media = (mal_id: number) => get_json<KuroiruRes>(`https://kuroiru.co/api/anime/${mal_id}`);

export interface KuroiruRes {
	title: string;
	title_en: string;
	title_jp: string;
	title_synonyms: string[];
	picture: string;
	info: {
		type: string;
		aired: string;
		airedint: number;
		rating: string;
		score: number;
		member: number;
		synopsis: string;
		rank: number;
		genres: string[];
		tags: string;
		duration: string;
		studios: string[];
		source: string;
		season: string;
	};
	related: {
		Adaptation: Array<{
			mal_id: number;
			type: string;
			name: string;
			info: string;
			img: string;
		}>;
		'Side Story': Array<RelatedItem>;
		Summary: Array<RelatedItem>;
		'Alternative Version': Array<RelatedItem>;
		Character: Array<RelatedItem>;
		Other: Array<RelatedItem>;
	};
	groupID: string;
	op: string[];
	ed: string[];
	themes: {
		slug: string;
		list: Record<string, string>;
	};
	news: Array<{
		title: string;
		link: string;
		time: number;
	}>;
	yt: string;
	al: number;
	links: Array<{
		name: string;
		url: string;
		icon?: string;
	}>;
	episodes: unknown;
	lastep: number;
	schedule: number;
	status: 'Currently Airing' | 'Finished Airing' | 'Not yet aired';
	dub: boolean;
	streams: {
		main: Array<StreamItem>;
		scrap: Array<StreamItem>;
		licensed: Array<StreamItem>;
	};
	col: boolean;
}

type RelatedItem = {
	mal_id: number;
	type: string;
	name: string;
};

type StreamItem = {
	site: string;
	icon: string;
	links: Array<Record<'title' | 'url', string>>;
};
