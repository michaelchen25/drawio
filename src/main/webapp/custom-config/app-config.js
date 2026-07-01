(function()
{
	'use strict';

	var root = window;
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
		customLibraries: customLibraries
	};

	root.DRAWIO_CONFIG = Object.assign({}, root.DRAWIO_CONFIG || {}, {
		appendCustomLibraries: true,
		defaultLibraries: defaultLibraries,
		libraries: customLibraries
	});

	root.BIOMED_APP_CONFIG_LOADED = true;
})();
