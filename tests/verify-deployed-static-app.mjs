const baseUrl = process.env.BIOMED_PAGES_URL;

if (!baseUrl) {
  throw new Error('Set BIOMED_PAGES_URL to the deployed Cloudflare Pages URL');
}

for (const path of ['/', '/index.html', '/js/bootstrap.js', '/custom-config/app-config.js']) {
  const response = await fetch(new URL(path, baseUrl));

  if (!response.ok) {
    throw new Error(`Deployment smoke test failed for ${path}: ${response.status}`);
  }

  const body = await response.text();

  if (body.length < 20) {
    throw new Error(`Deployment smoke test returned an unexpectedly small body for ${path}`);
  }
}

console.log(`Deployment smoke test passed for ${baseUrl}`);
