import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);

const guides = [
	{
		path: join(repoRoot, 'docs/user-guide-pptx.md'),
		requiredPhrases: [
			'File -> Export as -> SVG',
			'Convert to Shape',
			'does not provide one-click PPTX export',
			'PowerPoint on the web'
		]
	},
	{
		path: join(repoRoot, 'docs/user-guide-onedrive-sharing.md'),
		requiredPhrases: [
			'File -> Save As',
			'M365',
			'OneDrive for Business',
			'shared folders'
		]
	},
	{
		path: join(repoRoot, 'docs/user-guide-mermaid.md'),
		requiredPhrases: [
			'Insert -> Mermaid',
			'editable draw.io cells',
			'biomed sidebar libraries',
			'.drawio'
		]
	}
];

for (const guide of guides)
{
	const text = await readFile(guide.path, 'utf8');

	for (const phrase of guide.requiredPhrases)
	{
		if (!text.includes(phrase))
		{
			throw new Error(`Missing expected guide phrase "${phrase}" in ${guide.path}`);
		}
	}
}

console.log('User guide validation passed');
