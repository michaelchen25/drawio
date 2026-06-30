import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const configPath = join(repoRoot, 'src/main/webapp/staticwebapp.config.json');
const config = JSON.parse(await readFile(configPath, 'utf8'));

if (config.navigationFallback?.rewrite !== '/index.html') {
  throw new Error('Static Web Apps config must rewrite navigation fallback to /index.html');
}

const excludes = config.navigationFallback?.exclude;

if (!Array.isArray(excludes) || excludes.length === 0) {
  throw new Error('Static Web Apps navigation fallback must define asset exclusions');
}

for (const requiredExclude of ['/js/*', '/styles/*', '/custom-config/*']) {
  if (!excludes.includes(requiredExclude)) {
    throw new Error(`Static Web Apps config is missing fallback exclusion: ${requiredExclude}`);
  }
}

if (config.globalHeaders?.['X-Content-Type-Options'] !== 'nosniff') {
  throw new Error('Static Web Apps config must set X-Content-Type-Options');
}

if (config.mimeTypes?.['.drawio'] !== 'application/xml') {
  throw new Error('Static Web Apps config must define .drawio MIME type');
}

console.log('Static Web Apps configuration validation passed');
