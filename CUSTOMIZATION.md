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
- Marked the biomed tooltip set ready for MVP use after project owner review
  on 2026-07-01; future wording refinements can remain content-only updates.

### Deployment pivot: Cloudflare Pages

- Replaced `.github/workflows/azure-static-web-apps.yml` with
  `.github/workflows/cloudflare-pages.yml`.
- Replaced `src/main/webapp/staticwebapp.config.json` with Cloudflare Pages
  `_headers` and `_redirects`.
- Replaced Azure deployment handoff documentation with
  `docs/deployment-cloudflare-pages.md`.
- Updated deployment smoke-test wiring to use `BIOMED_PAGES_URL`.
- No Cloudflare project, DNS record, token, or paid service was created.

### T-114: Quality System library

- Added `src/main/webapp/custom-libraries/quality-system.xml` with 10
  quality-system preset components using existing ISO 5807 shapes only.
- Updated `src/main/webapp/custom-config/app-config.js` so the Quality System
  library appears in the sidebar by default.
- Added automated validation for Quality System entry count, labels, tooltip
  coverage, ISO shape mapping, draw.io XML payloads, and the no-explicit-color
  requirement.

### T-115: Lab Templates library

- Added `src/main/webapp/custom-libraries/lab-templates.xml` with 7 lab
  workflow templates from `SHAPE-GUIDE-biomed.md`.
- Updated `src/main/webapp/custom-config/app-config.js` so the Lab Templates
  library appears in the sidebar by default.
- Added automated validation for template count, tooltip coverage, key node
  labels, ISO shape mapping, draw.io XML payloads, and the no-explicit-color
  requirement.

### T-116: Antibody Process library

- Added `src/main/webapp/custom-libraries/antibody-process.xml` with 15
  antibody CMC process preset components from `SHAPE-GUIDE-biomed.md`.
- Updated `src/main/webapp/custom-config/app-config.js` so the Antibody
  Process library appears in the sidebar by default.
- Added automated validation for entry count, tooltip coverage, labels, ISO
  shape mapping, draw.io XML payloads, and the no-explicit-color requirement.

### T-117: CAR-T Process library

- Added `src/main/webapp/custom-libraries/cart-process.xml` with 13 CAR-T
  process preset components from `SHAPE-GUIDE-biomed.md`.
- Updated `src/main/webapp/custom-config/app-config.js` so the CAR-T Process
  library appears in the sidebar by default.
- Added automated validation for entry count, tooltip coverage, labels, ISO
  shape mapping, draw.io XML payloads, and the no-explicit-color requirement.

### T-120: MSAL / Entra ID login integration

- Added `src/main/webapp/custom-config/auth-msal.js` as the project-owned
  single-tenant Entra ID auth module.
- Updated `src/main/webapp/custom-config/app-config.js` to register the auth
  module as a draw.io plugin without touching editor core files.
- Added automated validation for tenant/client IDs, redirect URIs, Graph
  scopes, supported-origin checks, and non-company-account rejection behavior.

### T-130: OneDrive for Business storage wiring

- Updated `src/main/webapp/custom-config/app-config.js` to publish the tenant
  and client IDs through draw.io's existing Microsoft Graph globals and to
  disable the personal OneDrive entry while keeping Microsoft 365 storage
  enabled.
- Updated `src/main/webapp/custom-config/auth-msal.js` to bridge MSAL access
  tokens into draw.io's native external OneDrive auth callback without editing
  the upstream storage client.
- Reused draw.io's built-in `m365` storage mode and forced it into external
  auth mode from the plugin layer so company sign-in and OneDrive for Business
  share the same Entra session.
- Added automated validation for Microsoft 365 storage flags, Graph app
  identifiers, external-auth bridge payloads, removal of the personal
  OneDrive UI entry, and `.drawio` save/read round-trip behavior in the
  Microsoft 365 storage path.

### T-150: User guides

- Added `docs/user-guide-pptx.md` with the MVP manual SVG-to-PowerPoint
  workflow and the known limits around custom biomed shapes and PowerPoint on
  the web.
- Added `docs/user-guide-onedrive-sharing.md` with the Microsoft 365 save path,
  native OneDrive sharing flow, and the shared-folder workaround.
- Added `docs/user-guide-mermaid.md` with the `Insert -> Mermaid` workflow and
  guidance for refining Mermaid drafts with the biomed libraries.
- Added automated validation so the required guide coverage stays present in
  future edits.

### T-160: PPTX export hint

- Added `src/main/webapp/custom-config/export-pptx-hint.js` to patch the
  existing export dialog through the plugin layer instead of editing draw.io
  core files.
- Updated `src/main/webapp/custom-config/app-config.js` to load the PPTX export
  hint plugin alongside the existing auth plugin.
- Added `src/main/webapp/help/pptx-export.html` as the deployed help page that
  the export dialog links to for the manual SVG-to-PowerPoint workflow.
- Added automated validation for plugin registration, export-dialog hint
  injection, and help-page coverage.

### T-140: Admin dashboard

- Added `src/main/webapp/admin/` as a standalone static admin surface instead
  of embedding a second editor experience.
- Added a project-owned admin data registry that lists current library versions,
  preset counts, operational usage tracking references, and view-only Entra
  group mappings for the MVP.
- Added client-side rendering for the admin page with a restrained operational
  layout that stays within the project scope and does not introduce new backend
  services.
- Added automated validation that checks the admin page structure, the rendered
  row counts, and consistency with the currently loaded library registry and
  tooltip review status.
