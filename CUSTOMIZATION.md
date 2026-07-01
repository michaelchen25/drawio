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
- Deployment is handled by Cloudflare Pages native Git integration to avoid a
  duplicate Wrangler deploy job.
- Added workflow structure validation to the project test suite.

### T-104: Cloudflare Pages configuration prep

- Added `src/main/webapp/_headers` and `src/main/webapp/_redirects` for
  Cloudflare Pages.
- Added `docs/deployment-cloudflare-pages.md` with owner-only deployment steps
  and cost guardrails.
- Added automated validation for the Cloudflare Pages config files and optional
  post-deployment smoke-test wiring.
- Configured `npm run build` to run the complete automated test suite before
  Cloudflare Pages publishes `src/main/webapp`.
- No Cloudflare project, DNS record, token, or paid service configuration was
  performed.

### T-104 follow-up: Cloudflare Pages redirects warning

- Removed the catch-all `/index.html` rewrite from
  `src/main/webapp/_redirects` because Cloudflare Pages reports it as an
  infinite-loop redirect.
- Updated the Cloudflare Pages config validation test to reject that catch-all
  rewrite.

### T-110: Custom library loading mechanism

- Updated `src/main/webapp/custom-config/app-config.js` to register custom
  sidebar libraries through draw.io's existing `DRAWIO_CONFIG.libraries`
  mechanism.
- Added a minimal black-and-white test library for validating the loading path
  before adding production ISO 5807 and biomed libraries, then replaced the
  visible sidebar entry with the ISO 5807 library in T-111.
- Extended the custom config test to verify the sidebar library section,
  library URL, preload flag, and library XML payload.

### T-111/T-112: ISO 5807 library and tooltip data

- Added `src/main/webapp/custom-libraries/tooltips.json` with the ISO 5807
  tooltip text from `SHAPE-GUIDE-biomed.md`.
- Added `src/main/webapp/custom-libraries/iso5807.xml` with 19 ISO 5807
  entries using existing draw.io/ISO flowchart shapes only.
- Updated `src/main/webapp/custom-config/app-config.js` so the ISO 5807
  library appears in the sidebar by default.
- Added automated validation for ISO entry count, tooltip coverage, draw.io XML
  payloads, and the no-explicit-color requirement.
- Added `docs/tooltip-review-biomed.md` as the domain-review checklist for
  biomed tooltip drafts, with automated coverage validation to prevent missing
  review rows.

### Deployment pivot: Cloudflare Pages

- Replaced `.github/workflows/azure-static-web-apps.yml` with
  `.github/workflows/cloudflare-pages.yml`.
- Replaced `src/main/webapp/staticwebapp.config.json` with Cloudflare Pages
  `_headers` and `_redirects`.
- Replaced Azure deployment handoff documentation with
  `docs/deployment-cloudflare-pages.md`.
- Updated deployment smoke-test wiring to use `BIOMED_PAGES_URL`.
- No Cloudflare project, DNS record, token, or paid service was created.
