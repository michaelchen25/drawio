(function()
{
	'use strict';

	var root = window;
	var defaultLibraries = 'general;uml;er;bpmn;flowchart;basic;arrows2;iso5807';
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
