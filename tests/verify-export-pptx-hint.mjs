import { readFile } from 'node:fs/promises';
import { Script, createContext } from 'node:vm';
import { join, resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const pluginPath = join(repoRoot, 'src/main/webapp/custom-config/export-pptx-hint.js');
const helpPagePath = join(repoRoot, 'src/main/webapp/help/pptx-export.html');

function createElement(tagName)
{
	return {
		tagName,
		children: [],
		attributes: {},
		style: {},
		className: '',
		textContent: '',
		appendChild(child)
		{
			this.children.push(child);
			return child;
		},
		setAttribute(name, value)
		{
			this.attributes[name] = value;
		},
		querySelector(selector)
		{
			if (selector.charAt(0) === '.')
			{
				const className = selector.substring(1);

				if (String(this.className || '').split(/\s+/).includes(className))
				{
					return this;
				}
			}

			for (const child of this.children)
			{
				if (typeof child.querySelector === 'function')
				{
					const match = child.querySelector(selector);

					if (match != null)
					{
						return match;
					}
				}
			}

			return null;
		}
	};
}

const pluginCalls = [];
const context = createContext({
	window: {
		Draw: {
			loadPlugin(callback)
			{
				pluginCalls.push(callback);
			}
		},
		document: {
			createElement
		},
		ExportDialog: function()
		{
			this.container = createElement('div');
		}
	},
	Draw: {
		loadPlugin(callback)
		{
			pluginCalls.push(callback);
		}
	}
});

new Script(await readFile(pluginPath, 'utf8'), {filename: pluginPath}).runInContext(context);

if (context.window.BIOMED_PPTX_EXPORT_HINT_LOADED !== true)
{
	throw new Error('PPTX export hint plugin did not set the expected load flag');
}

if (pluginCalls.length !== 1)
{
	throw new Error('PPTX export hint plugin did not register exactly one draw.io plugin');
}

pluginCalls[0]();

if (context.window.ExportDialog.biomedPptxHintPatched !== true)
{
	throw new Error('PPTX export hint plugin did not patch ExportDialog');
}

const dialog = new context.window.ExportDialog();
const hintSection = dialog.container.querySelector('.biomedPptxHint');

if (hintSection == null)
{
	throw new Error('PPTX export hint plugin did not append the export hint section');
}

const hintLink = hintSection.children.find((child) => child.tagName === 'a');

if (hintLink?.attributes?.href !== 'help/pptx-export.html')
{
	throw new Error('PPTX export hint plugin did not attach the expected help-page link');
}

const helpPage = await readFile(helpPagePath, 'utf8');

for (const phrase of [
	'File -&gt; Export as -&gt; SVG',
	'Convert to Shape',
	'does not provide one-click PPTX export',
	'OneDrive'
])
{
	if (!helpPage.includes(phrase))
	{
		throw new Error(`Missing expected help-page phrase: ${phrase}`);
	}
}

console.log('PPTX export hint validation passed');
