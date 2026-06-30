import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { once } from 'node:events';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const webRoot = join(repoRoot, 'src/main/webapp');

const requiredFiles = [
  'index.html',
  'js/bootstrap.js',
  'js/main.js',
  'js/app.min.js',
  'styles/grapheditor.css'
];

for (const file of requiredFiles) {
  const filePath = join(webRoot, file);

  if (!existsSync(filePath)) {
    throw new Error(`Missing required web asset: ${file}`);
  }
}

const contentTypes = new Map([
  ['.css', 'text/css'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html'],
  ['.ico', 'image/x-icon'],
  ['.js', 'text/javascript'],
  ['.json', 'application/json'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain']
]);

const server = createServer(async (request, response) => {
  try {
    const requestPath = new URL(request.url ?? '/', 'http://localhost').pathname;
    const relativePath = requestPath === '/' ? '/index.html' : requestPath;
    const filePath = normalize(join(webRoot, relativePath));

    if (!filePath.startsWith(webRoot + sep)) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }

    const fileStat = await stat(filePath);

    if (!fileStat.isFile()) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }

    response.writeHead(200, {
      'Content-Type': contentTypes.get(extname(filePath)) ?? 'application/octet-stream'
    });

    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
});

server.listen(0, '127.0.0.1');
await once(server, 'listening');

const { port } = server.address();
const baseUrl = `http://127.0.0.1:${port}`;

try {
  for (const route of ['/', '/index.html', '/js/bootstrap.js', '/js/main.js', '/js/app.min.js']) {
    const response = await fetch(`${baseUrl}${route}`);

    if (!response.ok) {
      throw new Error(`Smoke request failed for ${route}: ${response.status}`);
    }

    const body = await response.text();

    if (body.length < 100) {
      throw new Error(`Smoke request returned unexpectedly small body for ${route}`);
    }
  }

  console.log(`Static webapp smoke test passed at ${baseUrl}`);
} finally {
  server.close();
}
