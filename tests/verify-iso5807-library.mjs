import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const libraryPath = join(repoRoot, 'src/main/webapp/custom-libraries/iso5807.xml');
const tooltipPath = join(repoRoot, 'src/main/webapp/custom-libraries/tooltips.json');

const expectedIds = [
  'terminator',
  'process',
  'decision',
  'predefined-process',
  'data-io',
  'document',
  'multi-document',
  'stored-data',
  'internal-storage',
  'database',
  'manual-input',
  'manual-operation',
  'display',
  'preparation',
  'connector',
  'off-page-connector',
  'punched-tape',
  'merge-extract',
  'delay'
];

const libraryXml = await readFile(libraryPath, 'utf8');
const libraryJson = libraryXml.match(/<mxlibrary><!\[CDATA\[([\s\S]*)\]\]><\/mxlibrary>/)?.[1];

if (libraryJson == null) {
  throw new Error('ISO 5807 library must be an mxlibrary CDATA document');
}

const entries = JSON.parse(libraryJson);
const tooltipData = JSON.parse(await readFile(tooltipPath, 'utf8'));
const tooltips = tooltipData.iso5807;

if (tooltipData.metadata?.reviewStatus?.iso5807 !== 'ready') {
  throw new Error('ISO 5807 tooltip data must be marked ready');
}

if (tooltipData.metadata?.reviewStatus?.biomed !== 'draft-needs-domain-review') {
  throw new Error('Biomed tooltip data must stay marked as draft until domain review');
}

if (entries.length !== expectedIds.length) {
  throw new Error(`Expected ${expectedIds.length} ISO 5807 entries, found ${entries.length}`);
}

for (const id of expectedIds) {
  const entry = entries.find((candidate) => candidate.id === id);

  if (entry == null) {
    throw new Error(`Missing ISO 5807 entry: ${id}`);
  }

  if (entry.title !== tooltips[id]) {
    throw new Error(`Tooltip mismatch for ISO 5807 entry: ${id}`);
  }

  if (entry.title.length > 140) {
    throw new Error(`Tooltip is too long for sidebar hover use: ${id}`);
  }

  if (!entry.xml.includes('<mxGraphModel>') || !entry.xml.includes('vertex="1"')) {
    throw new Error(`Entry is missing draw.io vertex XML: ${id}`);
  }

  if (/fillColor=|strokeColor=|gradientColor=|fontColor=|#[0-9a-fA-F]{3,6}/.test(entry.xml)) {
    throw new Error(`Entry uses explicit colors despite the black-and-white requirement: ${id}`);
  }
}

for (const section of ['qualitySystem', 'labTemplates', 'antibodyProcess', 'cartProcess']) {
  const values = Object.values(tooltipData[section] || {});

  if (values.length === 0) {
    throw new Error(`Tooltip section is empty: ${section}`);
  }

  for (const tooltip of values) {
    if (typeof tooltip !== 'string' || tooltip.length === 0 || tooltip.length > 140) {
      throw new Error(`Invalid tooltip length in section: ${section}`);
    }
  }
}

console.log('ISO 5807 library validation passed');
