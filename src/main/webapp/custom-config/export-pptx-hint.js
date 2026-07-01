(function()
{
	'use strict';

	var root = window;
	var pluginId = 'custom-config/export-pptx-hint.js';
	var helpPagePath = 'help/pptx-export.html';

	function writeText(node, text)
	{
		if (root.mxUtils != null && typeof root.mxUtils.write === 'function')
		{
			root.mxUtils.write(node, text);
		}
		else
		{
			node.textContent = text;
		}
	}

	function appendHint(container)
	{
		if (container == null || root.document == null ||
			typeof root.document.createElement !== 'function')
		{
			return;
		}

		if (typeof container.querySelector === 'function' &&
			container.querySelector('.biomedPptxHint') != null)
		{
			return;
		}

		var section = root.document.createElement('div');
		section.className = 'geDialogSection biomedPptxHint';
		section.style.paddingTop = '4px';

		var note = root.document.createElement('div');
		note.style.fontSize = '12px';
		note.style.lineHeight = '1.4';
		writeText(note,
			'PPTX in this MVP uses manual SVG conversion. Standard ISO 5807 shapes usually convert best.'
		);
		section.appendChild(note);

		var link = root.document.createElement('a');
		link.setAttribute('href', helpPagePath);
		link.setAttribute('target', '_blank');
		link.setAttribute('rel', 'noopener noreferrer');
		link.style.display = 'inline-block';
		link.style.marginTop = '6px';
		writeText(link, 'Open PPTX manual conversion guide');
		section.appendChild(link);

		container.appendChild(section);
	}

	function copyStaticProperties(source, target)
	{
		var names = Object.getOwnPropertyNames(source);

		for (var i = 0; i < names.length; i++)
		{
			var name = names[i];

			if (name === 'prototype' || name === 'name' || name === 'length')
			{
				continue;
			}

			Object.defineProperty(target, name,
				Object.getOwnPropertyDescriptor(source, name));
		}
	}

	function patchExportDialog()
	{
		var OriginalExportDialog = root.ExportDialog;

		if (typeof OriginalExportDialog !== 'function' ||
			OriginalExportDialog.biomedPptxHintPatched === true)
		{
			return false;
		}

		var WrappedExportDialog = function(editorUi)
		{
			OriginalExportDialog.apply(this, arguments);
			appendHint(this.container);
		};

		WrappedExportDialog.prototype = OriginalExportDialog.prototype;
		copyStaticProperties(OriginalExportDialog, WrappedExportDialog);
		WrappedExportDialog.biomedPptxHintPatched = true;
		WrappedExportDialog.originalExportDialog = OriginalExportDialog;

		root.ExportDialog = WrappedExportDialog;

		return true;
	}

	function registerPlugin()
	{
		patchExportDialog();
	}

	root.BIOMED_FLOWCHART_EDITOR = root.BIOMED_FLOWCHART_EDITOR || {};
	root.BIOMED_FLOWCHART_EDITOR.exportHint = {
		pluginId: pluginId,
		helpPagePath: helpPagePath,
		patchExportDialog: patchExportDialog,
		appendHint: appendHint
	};

	root.BIOMED_PPTX_EXPORT_HINT_LOADED = true;

	if (root.Draw != null && typeof root.Draw.loadPlugin === 'function')
	{
		root.Draw.loadPlugin(registerPlugin);
	}
})();
