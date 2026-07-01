const baseUrl = process.env.BIOMED_PAGES_URL;

if (!baseUrl) {
  throw new Error('Set BIOMED_PAGES_URL to the deployed Cloudflare Pages URL');
}

const checks = [
  {
    path: '/',
    includes: ['draw.io']
  },
  {
    path: '/index.html',
    includes: ['draw.io']
  },
  {
    path: '/js/bootstrap.js',
    includes: ['GraphViewer']
  },
  {
    path: '/custom-config/app-config.js',
    includes: ['custom-config/export-pptx-hint.js', 'custom-config/auth-msal.js']
  },
  {
    path: '/admin/',
    includes: ['Admin Dashboard', 'Library Registry', 'Entra Group Mapping']
  },
  {
    path: '/admin/index.html',
    includes: ['Admin Dashboard', 'Usage Tracking']
  },
  {
    path: '/help/pptx-export.html',
    includes: ['PPTX Manual Conversion Guide', 'Convert to Shape']
  }
];

for (const check of checks) {
  const path = check.path;
  const response = await fetch(new URL(path, baseUrl));

  if (!response.ok) {
    throw new Error(`Deployment smoke test failed for ${path}: ${response.status}`);
  }

  const body = await response.text();

  if (body.length < 20) {
    throw new Error(`Deployment smoke test returned an unexpectedly small body for ${path}`);
  }

  for (const phrase of check.includes) {
    if (!body.includes(phrase)) {
      throw new Error(`Deployment smoke test did not find expected content "${phrase}" in ${path}`);
    }
  }
}

console.log(`Deployment smoke test passed for ${baseUrl}`);
