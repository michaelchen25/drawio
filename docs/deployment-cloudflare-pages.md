# Cloudflare Pages Deployment Handoff

This project is prepared for Cloudflare Pages Free plan deployment, but project
creation, deployment token creation, and DNS changes must be performed by the
project owner.

## Prepared in the repository

- Static app root: `src/main/webapp`
- Cloudflare Pages config files:
  - `src/main/webapp/_headers`
  - `src/main/webapp/_redirects`
- GitHub Actions validation workflow: `.github/workflows/cloudflare-pages.yml`
- Deployment path: Cloudflare Pages native Git integration. GitHub Actions does
  not run a second Wrangler deployment.

## Owner actions required

1. Create one Cloudflare Pages project on the Free plan.
2. Use this repository as the source through Cloudflare Pages Git integration.
3. Configure project build settings:
   - Build command: `npm run build`
   - Build output directory: `src/main/webapp`
   - Root directory: repository root
4. Push the `dev` branch.
5. After deployment, open the generated `*.pages.dev` URL and confirm the
   editor loads.

## Cost guardrails

- Use Cloudflare Pages Free plan.
- Do not enable Workers Paid, R2, Images, Stream, Logpush, or other paid
  Cloudflare services.
- Do not enable Cloudflare Access paid features without explicit approval.
- Custom domain and DNS setup are intentionally not automated.

## Post-deployment smoke test

Once the Cloudflare Pages URL is available, run:

```sh
BIOMED_PAGES_URL="https://your-project.pages.dev" npm run test:deployed
```
