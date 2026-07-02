(function()
{
	'use strict';

	var root = window;
	var project = root.BIOMED_FLOWCHART_EDITOR = root.BIOMED_FLOWCHART_EDITOR || {};

	if (root.BIOMED_ENTRA_AUTH_LOADED === true && project.entraAuth != null)
	{
		return;
	}

	var tenantId = 'a0485c91-c913-4c24-853d-30728fcb5843';
	var clientId = '70d8b9a4-3050-4f09-9f6c-23edb16595b6';
	var redirectUris = [
		'https://drawio-a7q.pages.dev',
		'http://localhost:8080'
	];
	var graphScopes = ['User.Read', 'Files.ReadWrite'];
	var loginScopes = ['openid', 'profile', 'email', 'offline_access'].concat(graphScopes);
	var pluginId = 'custom-config/auth-msal.js';
	var msalBrowserUrl = project.msalBrowserUrl || 'https://alcdn.msauth.net/browser/3.7.1/js/msal-browser.min.js';
	var gateRootId = 'biomed-auth-gate';
	var gateStatusId = 'biomed-auth-status';
	var gateButtonId = 'biomed-auth-login';
	var gateTitleId = 'biomed-auth-title';
	var gateDetailId = 'biomed-auth-detail';
	var gateFooterId = 'biomed-auth-footer';

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
			'Register the current origin in the Entra SPA redirect URI list before using company access.'
		);
	}

	function getDocument()
	{
		return root.document || null;
	}

	function whenDomReady(callback)
	{
		var doc = getDocument();

		if (doc == null)
		{
			callback();
			return;
		}

		if (doc.readyState === 'interactive' || doc.readyState === 'complete')
		{
			callback();
			return;
		}

		if (typeof doc.addEventListener === 'function')
		{
			doc.addEventListener('DOMContentLoaded', callback, {once: true});
		}
		else
		{
			callback();
		}
	}

	function setElementText(element, value)
	{
		if (element == null)
		{
			return;
		}

		element.textContent = value;
		element.innerText = value;
	}

	function getGateElement(id)
	{
		var doc = getDocument();

		return (doc != null && typeof doc.getElementById === 'function') ? doc.getElementById(id) : null;
	}

	function ensureMsalScript()
	{
		if (root.msal != null && typeof root.msal.PublicClientApplication === 'function')
		{
			return Promise.resolve(root.msal);
		}

		if (project.entraAuthMsalPromise != null)
		{
			return project.entraAuthMsalPromise;
		}

		project.entraAuthMsalPromise = new Promise(function(resolve, reject)
		{
			var doc = getDocument();

			if (doc == null || doc.head == null || typeof doc.createElement !== 'function')
			{
				reject(createError(
					'msal_not_loaded',
					'Sign-In Library Missing',
					'Microsoft Authentication Library is not available on this page.',
					'Check that the MSAL browser bundle is loaded before attempting company sign-in.'
				));
				return;
			}

			var existing = getGateElement('biomed-auth-msal-script');

			if (existing != null)
			{
				if (root.msal != null && typeof root.msal.PublicClientApplication === 'function')
				{
					resolve(root.msal);
				}
				else
				{
					existing.addEventListener('load', function()
					{
						resolve(root.msal);
					}, {once: true});
					existing.addEventListener('error', function()
					{
						reject(createError(
							'msal_script_failed',
							'Sign-In Library Failed',
							'Unable to load the Microsoft Authentication Library.',
							'Check network access to the configured MSAL browser bundle.'
						));
					}, {once: true});
				}

				return;
			}

			var script = doc.createElement('script');
			script.id = 'biomed-auth-msal-script';
			script.async = true;
			script.src = msalBrowserUrl;
			script.onload = function()
			{
				if (root.msal != null && typeof root.msal.PublicClientApplication === 'function')
				{
					resolve(root.msal);
				}
				else
				{
					reject(createError(
						'msal_not_loaded',
						'Sign-In Library Missing',
						'Microsoft Authentication Library loaded without the expected browser entry point.',
						'Verify that the configured MSAL browser bundle is valid.'
					));
				}
			};
			script.onerror = function()
			{
				reject(createError(
					'msal_script_failed',
					'Sign-In Library Failed',
					'Unable to load the Microsoft Authentication Library.',
					'Check network access to the configured MSAL browser bundle.'
				));
			};
			doc.head.appendChild(script);
		});

		return project.entraAuthMsalPromise;
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

	function updateGate(state)
	{
		var gate = getGateElement(gateRootId);

		if (gate == null)
		{
			return;
		}

		var title = getGateElement(gateTitleId);
		var detail = getGateElement(gateDetailId);
		var status = getGateElement(gateStatusId);
		var footer = getGateElement(gateFooterId);
		var button = getGateElement(gateButtonId);

		if (state == null)
		{
			state = {};
		}

		gate.style.display = state.visible === false ? 'none' : 'flex';
		gate.setAttribute('aria-hidden', state.visible === false ? 'true' : 'false');

		if (button != null)
		{
			button.disabled = state.loading === true;
			setElementText(button, state.buttonLabel || 'Sign In with Company Account');
		}

		setElementText(title, state.title || 'Company Access Required');
		setElementText(detail, state.detail || 'Sign in with your CytoArm Microsoft account before using this editor.');
		setElementText(status, state.status || '');
		setElementText(footer, state.footer || 'Only approved company accounts can open, edit, or save diagrams here.');
	}

	function createGateElement(doc, tagName, id, styles, text)
	{
		var element = doc.createElement(tagName);

		if (id != null)
		{
			element.id = id;
		}

		if (styles != null)
		{
			element.style.cssText = styles;
		}

		if (text != null)
		{
			setElementText(element, text);
		}

		return element;
	}

	function mountAccessGate()
	{
		var doc = getDocument();

		if (doc == null || doc.body == null || typeof doc.createElement !== 'function')
		{
			return null;
		}

		var existing = getGateElement(gateRootId);

		if (existing != null)
		{
			return existing;
		}

		var gate = createGateElement(
			doc,
			'div',
			gateRootId,
			[
				'position:fixed',
				'inset:0',
				'z-index:2147483647',
				'display:flex',
				'align-items:center',
				'justify-content:center',
				'padding:24px',
				'background:rgba(248,250,252,0.98)',
				'font-family:Helvetica,Arial,sans-serif',
				'color:#111827'
			].join(';')
		);
		var panel = createGateElement(
			doc,
			'div',
			null,
			[
				'width:min(440px,100%)',
				'padding:28px',
				'border:1px solid #d1d5db',
				'border-radius:8px',
				'background:#ffffff',
				'box-shadow:0 16px 40px rgba(15,23,42,0.12)'
			].join(';')
		);
		var title = createGateElement(
			doc,
			'h1',
			gateTitleId,
			'margin:0 0 12px 0;font-size:24px;font-weight:700;line-height:1.25',
			'Company Access Required'
		);
		var detail = createGateElement(
			doc,
			'p',
			gateDetailId,
			'margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#374151',
			'Sign in with your CytoArm Microsoft account before using this editor.'
		);
		var status = createGateElement(
			doc,
			'div',
			gateStatusId,
			'min-height:22px;margin:0 0 16px 0;font-size:13px;line-height:1.5;color:#1d4ed8',
			'Checking company session...'
		);
		var button = createGateElement(
			doc,
			'button',
			gateButtonId,
			[
				'display:inline-flex',
				'align-items:center',
				'justify-content:center',
				'width:100%',
				'min-height:44px',
				'padding:10px 16px',
				'border:1px solid #2563eb',
				'border-radius:8px',
				'background:#2563eb',
				'color:#ffffff',
				'font-size:14px',
				'font-weight:600',
				'cursor:pointer'
			].join(';'),
			'Sign In with Company Account'
		);
		var footer = createGateElement(
			doc,
			'p',
			gateFooterId,
			'margin:16px 0 0 0;font-size:12px;line-height:1.5;color:#6b7280',
			'Only approved company accounts can open, edit, or save diagrams here.'
		);

		if (typeof button.addEventListener === 'function')
		{
			button.addEventListener('click', function()
			{
				handleGateLogin();
			});
		}

		panel.appendChild(title);
		panel.appendChild(detail);
		panel.appendChild(status);
		panel.appendChild(button);
		panel.appendChild(footer);
		gate.appendChild(panel);
		doc.body.appendChild(gate);

		return gate;
	}

	function showAccessGate(statusText, detailText)
	{
		whenDomReady(function()
		{
			mountAccessGate();
			updateGate({
				visible: true,
				title: 'Company Access Required',
				detail: detailText || 'Sign in with your CytoArm Microsoft account before using this editor.',
				status: statusText || 'Sign in is required to continue.',
				buttonLabel: 'Sign In with Company Account'
			});
		});
	}

	function hideAccessGate()
	{
		updateGate({
			visible: false
		});
	}

	async function bootstrap()
	{
		await ensureMsalScript();

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

	async function ensureCompanySession(options)
	{
		options = options || {};
		await bootstrap();

		var account = getAccount();

		if (account != null)
		{
			return ensureCompanyAccount(account);
		}

		if (options.interactive === true)
		{
			return (await login()).account;
		}

		return null;
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
		await ensureCompanySession({interactive: false});

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
		ensureCompanySession({interactive: true}).then(function()
		{
			return acquireGraphToken();
		}).then(function(result)
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

		updateGate({
			visible: true,
			title: info.title,
			detail: info.detail || 'Sign in with your company account to continue.',
			status: info.message,
			buttonLabel: 'Try Company Sign-In Again'
		});

		if (ui != null && typeof ui.alert === 'function')
		{
			ui.alert(message, info.title);
		}
		else if (root.console != null && typeof root.console.error === 'function')
		{
			root.console.error(info.title + ': ' + message);
		}
	}

	async function refreshGate()
	{
		showAccessGate('Checking company session...');

		try
		{
			var account = await ensureCompanySession({interactive: false});

			if (account == null)
			{
				updateGate({
					visible: true,
					title: 'Company Access Required',
					detail: 'Sign in with your CytoArm Microsoft account before using this editor.',
					status: 'Sign in is required to continue.',
					buttonLabel: 'Sign In with Company Account'
				});
			}
			else
			{
				hideAccessGate();
			}
		}
		catch (err)
		{
			updateGate({
				visible: true,
				title: err.title || 'Company Access Required',
				detail: err.detail || 'Sign in with your CytoArm Microsoft account before using this editor.',
				status: err.message || 'Company sign-in is required to continue.',
				buttonLabel: 'Try Company Sign-In Again'
			});
		}
	}

	async function handleGateLogin()
	{
		updateGate({
			visible: true,
			title: 'Company Access Required',
			detail: 'Sign in with your CytoArm Microsoft account before using this editor.',
			status: 'Opening Microsoft sign-in...',
			buttonLabel: 'Signing In...',
			loading: true
		});

		try
		{
			await ensureCompanySession({interactive: true});
			hideAccessGate();
		}
		catch (err)
		{
			updateGate({
				visible: true,
				title: err.title || 'Company Sign-In Failed',
				detail: err.detail || 'Only company-managed accounts can open this editor.',
				status: err.message || 'Company sign-in failed.',
				buttonLabel: 'Try Company Sign-In Again'
			});
		}
	}

	function registerPlugin(ui)
	{
		root.oneDriveAuth = bridgeOneDriveAuth;
		configureStorageUi(ui);
		refreshGate().catch(function(err)
		{
			showUiError(ui, err);
		});
	}

	project.entraAuth = {
		client: null,
		clientId: clientId,
		tenantId: tenantId,
		redirectUris: redirectUris.slice(),
		loginScopes: loginScopes.slice(),
		graphScopes: graphScopes.slice(),
		msalBrowserUrl: msalBrowserUrl,
		isSupportedOrigin: isSupportedOrigin,
		isCompanyAccount: isCompanyAccount,
		getAccount: getAccount,
		bridgeOneDriveAuth: bridgeOneDriveAuth,
		configureStorageUi: configureStorageUi,
		bootstrap: bootstrap,
		login: login,
		logout: logout,
		ensureCompanySession: ensureCompanySession,
		acquireGraphToken: acquireGraphToken,
		formatUiError: formatUiError,
		showAccessGate: showAccessGate,
		hideAccessGate: hideAccessGate,
		refreshGate: refreshGate,
		handleGateLogin: handleGateLogin,
		pluginId: pluginId
	};

	root.BIOMED_ENTRA_AUTH_LOADED = true;

	showAccessGate('Checking company session...');
	ensureMsalScript().catch(function(err)
	{
		updateGate({
			visible: true,
			title: err.title || 'Company Access Required',
			detail: err.detail || 'Sign in with your CytoArm Microsoft account before using this editor.',
			status: err.message || 'Company sign-in is unavailable.',
			buttonLabel: 'Try Company Sign-In Again'
		});
	});

	if (root.Draw != null && typeof root.Draw.loadPlugin === 'function')
	{
		root.Draw.loadPlugin(registerPlugin);
	}
})();
