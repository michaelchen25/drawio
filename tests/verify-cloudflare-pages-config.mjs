import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const webRoot = join(repoRoot, 'src/main/webapp');

const headers = await readFile(join(webRoot, '_headers'), 'utf8');
const redirects = await readFile(join(webRoot, '_redirects'), 'utf8');

for (const requiredHeader of [
  'Referrer-Policy: strict-origin-when-cross-origin',
  'X-Content-Type-Options: nosniff',
  '/custom-config/*',
  '/custom-libraries/*',
  'Cache-Control: no-cache'
]) {
  if (!headers.includes(requiredHeader)) {
    throw new Error(`Cloudflare _headers is missing: ${requiredHeader}`);
  }
}

if (!redirects.split(/\r?\n/).some((line) => line.trim() === '/* /index.html 200')) {
  throw new Error('Cloudflare _redirects must define SPA fallback: /* /index.html 200');
}

console.log('Cloudflare Pages configuration validation passed');
