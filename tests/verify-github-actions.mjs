import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const workflowPath = join(repoRoot, '.github/workflows/cloudflare-pages.yml');
const workflow = await readFile(workflowPath, 'utf8');

const requiredSnippets = [
  'name: Cloudflare Pages CI',
  'branches:',
  '- dev',
  'Validate static app',
  'npm test'
];

for (const snippet of requiredSnippets) {
  if (!workflow.includes(snippet)) {
    throw new Error(`Workflow is missing required snippet: ${snippet}`);
  }
}

for (const forbiddenSnippet of [
  'cloudflare/wrangler-action',
  'pages deploy',
  'CLOUDFLARE_API_TOKEN',
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_PAGES_PROJECT_NAME'
]) {
  if (workflow.includes(forbiddenSnippet)) {
    throw new Error(`Workflow must not run duplicate Wrangler deployment when Cloudflare Pages Git integration is enabled: ${forbiddenSnippet}`);
  }
}

if (/^\s*deploy:/m.test(workflow)) {
  throw new Error('GitHub Actions workflow must not define a deploy job; Cloudflare Pages handles deployment from the connected Git repository');
}

console.log('GitHub Actions workflow validation passed');
