import { readFile } from 'node:fs/promises';
import { Script, createContext } from 'node:vm';
import { join, resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const adminIndexPath = join(repoRoot, 'src/main/webapp/admin/index.html');
const adminDataPath = join(repoRoot, 'src/main/webapp/admin/data.js');
const adminAppPath = join(repoRoot, 'src/main/webapp/admin/app.js');
const appConfigPath = join(repoRoot, 'src/main/webapp/custom-config/app-config.js');
const tooltipPath = join(repoRoot, 'src/main/webapp/custom-libraries/tooltips.json');

const libraryFiles = {
	iso5807: 'custom-libraries/iso5807.xml',
	'quality-system': 'custom-libraries/quality-system.xml',
	'lab-templates': 'custom-libraries/lab-templates.xml',
	'antibody-process': 'custom-libraries/antibody-process.xml',
	'cart-process': 'custom-libraries/cart-process.xml'
};

function createElement(tagName)
{
	return {
		tagName,
		children: [],
		className: '',
		textContent: '',
		attributes: {},
		style: {},
		appendChild(child)
		{
			this.children.push(child);
			return child;
		},
		setAttribute(name, value)
		{
			this.attributes[name] = value;
		}
	};
}

const adminHtml = await readFile(adminIndexPath, 'utf8');

for (const phrase of [
	'Admin Dashboard',
	'id="snapshotGrid"',
	'id="libraryTableBody"',
	'id="usageTableBody"',
	'id="groupTableBody"',
	'src="data.js"',
	'src="app.js"'
])
{
	if (!adminHtml.includes(phrase))
	{
		throw new Error(`Admin dashboard HTML is missing expected content: ${phrase}`);
	}
}

const appConfigContext = createContext({window: {}, urlParams: {}});
new Script(await readFile(appConfigPath, 'utf8'), {filename: appConfigPath}).runInContext(appConfigContext);
const customLibraries = appConfigContext.window.BIOMED_FLOWCHART_EDITOR?.customLibraries || [];
const tooltipData = JSON.parse(await readFile(tooltipPath, 'utf8'));

const elements = {
	snapshotGrid: createElement('div'),
	libraryTableBody: createElement('tbody'),
	usageTableBody: createElement('tbody'),
	groupTableBody: createElement('tbody')
};

const documentStub = {
	readyState: 'complete',
	createElement,
	getElementById(id)
	{
		return elements[id];
	},
	addEventListener()
	{
	}
};

const context = createContext({
	window: {
		document: documentStub
	},
	document: documentStub
});

new Script(await readFile(adminDataPath, 'utf8'), {filename: adminDataPath}).runInContext(context);
new Script(await readFile(adminAppPath, 'utf8'), {filename: adminAppPath}).runInContext(context);

const adminData = context.window.BIOMED_ADMIN_DATA;

if (adminData == null)
{
	throw new Error('Admin dashboard data script did not define BIOMED_ADMIN_DATA');
}

if (adminData.libraries.length !== customLibraries.length)
{
	throw new Error('Admin dashboard library registry count does not match custom app config');
}

for (let i = 0; i < customLibraries.length; i++)
{
	const section = customLibraries[i];
	const registryEntry = adminData.libraries[i];

	if (registryEntry.id !== section.id || registryEntry.title !== section.title.main)
	{
		throw new Error(`Admin dashboard library registry is out of sync for ${section.id}`);
	}

	const xmlPath = join(repoRoot, 'src/main/webapp', libraryFiles[registryEntry.id]);
	const xml = await readFile(xmlPath, 'utf8');
	const json = xml.match(/<mxlibrary><!\[CDATA\[([\s\S]*)\]\]><\/mxlibrary>/)?.[1];
	const entries = JSON.parse(json);

	if (registryEntry.presets !== entries.length)
	{
		throw new Error(`Admin dashboard preset count is incorrect for ${registryEntry.id}`);
	}
}

if (adminData.snapshot[0]?.value !== String(customLibraries.length))
{
	throw new Error('Admin dashboard snapshot does not report the expected custom library count');
}

const totalPresets = adminData.libraries.reduce((sum, item) => sum + item.presets, 0);

if (adminData.snapshot[1]?.value !== String(totalPresets))
{
	throw new Error('Admin dashboard snapshot does not report the expected preset total');
}

if (adminData.snapshot[2]?.value !== '2 / 2' ||
	tooltipData.metadata?.reviewStatus?.iso5807 !== 'ready' ||
	tooltipData.metadata?.reviewStatus?.biomed !== 'ready')
{
	throw new Error('Admin dashboard tooltip readiness summary is incorrect');
}

if (elements.snapshotGrid.children.length !== adminData.snapshot.length)
{
	throw new Error('Admin dashboard did not render the expected snapshot tiles');
}

if (elements.libraryTableBody.children.length !== adminData.libraries.length)
{
	throw new Error('Admin dashboard did not render the expected library table rows');
}

if (elements.usageTableBody.children.length !== adminData.usage.length)
{
	throw new Error('Admin dashboard did not render the expected usage table rows');
}

if (elements.groupTableBody.children.length !== adminData.groups.length)
{
	throw new Error('Admin dashboard did not render the expected group mapping rows');
}

console.log('Admin dashboard validation passed');
