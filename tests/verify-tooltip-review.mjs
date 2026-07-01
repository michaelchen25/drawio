import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const tooltipPath = join(repoRoot, 'src/main/webapp/custom-libraries/tooltips.json');
const reviewPath = join(repoRoot, 'docs/tooltip-review-biomed.md');

const tooltipData = JSON.parse(await readFile(tooltipPath, 'utf8'));
const reviewDoc = await readFile(reviewPath, 'utf8');

if (tooltipData.metadata?.reviewStatus?.biomed !== 'draft-needs-domain-review') {
  throw new Error('Biomed tooltips must remain marked draft until domain review is complete');
}

if (!reviewDoc.includes('draft-needs-domain-review')) {
  throw new Error('Biomed tooltip review document must show the draft review status');
}

for (const section of ['qualitySystem', 'labTemplates', 'antibodyProcess', 'cartProcess']) {
  const sectionData = tooltipData[section] || {};

  for (const [id, tooltip] of Object.entries(sectionData)) {
    if (!reviewDoc.includes(`| ${id} |`)) {
      throw new Error(`Tooltip review document is missing id: ${id}`);
    }

    if (!reviewDoc.includes(tooltip)) {
      throw new Error(`Tooltip review document is missing tooltip text for: ${id}`);
    }
  }
}

console.log('Biomed tooltip review document validation passed');
