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
5. After the first deployment succeeds, copy the generated `*.pages.dev` URL.
6. In Microsoft Entra admin center, add that exact Pages URL to the SPA
   redirect URI list for the registered application if it is not already
   present.
7. Re-deploy after the redirect URI is confirmed if the Entra configuration was
   changed after the first build.

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

## Manual verification checklist

After the automated smoke test passes, verify these browser flows:

1. Open `/` and confirm the main editor loads.
2. Open `/admin/` and confirm the Admin Dashboard shows:
   - Operational Snapshot
   - Library Registry
   - Usage Tracking
   - Entra Group Mapping
3. Open `/help/pptx-export.html` and confirm the PPTX conversion guide loads.
4. In the editor, open the export dialog and confirm the PPTX manual conversion
   hint appears with a working help link.
5. Sign in with the company Microsoft account through `Extras -> Company Sign In...`.
6. Save a `.drawio` file through `File -> Save As -> M365`.
7. Re-open that file from `File -> Open From -> M365`.

## Expected deployed paths

- Main editor: `/`
- Admin dashboard: `/admin/`
- PPTX help page: `/help/pptx-export.html`

## Notes

- The admin dashboard is a static MVP surface. Usage tracking is a manual
  operational reference, not a production telemetry pipeline.
- Real-time collaboration is intentionally out of scope.
- If sign-in fails after deployment, the most common cause is a missing or
  mismatched Entra SPA redirect URI for the current Pages hostname.
