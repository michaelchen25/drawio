import { readFile } from 'node:fs/promises';
import { Script, createContext } from 'node:vm';
import { join, resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const appConfigPath = join(repoRoot, 'src/main/webapp/custom-config/app-config.js');

const appConfigContext = createContext({
	window: {},
	urlParams: {}
});

new Script(await readFile(appConfigPath, 'utf8'), {filename: appConfigPath}).runInContext(appConfigContext);

const projectConfig = appConfigContext.window.BIOMED_FLOWCHART_EDITOR;

if (appConfigContext.urlParams.od !== '0')
{
	throw new Error('App config did not disable the personal OneDrive entry');
}

if (appConfigContext.urlParams.ms365 !== '1')
{
	throw new Error('App config did not enable Microsoft 365 storage');
}

if ((appConfigContext.urlParams.p || '').includes('auth-msal'))
{
	throw new Error('App config should not register the removed in-app auth plugin');
}

if (projectConfig?.oneDriveConfig?.enablePersonalOneDrive !== false)
{
	throw new Error('Project config did not record personal OneDrive as disabled');
}

if (projectConfig?.oneDriveConfig?.enableMicrosoft365 !== true)
{
	throw new Error('Project config did not record Microsoft 365 storage as enabled');
}

if (appConfigContext.window.DRAWIO_MSGRAPH_CLIENT_ID !== '70d8b9a4-3050-4f09-9f6c-23edb16595b6')
{
	throw new Error('App config did not publish the expected Microsoft Graph client ID');
}

if (appConfigContext.window.DRAWIO_MSGRAPH_TENANT_ID !== 'a0485c91-c913-4c24-853d-30728fcb5843')
{
	throw new Error('App config did not publish the expected Microsoft Graph tenant ID');
}

console.log('Microsoft 365 storage configuration validation passed');
