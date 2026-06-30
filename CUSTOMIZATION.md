# biomed-flowchart-editor Customization Log

This file records every project-specific change made on top of the upstream
`jgraph/drawio` fork.

## Principles

- Keep draw.io editor core logic unchanged.
- Place custom behavior in add-on layers such as `custom-config/`,
  `custom-libraries/`, deployment configuration, tests, and documentation.
- Record every touched upstream entry point here before completing a task.

## Change Log

### T-101: Fork and local baseline

- Cloned `https://github.com/michaelchen25/drawio` locally.
- Added `upstream` remote pointing to `https://github.com/jgraph/drawio.git`.
- Added this customization log.
- Added project-level npm smoke-test scripts for the static webapp baseline.
- No draw.io editor core files were modified.

### T-102: Custom configuration entry point

- Added `src/main/webapp/custom-config/app-config.js` as the project-owned
  configuration module.
- Updated `src/main/webapp/js/PreConfig.js` to load the custom configuration
  module through draw.io's existing pre-configuration entry point.
- Added an automated test that verifies `PreConfig.js` loads the custom module
  and that the module sets the expected project namespace.

### T-103: GitHub Actions CI/CD

- Added `.github/workflows/cloudflare-pages.yml`.
- The `validate` job runs automated tests on pushes and pull requests to `dev`.
- The `deploy` job uploads `src/main/webapp` to Cloudflare Pages only when
  Cloudflare deployment settings are present.
- Added workflow structure validation to the project test suite.

### T-104: Cloudflare Pages configuration prep

- Added `src/main/webapp/_headers` and `src/main/webapp/_redirects` for
  Cloudflare Pages.
- Added `docs/deployment-cloudflare-pages.md` with owner-only deployment steps
  and cost guardrails.
- Added automated validation for the Cloudflare Pages config files and optional
  post-deployment smoke-test wiring.
- No Cloudflare project, DNS record, token, or paid service configuration was
  performed.

### Deployment pivot: Cloudflare Pages

- Replaced `.github/workflows/azure-static-web-apps.yml` with
  `.github/workflows/cloudflare-pages.yml`.
- Replaced `src/main/webapp/staticwebapp.config.json` with Cloudflare Pages
  `_headers` and `_redirects`.
- Replaced Azure deployment handoff documentation with
  `docs/deployment-cloudflare-pages.md`.
- Updated deployment smoke-test wiring to use `BIOMED_PAGES_URL`.
- No Cloudflare project, DNS record, token, or paid service was created.
