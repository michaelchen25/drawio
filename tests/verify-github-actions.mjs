import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const workflowPath = join(repoRoot, '.github/workflows/cloudflare-pages.yml');
const workflow = await readFile(workflowPath, 'utf8');

const requiredSnippets = [
  'name: Cloudflare Pages CI/CD',
  'branches:',
  '- dev',
  'Validate static app',
  'npm test',
  'cloudflare/wrangler-action@v3',
  'pages deploy src/main/webapp',
  'CLOUDFLARE_API_TOKEN',
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_PAGES_PROJECT_NAME'
];

for (const snippet of requiredSnippets) {
  if (!workflow.includes(snippet)) {
    throw new Error(`Workflow is missing required snippet: ${snippet}`);
  }
}

if (!/needs:\s*validate/.test(workflow)) {
  throw new Error('Deploy job must depend on validate job');
}

if (!/if:\s*github\.event_name == 'push'/.test(workflow)) {
  throw new Error('Deploy job must be limited to push events');
}

if (!/if:\s*env\.CLOUDFLARE_API_TOKEN != ''/.test(workflow)) {
  throw new Error('Deploy step must require the Cloudflare API token');
}

if (!workflow.includes('skipping deployment')) {
  throw new Error('Workflow must explicitly skip deployment until Cloudflare settings are configured');
}

console.log('GitHub Actions workflow validation passed');
