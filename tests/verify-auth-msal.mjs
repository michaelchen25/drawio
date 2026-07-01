import { readFile } from 'node:fs/promises';
import { Script, createContext } from 'node:vm';
import { join, resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const authPath = join(repoRoot, 'src/main/webapp/custom-config/auth-msal.js');
const tenantId = 'a0485c91-c913-4c24-853d-30728fcb5843';
const clientId = '70d8b9a4-3050-4f09-9f6c-23edb16595b6';

function createMsalStub(options = {})
{
	let activeAccount = options.activeAccount || null;
	const loginCalls = [];
	const silentCalls = [];
	const popupCalls = [];
	const logoutCalls = [];
	const constructedConfigs = [];

	function PublicClientApplication(config)
	{
		constructedConfigs.push(config);
	}

	PublicClientApplication.prototype.handleRedirectPromise = async function()
	{
		return null;
	};

	PublicClientApplication.prototype.getActiveAccount = function()
	{
		return activeAccount;
	};

	PublicClientApplication.prototype.setActiveAccount = function(account)
	{
		activeAccount = account;
	};

	PublicClientApplication.prototype.getAllAccounts = function()
	{
		return activeAccount != null ? [activeAccount] : [];
	};

	PublicClientApplication.prototype.loginPopup = async function(request)
	{
		loginCalls.push(request);

		const account = options.loginAccount || {
			username: 'user@cytoarm.com',
			tenantId: tenantId,
			homeAccountId: 'abc.' + tenantId
		};

		return {account};
	};

	PublicClientApplication.prototype.acquireTokenSilent = async function(request)
	{
		silentCalls.push(request);

		if (options.silentError != null)
		{
			throw options.silentError;
		}

		return {
			accessToken: 'silent-token',
			account: activeAccount || options.loginAccount
		};
	};

	PublicClientApplication.prototype.acquireTokenPopup = async function(request)
	{
		popupCalls.push(request);

		return {
			accessToken: 'popup-token',
			account: activeAccount || options.loginAccount
		};
	};

	PublicClientApplication.prototype.logoutPopup = async function(request)
	{
		logoutCalls.push(request);
		return null;
	};

	return {
		PublicClientApplication,
		loginCalls,
		silentCalls,
		popupCalls,
		logoutCalls,
		constructedConfigs
	};
}

async function loadAuthContext(options = {})
{
	const pluginCalls = [];
	const msal = createMsalStub(options.msalOptions);
	const context = createContext({
		window: {
			location: {
				origin: options.origin || 'https://drawio-a7q.pages.dev'
			},
			Draw: {
				loadPlugin: (callback) => pluginCalls.push(callback)
			},
			msal,
			console
		},
		Draw: {
			loadPlugin: (callback) => pluginCalls.push(callback)
		},
		console
	});

	new Script(await readFile(authPath, 'utf8'), {filename: authPath}).runInContext(context);

	return {context, pluginCalls, msal};
}

const {context, pluginCalls, msal} = await loadAuthContext();
const auth = context.window.BIOMED_FLOWCHART_EDITOR?.entraAuth;

if (context.window.BIOMED_ENTRA_AUTH_LOADED !== true) {
	throw new Error('MSAL auth config did not set the load flag');
}

if (auth?.clientId !== clientId || auth?.tenantId !== tenantId) {
	throw new Error('MSAL auth config did not expose the expected tenant and client identifiers');
}

if (pluginCalls.length !== 1) {
	throw new Error('MSAL auth config did not register exactly one draw.io plugin');
}

if (!auth.redirectUris.includes('https://drawio-a7q.pages.dev') ||
	!auth.redirectUris.includes('http://localhost:8080')) {
	throw new Error('MSAL auth config is missing the expected redirect URIs');
}

for (const scope of ['openid', 'profile', 'email', 'offline_access', 'User.Read', 'Files.ReadWrite']) {
	if (!auth.loginScopes.includes(scope)) {
		throw new Error(`MSAL auth config is missing expected scope: ${scope}`);
	}
}

if (!auth.isSupportedOrigin('https://drawio-a7q.pages.dev') ||
	auth.isSupportedOrigin('https://preview.example.com')) {
	throw new Error('MSAL auth origin checks are incorrect');
}

await auth.login();

if (msal.constructedConfigs.length !== 1) {
	throw new Error('MSAL auth config did not instantiate a single PublicClientApplication');
}

if (msal.constructedConfigs[0]?.auth?.authority !== 'https://login.microsoftonline.com/' + tenantId) {
	throw new Error('MSAL auth config did not use the expected single-tenant authority');
}

if (msal.loginCalls.length !== 1 || !msal.loginCalls[0].scopes.includes('Files.ReadWrite')) {
	throw new Error('MSAL auth login did not request the expected Graph scopes');
}

const silentResult = await auth.acquireGraphToken();

if (silentResult.accessToken !== 'silent-token' || msal.silentCalls.length !== 1) {
	throw new Error('MSAL auth did not prefer silent token acquisition');
}

const fallback = await loadAuthContext({
	_jsii__proto__: null,
	msalOptions: {
		activeAccount: {
			username: 'user@cytoarm.com',
			tenantId,
			homeAccountId: 'abc.' + tenantId
		},
		silentError: new Error('silent failed')
	}
});

const popupResult = await fallback.context.window.BIOMED_FLOWCHART_EDITOR.entraAuth.acquireGraphToken();

if (popupResult.accessToken !== 'popup-token' || fallback.msal.popupCalls.length !== 1) {
	throw new Error('MSAL auth did not fall back to interactive token acquisition');
}

const rejected = await loadAuthContext({
	msalOptions: {
		loginAccount: {
			username: 'external@example.com',
			tenantId: 'different-tenant',
			homeAccountId: 'abc.different-tenant'
		}
	}
});

let rejectedError = null;

try {
	await rejected.context.window.BIOMED_FLOWCHART_EDITOR.entraAuth.login();
}
catch (err) {
	rejectedError = err;
}

if (rejectedError?.code !== 'non_company_account') {
	throw new Error('MSAL auth did not reject non-company accounts with the expected error');
}

const unsupported = await loadAuthContext({origin: 'https://preview.pages.dev'});
let unsupportedError = null;

try {
	await unsupported.context.window.BIOMED_FLOWCHART_EDITOR.entraAuth.login();
}
catch (err) {
	unsupportedError = err;
}

if (unsupportedError?.code !== 'unsupported_origin') {
	throw new Error('MSAL auth did not reject unsupported origins with the expected error');
}

console.log('MSAL auth configuration validation passed');
