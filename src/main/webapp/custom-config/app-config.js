(function()
{
	'use strict';

	var root = window;
	var exportHintPluginPath = 'custom-config/export-pptx-hint.js';
	var entraClientId = '70d8b9a4-3050-4f09-9f6c-23edb16595b6';
	var entraTenantId = 'a0485c91-c913-4c24-853d-30728fcb5843';
	var defaultLibraries = 'general;uml;er;bpmn;flowchart;basic;arrows2;iso5807;quality-system;lab-templates;antibody-process;cart-process';
	var appOrigin = (root.location != null && typeof root.location.origin === 'string') ?
		root.location.origin : '';

	function getLibraryUrl(fileName)
	{
		return appOrigin + '/custom-libraries/' + fileName;
	}

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
							url: getLibraryUrl('iso5807.xml'),
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
							url: getLibraryUrl('quality-system.xml'),
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
							url: getLibraryUrl('lab-templates.xml'),
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
							url: getLibraryUrl('antibody-process.xml'),
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
							url: getLibraryUrl('cart-process.xml'),
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
		exportHintPluginPath: exportHintPluginPath,
		entraClientId: entraClientId,
		entraTenantId: entraTenantId,
		accessControl: {
			mode: 'cloudflare-access',
			ownerConfigured: true
		},
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
