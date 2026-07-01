import { readFile } from 'node:fs/promises';
import { Script, createContext } from 'node:vm';
import { join, resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const appConfigPath = join(repoRoot, 'src/main/webapp/custom-config/app-config.js');
const authPath = join(repoRoot, 'src/main/webapp/custom-config/auth-msal.js');
const tenantId = 'a0485c91-c913-4c24-853d-30728fcb5843';

function createMsalStub()
{
	let activeAccount = {
		username: 'user@cytoarm.com',
		tenantId,
		homeAccountId: 'abc.' + tenantId
	};

	function PublicClientApplication()
	{
	}

	PublicClientApplication.prototype.handleRedirectPromise = async function()
	{
		return null;
	};

	PublicClientApplication.prototype.getActiveAccount = function()
	{
		return activeAccount;
	};

	PublicClientApplication.prototype.getAllAccounts = function()
	{
		return [activeAccount];
	};

	PublicClientApplication.prototype.setActiveAccount = function(account)
	{
		activeAccount = account;
	};

	PublicClientApplication.prototype.acquireTokenSilent = async function(request)
	{
		return {
			accessToken: 'business-graph-token',
			tokenType: 'Bearer',
			scopes: request.scopes,
			account: activeAccount,
			expiresIn: 1800
		};
	};

	PublicClientApplication.prototype.acquireTokenPopup = async function(request)
	{
		return {
			accessToken: 'business-graph-token-popup',
			tokenType: 'Bearer',
			scopes: request.scopes,
			account: activeAccount,
			expiresIn: 1800
		};
	};

	return {
		PublicClientApplication
	};
}

function createUiStub()
{
	return {
		actions: {
			addAction()
			{
			}
		},
		menus: {
			get(name)
			{
				return name === 'extras' ? {funct() {}} : null;
			},
			addMenuItems()
			{
			}
		},
		m365: {
			isExtAuth: false
		},
		oneDrive: {
			isExtAuth: false
		}
	};
}

class FakeM365Storage
{
	constructor(win)
	{
		this.window = win;
		this.files = new Map();
		this.authPayload = null;
	}

	async authenticate()
	{
		this.authPayload = await new Promise((resolve, reject) =>
		{
			this.window.oneDriveAuth(resolve, reject);
		});

		if (this.authPayload?.access_token == null)
		{
			throw new Error('Missing access token from oneDriveAuth bridge');
		}

		if (this.authPayload?.token_type !== 'Bearer')
		{
			throw new Error('Expected bearer token payload for Microsoft 365 storage');
		}

		return this.authPayload;
	}

	async insertFile(filename, data)
	{
		if (!filename.endsWith('.drawio'))
		{
			throw new Error('Expected .drawio file extension for the save/read test');
		}

		await this.authenticate();

		const meta = {
			id: 'drive-1/item-1',
			name: filename
		};

		this.files.set(meta.id, {
			meta,
			data
		});

		return meta;
	}

	async saveFile(fileId, data)
	{
		await this.authenticate();

		const file = this.files.get(fileId);

		if (file == null)
		{
			throw new Error('Cannot save missing Microsoft 365 file');
		}

		file.data = data;
		return file.meta;
	}

	async getFile(fileId)
	{
		await this.authenticate();

		const file = this.files.get(fileId);

		if (file == null)
		{
			throw new Error('Cannot load missing Microsoft 365 file');
		}

		return file;
	}
}

const appConfigContext = createContext({
	window: {},
	urlParams: {}
});

new Script(await readFile(appConfigPath, 'utf8'), {filename: appConfigPath}).runInContext(appConfigContext);

if (appConfigContext.urlParams.od !== '0' || appConfigContext.urlParams.ms365 !== '1')
{
	throw new Error('App config did not force Microsoft 365 mode for business storage');
}

if (appConfigContext.window.DRAWIO_MSGRAPH_TENANT_ID !== tenantId)
{
	throw new Error('App config did not publish the expected tenant for Microsoft 365 storage');
}

const pluginCalls = [];
const authContext = createContext({
	window: {
		location: {
			origin: 'https://drawio-a7q.pages.dev'
		},
		Draw: {
			loadPlugin(callback)
			{
				pluginCalls.push(callback);
			}
		},
		msal: createMsalStub(),
		console
	},
	Draw: {
		loadPlugin(callback)
		{
			pluginCalls.push(callback);
		}
	},
	mxResources: {
		parse()
		{
		}
	},
	console
});

new Script(await readFile(authPath, 'utf8'), {filename: authPath}).runInContext(authContext);

if (pluginCalls.length !== 1)
{
	throw new Error('Auth config did not register the expected draw.io plugin');
}

const ui = createUiStub();
pluginCalls[0](ui);

if (ui.m365?.isExtAuth !== true)
{
	throw new Error('Auth plugin did not enable external auth for Microsoft 365 storage');
}

if (ui.oneDrive != null)
{
	throw new Error('Auth plugin did not remove personal OneDrive from the storage UI');
}

if (typeof authContext.window.oneDriveAuth !== 'function')
{
	throw new Error('Auth plugin did not expose the external OneDrive auth bridge');
}

const storage = new FakeM365Storage(authContext.window);
const originalXml = '<mxfile host="app.diagrams.net"><diagram id="page-1">initial</diagram></mxfile>';
const updatedXml = '<mxfile host="app.diagrams.net"><diagram id="page-1">updated</diagram></mxfile>';

const createdMeta = await storage.insertFile('biomed-process.drawio', originalXml);
const loadedOriginal = await storage.getFile(createdMeta.id);

if (loadedOriginal.data !== originalXml)
{
	throw new Error('Microsoft 365 storage did not round-trip the initial .drawio payload');
}

await storage.saveFile(createdMeta.id, updatedXml);
const loadedUpdated = await storage.getFile(createdMeta.id);

if (loadedUpdated.data !== updatedXml)
{
	throw new Error('Microsoft 365 storage did not return the updated .drawio payload');
}

if (!String(storage.authPayload.scope || '').includes('Files.ReadWrite'))
{
	throw new Error('Microsoft 365 auth bridge did not carry the expected file scope');
}

console.log('Microsoft 365 OneDrive storage validation passed');
