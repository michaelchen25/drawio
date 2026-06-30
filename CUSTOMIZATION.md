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

- Added `.github/workflows/azure-static-web-apps.yml`.
- The `validate` job runs automated tests on pushes and pull requests to `dev`.
- The `deploy` job uploads `src/main/webapp` to Azure Static Web Apps only when
  `AZURE_STATIC_WEB_APPS_API_TOKEN` is present.
- Added workflow structure validation to the project test suite.
