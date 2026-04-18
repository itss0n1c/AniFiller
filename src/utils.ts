import { join } from 'node:path';

const root = join(import.meta.path, '../..');
export const paths = {
	root,
	dist: join(root, 'dist'),
	shows: join(root, 'data', 'shows'),
	meta: join(root, 'data', 'meta'),
	github: join(root, 'github'),
};

export async function get_json<T>(url: string, opts?: RequestInit) {
	const res = await fetch(url, opts);
	if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
	return res.json() as Promise<T>;
}

export { setTimeout as wait } from 'node:timers/promises';
export { join };
