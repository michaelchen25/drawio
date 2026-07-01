import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const libraryPath = join(repoRoot, 'src/main/webapp/custom-libraries/lab-templates.xml');
const tooltipPath = join(repoRoot, 'src/main/webapp/custom-libraries/tooltips.json');

const expectedTemplates = [
  {
    id: 'flow-cytometry',
    nodes: [
      ['取得細胞懸浮液', 'shape=mxgraph.flowchart.terminator'],
      ['孵育（避光 30 分鐘）', 'shape=mxgraph.flowchart.delay'],
      ['事件數足夠？', 'shape=mxgraph.flowchart.decision'],
      ['螢幕檢視 gating', 'shape=mxgraph.flowchart.display'],
      ['匯出 FCS 檔/分析報告', 'shape=mxgraph.flowchart.document2']
    ]
  },
  {
    id: 'western-blot',
    nodes: [
      ['樣品裂解', 'shape=mxgraph.flowchart.terminator'],
      ['手動輸入上樣量', 'shape=manualInput'],
      ['孵育過夜（4°C）', 'shape=mxgraph.flowchart.delay'],
      ['條帶清晰？', 'shape=mxgraph.flowchart.decision'],
      ['影像存檔/定量報告', 'shape=mxgraph.flowchart.document2']
    ]
  },
  {
    id: 't-cell-cytotoxicity',
    nodes: [
      ['準備效應與標靶細胞', 'shape=mxgraph.flowchart.terminator'],
      ['設定 E:T 比例', 'shape=hexagon'],
      ['孵育（4-24 小時）', 'shape=mxgraph.flowchart.delay'],
      ['毒殺率達閾值？', 'shape=mxgraph.flowchart.decision'],
      ['結果記錄', 'shape=mxgraph.flowchart.document2']
    ]
  },
  {
    id: 'elisa',
    nodes: [
      ['包被抗原/抗體', 'shape=mxgraph.flowchart.terminator'],
      ['孵育', 'shape=mxgraph.flowchart.delay'],
      ['讀盤（OD 值）', 'strokeWidth=2'],
      ['標準曲線 R² 合格？', 'shape=mxgraph.flowchart.decision'],
      ['濃度結果報告', 'shape=mxgraph.flowchart.document2']
    ]
  },
  {
    id: 'gene-cloning',
    nodes: [
      ['PCR 擴增目標片段', 'shape=mxgraph.flowchart.terminator'],
      ['培養過夜（37°C）', 'shape=mxgraph.flowchart.delay'],
      ['挑選菌落', 'shape=trapezoid'],
      ['序列正確？', 'shape=mxgraph.flowchart.decision'],
      ['質體圖譜/定序紀錄', 'shape=mxgraph.flowchart.document2']
    ]
  },
  {
    id: 'transfection-transduction',
    nodes: [
      ['細胞鋪盤', 'shape=mxgraph.flowchart.terminator'],
      ['準備複合物/病毒', 'shape=hexagon'],
      ['孵育表現', 'shape=mxgraph.flowchart.delay'],
      ['效率達標？', 'shape=mxgraph.flowchart.decision'],
      ['結果紀錄', 'shape=mxgraph.flowchart.document2']
    ]
  },
  {
    id: 'protein-purification',
    nodes: [
      ['細胞裂解上清', 'shape=mxgraph.flowchart.terminator'],
      ['親和層析', 'shape=process'],
      ['純度合格？', 'shape=mxgraph.flowchart.decision'],
      ['濃度測定', 'strokeWidth=2'],
      ['純化紀錄/QC 報告', 'shape=mxgraph.flowchart.document2']
    ]
  }
];

const libraryXml = await readFile(libraryPath, 'utf8');
const libraryJson = libraryXml.match(/<mxlibrary><!\[CDATA\[([\s\S]*)\]\]><\/mxlibrary>/)?.[1];

if (libraryJson == null) {
  throw new Error('Lab Templates library must be an mxlibrary CDATA document');
}

const entries = JSON.parse(libraryJson);
const tooltipData = JSON.parse(await readFile(tooltipPath, 'utf8'));
const tooltips = tooltipData.labTemplates;

if (entries.length !== expectedTemplates.length) {
  throw new Error(`Expected ${expectedTemplates.length} Lab Template entries, found ${entries.length}`);
}

for (const expected of expectedTemplates) {
  const entry = entries.find((candidate) => candidate.id === expected.id);

  if (entry == null) {
    throw new Error(`Missing Lab Template entry: ${expected.id}`);
  }

  if (entry.title !== tooltips[expected.id]) {
    throw new Error(`Tooltip mismatch for Lab Template entry: ${expected.id}`);
  }

  if (!entry.xml.includes('<mxGraphModel>')) {
    throw new Error(`Template is missing draw.io XML: ${expected.id}`);
  }

  if (/fillColor=|strokeColor=|gradientColor=|fontColor=|#[0-9a-fA-F]{3,6}/.test(entry.xml)) {
    throw new Error(`Template uses explicit colors despite the black-and-white requirement: ${expected.id}`);
  }

  const vertexCount = (entry.xml.match(/vertex="1"/g) || []).length;

  if (vertexCount < 7) {
    throw new Error(`Template does not include enough workflow nodes: ${expected.id}`);
  }

  for (const [label, styleFragment] of expected.nodes) {
    if (!entry.xml.includes(`value="${label}"`)) {
      throw new Error(`Template is missing expected node label: ${expected.id} / ${label}`);
    }

    if (!entry.xml.includes(styleFragment)) {
      throw new Error(`Template is missing expected ISO shape style: ${expected.id} / ${label}`);
    }
  }
}

console.log('Lab Templates library validation passed');
