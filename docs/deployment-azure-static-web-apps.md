# Azure Static Web Apps Deployment Handoff

This project is prepared for Azure Static Web Apps Free tier deployment, but
resource creation and DNS changes must be performed by the project owner.

## Prepared in the repository

- Static app root: `src/main/webapp`
- Azure config file: `src/main/webapp/staticwebapp.config.json`
- GitHub Actions workflow: `.github/workflows/azure-static-web-apps.yml`
- Required GitHub secret: `AZURE_STATIC_WEB_APPS_API_TOKEN`

## Owner actions required

1. Create one Azure Static Web Apps resource on the Free plan.
2. Use GitHub as the deployment source and select this repository.
3. Configure build settings:
   - App location: `src/main/webapp`
   - API location: leave empty
   - Output location: leave empty
   - Skip app build: enabled
4. Copy the deployment token into the GitHub repository secret
   `AZURE_STATIC_WEB_APPS_API_TOKEN`.
5. Push the `dev` branch or manually run the workflow.
6. After deployment, open the generated HTTPS URL and confirm the editor loads.

## Cost guardrails

- Use Azure Static Web Apps Free tier.
- Do not enable Application Insights.
- Do not enable Log Analytics diagnostic settings.
- Do not add Azure Front Door, WAF, reserved IP, or other paid edge services.
- Configure an Azure Cost Management budget alert, for example NT$50 per month.

## Custom domain

Custom domain and DNS setup are intentionally not automated. Add them only after
the generated Static Web Apps URL has passed the smoke test.

## Post-deployment smoke test

Once the Azure URL is available, run:

```sh
BIOMED_SWA_URL="https://your-static-web-app.azurestaticapps.net" npm run test:deployed
```
