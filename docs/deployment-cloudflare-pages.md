# Cloudflare Pages Deployment Handoff

This project is prepared for Cloudflare Pages Free plan deployment, but project
creation, deployment token creation, and DNS changes must be performed by the
project owner.

## Prepared in the repository

- Static app root: `src/main/webapp`
- Cloudflare Pages config files:
  - `src/main/webapp/_headers`
  - `src/main/webapp/_redirects`
- GitHub Actions workflow: `.github/workflows/cloudflare-pages.yml`
- Required GitHub secrets:
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`
- Required GitHub variable:
  - `CLOUDFLARE_PAGES_PROJECT_NAME`

## Owner actions required

1. Create one Cloudflare Pages project on the Free plan.
2. Use this repository as the source, or create the project manually and let
   GitHub Actions deploy with Wrangler.
3. Configure project build settings:
   - Build command: leave empty
   - Build output directory: `src/main/webapp`
   - Root directory: repository root
4. Create a Cloudflare API token scoped only for Pages deployment.
5. Add GitHub secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
6. Add GitHub variable:
   - `CLOUDFLARE_PAGES_PROJECT_NAME`
7. Push the `dev` branch or manually run the workflow.
8. After deployment, open the generated `*.pages.dev` URL and confirm the
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
