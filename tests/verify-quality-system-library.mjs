import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const libraryPath = join(repoRoot, 'src/main/webapp/custom-libraries/quality-system.xml');
const tooltipPath = join(repoRoot, 'src/main/webapp/custom-libraries/tooltips.json');

const expectedEntries = [
  {
    id: 'change-control-impact',
    label: 'Change Impact?',
    styleIncludes: 'shape=mxgraph.flowchart.decision'
  },
  {
    id: 'change-control-review',
    label: 'Change Review SOP',
    styleIncludes: 'shape=process'
  },
  {
    id: 'deviation-investigation',
    label: 'Deviation Investigation',
    styleIncludes: 'shape=process'
  },
  {
    id: 'capa',
    label: 'CAPA',
    styleIncludes: 'shape=process'
  },
  {
    id: 'oos-oot-investigation',
    label: 'OOS/OOT Investigation',
    styleIncludes: 'shape=process'
  },
  {
    id: 'risk-high',
    label: 'High Risk?',
    styleIncludes: 'shape=mxgraph.flowchart.decision'
  },
  {
    id: 'qa-approval',
    label: 'QA/QP Approved?',
    styleIncludes: 'shape=mxgraph.flowchart.decision'
  },
  {
    id: 'qp-release-signature',
    label: 'QP Release Signature',
    styleIncludes: 'shape=trapezoid'
  },
  {
    id: 'document-control',
    label: 'Document Control',
    styleIncludes: 'shape=process'
  },
  {
    id: 'record-archive',
    label: 'Record Archive',
    styleIncludes: 'shape=mxgraph.flowchart.stored_data'
  }
];

const libraryXml = await readFile(libraryPath, 'utf8');
const libraryJson = libraryXml.match(/<mxlibrary><!\[CDATA\[([\s\S]*)\]\]><\/mxlibrary>/)?.[1];

if (libraryJson == null) {
  throw new Error('Quality System library must be an mxlibrary CDATA document');
}

const entries = JSON.parse(libraryJson);
const tooltipData = JSON.parse(await readFile(tooltipPath, 'utf8'));
const tooltips = tooltipData.qualitySystem;

if (entries.length !== expectedEntries.length) {
  throw new Error(`Expected ${expectedEntries.length} Quality System entries, found ${entries.length}`);
}

for (const expected of expectedEntries) {
  const entry = entries.find((candidate) => candidate.id === expected.id);

  if (entry == null) {
    throw new Error(`Missing Quality System entry: ${expected.id}`);
  }

  if (entry.title !== tooltips[expected.id]) {
    throw new Error(`Tooltip mismatch for Quality System entry: ${expected.id}`);
  }

  if (!entry.xml.includes(`value="${expected.label}"`)) {
    throw new Error(`Label mismatch for Quality System entry: ${expected.id}`);
  }

  if (!entry.xml.includes(expected.styleIncludes)) {
    throw new Error(`Unexpected ISO shape mapping for Quality System entry: ${expected.id}`);
  }

  if (!entry.xml.includes('<mxGraphModel>') || !entry.xml.includes('vertex="1"')) {
    throw new Error(`Entry is missing draw.io vertex XML: ${expected.id}`);
  }

  if (/fillColor=|strokeColor=|gradientColor=|fontColor=|#[0-9a-fA-F]{3,6}/.test(entry.xml)) {
    throw new Error(`Entry uses explicit colors despite the black-and-white requirement: ${expected.id}`);
  }
}

console.log('Quality System library validation passed');
