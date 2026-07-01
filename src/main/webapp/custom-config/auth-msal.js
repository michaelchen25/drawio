(function()
{
	'use strict';

	var root = window;
	var project = root.BIOMED_FLOWCHART_EDITOR = root.BIOMED_FLOWCHART_EDITOR || {};
	var tenantId = 'a0485c91-c913-4c24-853d-30728fcb5843';
	var clientId = '70d8b9a4-3050-4f09-9f6c-23edb16595b6';
	var redirectUris = [
		'https://drawio-a7q.pages.dev',
		'http://localhost:8080'
	];
	var graphScopes = ['User.Read', 'Files.ReadWrite'];
	var loginScopes = ['openid', 'profile', 'email', 'offline_access'].concat(graphScopes);
	var pluginId = 'custom-config/auth-msal.js';

	function createError(code, title, message, detail)
	{
		var error = new Error(message);
		error.code = code;
		error.title = title;
		error.detail = detail;

		return error;
	}

	function normalizeOrigin(origin)
	{
		return (origin || '').replace(/\/+$/, '');
	}

	function isSupportedOrigin(origin)
	{
		var normalized = normalizeOrigin(origin);

		return redirectUris.indexOf(normalized) >= 0;
	}

	function getActiveRedirectUri()
	{
		var origin = normalizeOrigin(root.location != null ? root.location.origin : '');

		if (isSupportedOrigin(origin))
		{
			return origin;
		}

		throw createError(
			'unsupported_origin',
			'Unsupported Sign-In Origin',
			'This origin is not registered for Entra ID sign-in.',
			'Register the current origin in the Entra SPA redirect URI list before using company sign-in.'
		);
	}

	function getMsalLibrary()
	{
		if (root.msal == null || typeof root.msal.PublicClientApplication !== 'function')
		{
			throw createError(
				'msal_not_loaded',
				'Sign-In Library Missing',
				'Microsoft Authentication Library is not available on this page.',
				'Check that the MSAL browser bundle is loaded before attempting company sign-in.'
			);
		}

		return root.msal;
	}

	function getTenantFromAccount(account)
	{
		if (account == null)
		{
			return null;
		}

		if (account.tenantId != null)
		{
			return account.tenantId;
		}

		if (account.idTokenClaims != null && account.idTokenClaims.tid != null)
		{
			return account.idTokenClaims.tid;
		}

		if (typeof account.homeAccountId === 'string')
		{
			var parts = account.homeAccountId.split('.');

			if (parts.length > 1)
			{
				return parts[1];
			}
		}

		return null;
	}

	function isCompanyAccount(account)
	{
		return getTenantFromAccount(account) === tenantId;
	}

	function ensureCompanyAccount(account)
	{
		if (!isCompanyAccount(account))
		{
			throw createError(
				'non_company_account',
				'Company Account Required',
				'Use your CytoArm Microsoft account to continue.',
				'This editor only accepts accounts from the configured Entra tenant.'
			);
		}

		return account;
	}

	function getClient()
	{
		if (project.entraAuth.client != null)
		{
			return project.entraAuth.client;
		}

		var msal = getMsalLibrary();
		project.entraAuth.client = new msal.PublicClientApplication({
			auth: {
				clientId: clientId,
				authority: 'https://login.microsoftonline.com/' + tenantId,
				redirectUri: getActiveRedirectUri()
			},
			cache: {
				cacheLocation: 'sessionStorage',
				storeAuthStateInCookie: false
			}
		});

		return project.entraAuth.client;
	}

	function getAccount()
	{
		var client = getClient();
		var account = null;

		if (typeof client.getActiveAccount === 'function')
		{
			account = client.getActiveAccount();
		}

		if (account == null && typeof client.getAllAccounts === 'function')
		{
			var accounts = client.getAllAccounts();
			account = (accounts != null && accounts.length > 0) ? accounts[0] : null;
		}

		return account;
	}

	async function bootstrap()
	{
		var client = getClient();

		if (typeof client.handleRedirectPromise === 'function')
		{
			await client.handleRedirectPromise();
		}

		return client;
	}

	async function login()
	{
		await bootstrap();

		var client = getClient();
		var response = await client.loginPopup({
			scopes: loginScopes,
			redirectUri: getActiveRedirectUri(),
			prompt: 'select_account'
		});
		var account = ensureCompanyAccount(response != null ? response.account : null);

		if (typeof client.setActiveAccount === 'function')
		{
			client.setActiveAccount(account);
		}

		return {
			account: account,
			tenantId: getTenantFromAccount(account)
		};
	}

	async function logout()
	{
		await bootstrap();

		var client = getClient();
		var account = getAccount();
		var redirectUri = getActiveRedirectUri();

		if (typeof client.logoutPopup === 'function')
		{
			return client.logoutPopup({
				account: account,
				postLogoutRedirectUri: redirectUri,
				mainWindowRedirectUri: redirectUri
			});
		}

		return null;
	}

	async function acquireGraphToken(interactiveFallback)
	{
		await bootstrap();

		var client = getClient();
		var account = ensureCompanyAccount(getAccount());
		var request = {
			account: account,
			scopes: graphScopes,
			redirectUri: getActiveRedirectUri()
		};

		try
		{
			return await client.acquireTokenSilent(request);
		}
		catch (err)
		{
			if (interactiveFallback === false)
			{
				throw err;
			}

			return client.acquireTokenPopup(request);
		}
	}

	function getExpiresInSeconds(result)
	{
		if (result == null)
		{
			return 3600;
		}

		if (typeof result.expiresIn === 'number' && result.expiresIn > 0)
		{
			return result.expiresIn;
		}

		if (result.expiresOn instanceof Date)
		{
			return Math.max(60, Math.round((result.expiresOn.getTime() - Date.now()) / 1000));
		}

		return 3600;
	}

	function toOneDriveAuthInfo(result)
	{
		return {
			access_token: result.accessToken,
			token_type: result.tokenType || 'Bearer',
			expires_in: getExpiresInSeconds(result),
			scope: Array.isArray(result.scopes) ? result.scopes.join(' ') : graphScopes.join(' ')
		};
	}

	function bridgeOneDriveAuth(success, error)
	{
		acquireGraphToken().then(function(result)
		{
			success(toOneDriveAuthInfo(result));
		}).catch(function(err)
		{
			if (typeof error === 'function')
			{
				error(err);
			}
		});
	}

	function configureStorageUi(ui)
	{
		if (ui == null)
		{
			return;
		}

		if (ui.m365 != null)
		{
			ui.m365.isExtAuth = true;
		}

		if (ui.oneDrive != null)
		{
			ui.oneDrive = null;
		}
	}

	function formatUiError(err)
	{
		if (err == null)
		{
			return {
				title: 'Company Sign-In Failed',
				message: 'Unknown authentication error.'
			};
		}

		return {
			title: err.title || 'Company Sign-In Failed',
			message: err.message || 'Unknown authentication error.',
			detail: err.detail || null
		};
	}

	function showUiError(ui, err)
	{
		var info = formatUiError(err);
		var message = info.message + (info.detail != null ? '\n\n' + info.detail : '');

		if (ui != null && typeof ui.alert === 'function')
		{
			ui.alert(message, info.title);
		}
		else if (root.console != null && typeof root.console.error === 'function')
		{
			root.console.error(info.title + ': ' + message);
		}
	}

	function registerPlugin(ui)
	{
		if (ui == null || ui.actions == null || ui.menus == null)
		{
			return;
		}

		root.oneDriveAuth = bridgeOneDriveAuth;
		configureStorageUi(ui);

		mxResources.parse(
			'biomedCompanyLogin=Company Sign In...' +
			';biomedCompanyLogout=Company Sign Out'
		);

		ui.actions.addAction('biomedCompanyLogin...', function()
		{
			login().catch(function(err)
			{
				showUiError(ui, err);
			});
		});

		ui.actions.addAction('biomedCompanyLogout', function()
		{
			logout().catch(function(err)
			{
				showUiError(ui, err);
			});
		});

		var extrasMenu = ui.menus.get('extras');

		if (extrasMenu != null)
		{
			var oldFunct = extrasMenu.funct;

			extrasMenu.funct = function(menu, parent)
			{
				oldFunct.apply(this, arguments);
				ui.menus.addMenuItems(menu, ['-', 'biomedCompanyLogin', 'biomedCompanyLogout'], parent);
			};
		}
	}

	project.entraAuth = {
		client: null,
		clientId: clientId,
		tenantId: tenantId,
		redirectUris: redirectUris.slice(),
		loginScopes: loginScopes.slice(),
		graphScopes: graphScopes.slice(),
		isSupportedOrigin: isSupportedOrigin,
		isCompanyAccount: isCompanyAccount,
		getAccount: getAccount,
		bridgeOneDriveAuth: bridgeOneDriveAuth,
		configureStorageUi: configureStorageUi,
		bootstrap: bootstrap,
		login: login,
		logout: logout,
		acquireGraphToken: acquireGraphToken,
		formatUiError: formatUiError,
		pluginId: pluginId
	};

	root.BIOMED_ENTRA_AUTH_LOADED = true;

	if (root.Draw != null && typeof root.Draw.loadPlugin === 'function')
	{
		root.Draw.loadPlugin(registerPlugin);
	}
})();
