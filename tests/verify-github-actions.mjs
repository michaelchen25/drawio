import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const workflowPath = join(repoRoot, '.github/workflows/azure-static-web-apps.yml');
const workflow = await readFile(workflowPath, 'utf8');

const requiredSnippets = [
  'name: Azure Static Web Apps CI/CD',
  'branches:',
  '- dev',
  'Validate static app',
  'npm test',
  'Azure/static-web-apps-deploy@v1',
  'app_location: src/main/webapp',
  'skip_app_build: true',
  'AZURE_STATIC_WEB_APPS_API_TOKEN'
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

console.log('GitHub Actions workflow validation passed');
