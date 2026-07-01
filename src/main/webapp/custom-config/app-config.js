(function()
{
	'use strict';

	var root = window;
	var authPluginPath = 'custom-config/auth-msal.js';
	var exportHintPluginPath = 'custom-config/export-pptx-hint.js';
	var entraClientId = '70d8b9a4-3050-4f09-9f6c-23edb16595b6';
	var entraTenantId = 'a0485c91-c913-4c24-853d-30728fcb5843';
	var defaultLibraries = 'general;uml;er;bpmn;flowchart;basic;arrows2;iso5807;quality-system;lab-templates;antibody-process;cart-process';
	var customLibraries = [
		{
			id: 'iso5807',
			title: {
				main: 'ISO 5807'
			},
			entries: [
				{
					id: 'iso5807',
					title: {
						main: 'ISO 5807 Basic Symbols'
					},
					libs: [
						{
							title: {
								main: 'ISO 5807 Basic Symbols'
							},
							url: 'custom-libraries/iso5807.xml',
							preload: true
						}
					]
				}
			]
		},
		{
			id: 'quality-system',
			title: {
				main: 'Quality System'
			},
			entries: [
				{
					id: 'quality-system',
					title: {
						main: 'Quality System'
					},
					libs: [
						{
							title: {
								main: 'Quality System'
							},
							url: 'custom-libraries/quality-system.xml',
							preload: true
						}
					]
				}
			]
		},
		{
			id: 'lab-templates',
			title: {
				main: 'Lab Templates'
			},
			entries: [
				{
					id: 'lab-templates',
					title: {
						main: 'Lab Templates'
					},
					libs: [
						{
							title: {
								main: 'Lab Templates'
							},
							url: 'custom-libraries/lab-templates.xml',
							preload: true
						}
					]
				}
			]
		},
		{
			id: 'antibody-process',
			title: {
				main: 'Antibody Process'
			},
			entries: [
				{
					id: 'antibody-process',
					title: {
						main: 'Antibody Process'
					},
					libs: [
						{
							title: {
								main: 'Antibody Process'
							},
							url: 'custom-libraries/antibody-process.xml',
							preload: true
						}
					]
				}
			]
		},
		{
			id: 'cart-process',
			title: {
				main: 'CAR-T Process'
			},
			entries: [
				{
					id: 'cart-process',
					title: {
						main: 'CAR-T Process'
					},
					libs: [
						{
							title: {
								main: 'CAR-T Process'
							},
							url: 'custom-libraries/cart-process.xml',
							preload: true
						}
					]
				}
			]
		}
	];

	root.BIOMED_FLOWCHART_EDITOR = {
		version: '0.1.0',
		configLoaded: true,
		customLibraries: customLibraries,
		authPluginPath: authPluginPath,
		exportHintPluginPath: exportHintPluginPath,
		entraClientId: entraClientId,
		entraTenantId: entraTenantId,
		oneDriveConfig: {
			enablePersonalOneDrive: false,
			enableMicrosoft365: true
		}
	};

	root.DRAWIO_MSGRAPH_CLIENT_ID = entraClientId;
	root.DRAWIO_MSGRAPH_TENANT_ID = entraTenantId;

	if (typeof urlParams === 'object' && urlParams != null)
	{
		var pluginPaths = (urlParams.p != null && urlParams.p.length > 0) ?
			urlParams.p.split(';') : [];

		if (pluginPaths.indexOf(authPluginPath) < 0)
		{
			pluginPaths.push(authPluginPath);
		}

		if (pluginPaths.indexOf(exportHintPluginPath) < 0)
		{
			pluginPaths.push(exportHintPluginPath);
		}

		urlParams.p = pluginPaths.join(';');

		urlParams.od = '0';
		urlParams.ms365 = '1';
	}

	root.DRAWIO_CONFIG = Object.assign({}, root.DRAWIO_CONFIG || {}, {
		appendCustomLibraries: true,
		defaultLibraries: defaultLibraries,
		libraries: customLibraries
	});

	root.BIOMED_APP_CONFIG_LOADED = true;
})();
