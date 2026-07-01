import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const libraryPath = join(repoRoot, 'src/main/webapp/custom-libraries/cart-process.xml');
const tooltipPath = join(repoRoot, 'src/main/webapp/custom-libraries/tooltips.json');

const expectedEntries = [
  ['leukapheresis', 'Leukapheresis', 'strokeWidth=2'],
  ['cold-chain-shipping', 'Cold Chain Shipping', 'strokeWidth=2'],
  ['thaw', 'Thaw', 'strokeWidth=2'],
  ['t-cell-enrichment', 'T Cell Enrichment', 'shape=process'],
  ['t-cell-activation', 'T Cell Activation', 'strokeWidth=2'],
  ['viral-transduction', 'Viral Transduction', 'strokeWidth=2'],
  ['ex-vivo-expansion', 'Ex vivo Expansion', 'strokeWidth=2'],
  ['formulation', 'Formulation', 'strokeWidth=2'],
  ['drug-product-fill', 'DP Fill', 'strokeWidth=2'],
  ['qc-testing', 'QC Testing', 'shape=process'],
  ['batch-release', 'Batch Release?', 'shape=mxgraph.flowchart.decision'],
  ['cryopreservation', 'Cryopreservation', 'strokeWidth=2'],
  ['infusion', 'Infusion', 'shape=mxgraph.flowchart.terminator']
];

const libraryXml = await readFile(libraryPath, 'utf8');
const libraryJson = libraryXml.match(/<mxlibrary><!\[CDATA\[([\s\S]*)\]\]><\/mxlibrary>/)?.[1];

if (libraryJson == null) {
  throw new Error('CAR-T Process library must be an mxlibrary CDATA document');
}

const entries = JSON.parse(libraryJson);
const tooltipData = JSON.parse(await readFile(tooltipPath, 'utf8'));
const tooltips = tooltipData.cartProcess;

if (entries.length !== expectedEntries.length) {
  throw new Error(`Expected ${expectedEntries.length} CAR-T Process entries, found ${entries.length}`);
}

for (const [id, label, styleFragment] of expectedEntries) {
  const entry = entries.find((candidate) => candidate.id === id);

  if (entry == null) {
    throw new Error(`Missing CAR-T Process entry: ${id}`);
  }

  if (entry.title !== tooltips[id]) {
    throw new Error(`Tooltip mismatch for CAR-T Process entry: ${id}`);
  }

  if (!entry.xml.includes(`value="${label}"`)) {
    throw new Error(`Label mismatch for CAR-T Process entry: ${id}`);
  }

  if (!entry.xml.includes(styleFragment)) {
    throw new Error(`Unexpected ISO shape mapping for CAR-T Process entry: ${id}`);
  }

  if (!entry.xml.includes('<mxGraphModel>') || !entry.xml.includes('vertex="1"')) {
    throw new Error(`Entry is missing draw.io vertex XML: ${id}`);
  }

  if (/fillColor=|strokeColor=|gradientColor=|fontColor=|#[0-9a-fA-F]{3,6}/.test(entry.xml)) {
    throw new Error(`Entry uses explicit colors despite the black-and-white requirement: ${id}`);
  }
}

console.log('CAR-T Process library validation passed');
