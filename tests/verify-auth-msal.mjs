import { readFile } from 'node:fs/promises';
import { Script, createContext } from 'node:vm';
import { join, resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const authPath = join(repoRoot, 'src/main/webapp/custom-config/auth-msal.js');
const tenantId = 'a0485c91-c913-4c24-853d-30728fcb5843';
const clientId = '70d8b9a4-3050-4f09-9f6c-23edb16595b6';

function createFakeDocument()
{
	const elementsById = new Map();
	const listeners = new Map();

	function createElement(tagName)
	{
		const element = {
			tagName: String(tagName || '').toUpperCase(),
			style: {},
			children: [],
			attributes: {},
			textContent: '',
			innerText: '',
			innerHTML: '',
			parentNode: null,
			disabled: false,
			appendChild(child) {
				child.parentNode = this;
				this.children.push(child);

				if (child.id) {
					elementsById.set(child.id, child);
				}

				if (this.tagName === 'HEAD' && child.tagName === 'SCRIPT' && typeof child.onload === 'function') {
					child.onload();
				}

				return child;
			},
			setAttribute(name, value) {
				this.attributes[name] = String(value);

				if (name === 'id') {
					this.id = String(value);
					elementsById.set(this.id, this);
				}
			},
			addEventListener(name, handler) {
				this.listeners = this.listeners || {};
				this.listeners[name] = handler;
			},
			removeEventListener(name) {
				if (this.listeners != null) {
					delete this.listeners[name];
				}
			}
		};

		return element;
	}

	const document = {
		readyState: 'complete',
		head: createElement('head'),
		body: createElement('body'),
		createElement,
		getElementById(id) {
			return elementsById.get(id) || null;
		},
		addEventListener(name, handler) {
			listeners.set(name, handler);
		},
		removeEventListener(name) {
			listeners.delete(name);
		}
	};

	return document;
}

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
	const mxResourcesCalls = [];
	const document = createFakeDocument();
	const context = createContext({
		window: {
			location: {
				origin: options.origin || 'https://drawio-a7q.pages.dev'
			},
			Draw: {
				loadPlugin: (callback) => pluginCalls.push(callback)
			},
			msal,
			document,
			console
		},
		Draw: {
			loadPlugin: (callback) => pluginCalls.push(callback)
		},
		document,
		mxResources: {
			parse: (value) => mxResourcesCalls.push(value)
		},
		console
	});

	new Script(await readFile(authPath, 'utf8'), {filename: authPath}).runInContext(context);

	return {context, pluginCalls, msal, mxResourcesCalls, document};
}

const {context, pluginCalls, msal, document} = await loadAuthContext();
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

if (typeof auth?.bridgeOneDriveAuth !== 'function' || typeof auth?.configureStorageUi !== 'function') {
	throw new Error('MSAL auth config did not expose the expected OneDrive bridge helpers');
}

if (auth?.msalBrowserUrl !== 'https://alcdn.msauth.net/browser/3.7.1/js/msal-browser.min.js') {
	throw new Error('MSAL auth config did not expose the expected browser bundle URL');
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

if (document.getElementById('biomed-auth-gate') == null ||
	document.getElementById('biomed-auth-login') == null) {
	throw new Error('MSAL auth config did not mount the expected access gate');
}

await auth.refreshGate();

if (document.getElementById('biomed-auth-gate')?.style?.display === 'none') {
	throw new Error('MSAL auth gate should stay visible when no session exists');
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

const signedIn = await loadAuthContext({
	msalOptions: {
		activeAccount: {
			username: 'user@cytoarm.com',
			tenantId,
			homeAccountId: 'abc.' + tenantId
		}
	}
});

await signedIn.context.window.BIOMED_FLOWCHART_EDITOR.entraAuth.refreshGate();

if (signedIn.document.getElementById('biomed-auth-gate')?.style?.display !== 'none') {
	throw new Error('MSAL auth gate did not unlock the editor for an approved company account');
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

const fakeActions = {
	added: [],
	addAction(name, handler) {
		this.added.push({name, handler});
	}
};
const fakeUi = {
	actions: fakeActions,
	menus: {
		get() {
			return null;
		},
		addMenuItems() {}
	},
	m365: {
		isExtAuth: false
	},
	oneDrive: {
		isExtAuth: false
	}
};

pluginCalls[0](fakeUi);

if (context.window.oneDriveAuth == null) {
	throw new Error('MSAL auth plugin did not register the OneDrive bridge callback');
}

if (fakeUi.m365?.isExtAuth !== true) {
	throw new Error('MSAL auth plugin did not switch Microsoft 365 storage to external auth mode');
}

if (fakeUi.oneDrive != null) {
	throw new Error('MSAL auth plugin did not remove personal OneDrive from the UI');
}

if (fakeActions.added.length !== 0) {
	throw new Error('MSAL auth plugin should no longer depend on Extras menu actions for access control');
}

let bridgeResult = null;
await new Promise((resolve, reject) =>
{
	context.window.oneDriveAuth((result) =>
	{
		bridgeResult = result;
		resolve();
	}, reject);
});

if (bridgeResult?.access_token !== 'silent-token' || bridgeResult?.token_type !== 'Bearer') {
	throw new Error('MSAL auth plugin did not translate Graph tokens into draw.io OneDrive auth payloads');
}

console.log('MSAL auth configuration validation passed');
