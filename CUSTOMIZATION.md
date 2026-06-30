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
