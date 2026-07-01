import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const libraryPath = join(repoRoot, 'src/main/webapp/custom-libraries/antibody-process.xml');
const tooltipPath = join(repoRoot, 'src/main/webapp/custom-libraries/tooltips.json');

const expectedEntries = [
  ['cell-line-development', 'Cell Line Dev', 'shape=process'],
  ['seed-train', 'Seed Train', 'strokeWidth=2'],
  ['bioreactor-culture', 'Bioreactor Culture', 'strokeWidth=2'],
  ['harvest', 'Harvest', 'strokeWidth=2'],
  ['clarification', 'Clarification', 'strokeWidth=2'],
  ['protein-a-capture', 'Protein A Capture', 'shape=process'],
  ['intermediate-polishing-chromatography', 'Intermediate/Polishing', 'shape=process'],
  ['viral-clearance-filtration', 'Viral Clearance', 'shape=process'],
  ['bds-filtration', 'BDS Filtration', 'strokeWidth=2'],
  ['formulation', 'Formulation', 'strokeWidth=2'],
  ['fill-finish', 'Fill-finish', 'strokeWidth=2'],
  ['qc-testing', 'QC Testing', 'shape=process'],
  ['batch-release', 'Batch Release?', 'shape=mxgraph.flowchart.decision'],
  ['cryopreservation', 'Cryopreservation', 'strokeWidth=2'],
  ['cold-chain-shipping', 'Cold Chain Shipping', 'strokeWidth=2']
];

const libraryXml = await readFile(libraryPath, 'utf8');
const libraryJson = libraryXml.match(/<mxlibrary><!\[CDATA\[([\s\S]*)\]\]><\/mxlibrary>/)?.[1];

if (libraryJson == null) {
  throw new Error('Antibody Process library must be an mxlibrary CDATA document');
}

const entries = JSON.parse(libraryJson);
const tooltipData = JSON.parse(await readFile(tooltipPath, 'utf8'));
const tooltips = tooltipData.antibodyProcess;

if (entries.length !== expectedEntries.length) {
  throw new Error(`Expected ${expectedEntries.length} Antibody Process entries, found ${entries.length}`);
}

for (const [id, label, styleFragment] of expectedEntries) {
  const entry = entries.find((candidate) => candidate.id === id);

  if (entry == null) {
    throw new Error(`Missing Antibody Process entry: ${id}`);
  }

  if (entry.title !== tooltips[id]) {
    throw new Error(`Tooltip mismatch for Antibody Process entry: ${id}`);
  }

  if (!entry.xml.includes(`value="${label}"`)) {
    throw new Error(`Label mismatch for Antibody Process entry: ${id}`);
  }

  if (!entry.xml.includes(styleFragment)) {
    throw new Error(`Unexpected ISO shape mapping for Antibody Process entry: ${id}`);
  }

  if (!entry.xml.includes('<mxGraphModel>') || !entry.xml.includes('vertex="1"')) {
    throw new Error(`Entry is missing draw.io vertex XML: ${id}`);
  }

  if (/fillColor=|strokeColor=|gradientColor=|fontColor=|#[0-9a-fA-F]{3,6}/.test(entry.xml)) {
    throw new Error(`Entry uses explicit colors despite the black-and-white requirement: ${id}`);
  }
}

console.log('Antibody Process library validation passed');
