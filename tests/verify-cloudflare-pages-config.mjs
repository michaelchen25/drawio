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

const redirectRules = redirects
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line !== '' && !line.startsWith('#'));

for (const rule of redirectRules) {
  if (/^\/\*\s+\/index\.html\s+200(?:\s|$)/.test(rule)) {
    throw new Error('Cloudflare _redirects must not define a catch-all /index.html rewrite; Cloudflare treats it as an infinite loop');
  }
}

console.log('Cloudflare Pages configuration validation passed');
