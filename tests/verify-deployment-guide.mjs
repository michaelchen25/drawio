import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const guidePath = join(repoRoot, 'docs/deployment-cloudflare-pages.md');
const guide = await readFile(guidePath, 'utf8');

for (const phrase of [
	'Build command: `npm run build`',
	'Build output directory: `src/main/webapp`',
	'BIOMED_PAGES_URL="https://your-project.pages.dev" npm run test:deployed',
	'Cloudflare Access',
	'Zero Trust',
	'Allow policy',
	'identity provider',
	'Open `/admin/`',
	'Open `/help/pptx-export.html`',
	'File -> Save As -> M365',
	'File -> Open From -> M365',
	'redirect URI'
])
{
	if (!guide.includes(phrase))
	{
		throw new Error(`Deployment handoff guide is missing expected content: ${phrase}`);
	}
}

console.log('Deployment handoff guide validation passed');
