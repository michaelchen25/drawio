(function()
{
	'use strict';

	var root = window;
	var defaultLibraries = 'general;uml;er;bpmn;flowchart;basic;arrows2;biomed-test';
	var customLibraries = [
		{
			id: 'biomed-test',
			title: {
				main: 'Biomed Test Library'
			},
			entries: [
				{
					id: 'biomed-test',
					title: {
						main: 'Biomed Test Library'
					},
					libs: [
						{
							title: {
								main: 'Biomed Test Shapes'
							},
							url: 'custom-libraries/test-library.xml',
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
