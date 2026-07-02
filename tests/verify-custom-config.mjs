import { readFile } from 'node:fs/promises';
import { Script, createContext } from 'node:vm';
import { join, resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const preConfigPath = join(repoRoot, 'src/main/webapp/js/PreConfig.js');
const appConfigPath = join(repoRoot, 'src/main/webapp/custom-config/app-config.js');
const authConfigPath = join(repoRoot, 'src/main/webapp/custom-config/auth-msal.js');
const exportHintPluginPath = join(repoRoot, 'src/main/webapp/custom-config/export-pptx-hint.js');
const isoLibraryPath = join(repoRoot, 'src/main/webapp/custom-libraries/iso5807.xml');
const qualitySystemLibraryPath = join(repoRoot, 'src/main/webapp/custom-libraries/quality-system.xml');
const labTemplatesLibraryPath = join(repoRoot, 'src/main/webapp/custom-libraries/lab-templates.xml');
const antibodyProcessLibraryPath = join(repoRoot, 'src/main/webapp/custom-libraries/antibody-process.xml');
const cartProcessLibraryPath = join(repoRoot, 'src/main/webapp/custom-libraries/cart-process.xml');

const mxscriptCalls = [];
const preConfigContext = createContext({
  window: {},
  urlParams: {},
  mxscript: (source) => mxscriptCalls.push(source)
});

new Script(await readFile(preConfigPath, 'utf8'), { filename: preConfigPath }).runInContext(preConfigContext);

if (preConfigContext.window.BIOMED_CUSTOM_CONFIG_PATH !== 'custom-config/app-config.js') {
  throw new Error('PreConfig did not define the expected custom config path');
}

if (!mxscriptCalls.includes('custom-config/app-config.js')) {
  throw new Error('PreConfig did not load custom-config/app-config.js through mxscript');
}

if (preConfigContext.urlParams.sync !== 'manual') {
  throw new Error('PreConfig no longer preserves manual sync mode');
}

const appConfigMxscriptCalls = [];
const appConfigContext = createContext({
	window: {},
	urlParams: {},
	mxscript: (source) => appConfigMxscriptCalls.push(source)
});
new Script(await readFile(appConfigPath, 'utf8'), { filename: appConfigPath }).runInContext(appConfigContext);

const projectConfig = appConfigContext.window.BIOMED_FLOWCHART_EDITOR;

if (appConfigContext.window.BIOMED_APP_CONFIG_LOADED !== true) {
  throw new Error('Custom app config did not set the load flag');
}

if (projectConfig?.version !== '0.1.0' || projectConfig?.configLoaded !== true) {
	throw new Error('Custom app config did not expose the expected project namespace');
}

if (projectConfig?.authPluginPath !== 'custom-config/auth-msal.js') {
	throw new Error('Custom app config did not expose the expected auth plugin path');
}

if (projectConfig?.exportHintPluginPath !== 'custom-config/export-pptx-hint.js') {
	throw new Error('Custom app config did not expose the expected PPTX export hint plugin path');
}

if (projectConfig?.entraClientId !== '70d8b9a4-3050-4f09-9f6c-23edb16595b6' ||
	projectConfig?.entraTenantId !== 'a0485c91-c913-4c24-853d-30728fcb5843') {
	throw new Error('Custom app config did not expose the expected Entra identifiers');
}

if (projectConfig?.msalBrowserUrl !== 'https://alcdn.msauth.net/browser/3.7.1/js/msal-browser.min.js') {
	throw new Error('Custom app config did not expose the expected MSAL browser bundle URL');
}

if (projectConfig?.oneDriveConfig?.enablePersonalOneDrive !== false ||
	projectConfig?.oneDriveConfig?.enableMicrosoft365 !== true) {
	throw new Error('Custom app config did not expose the expected OneDrive for Business settings');
}

if (appConfigContext.urlParams.p !== 'custom-config/auth-msal.js;custom-config/export-pptx-hint.js') {
	throw new Error('Custom app config did not register the expected custom plugins in urlParams.p');
}

if (appConfigContext.urlParams.od !== '0' || appConfigContext.urlParams.ms365 !== '1') {
	throw new Error('Custom app config did not force the expected Microsoft 365 storage mode');
}

if (!appConfigMxscriptCalls.includes('custom-config/auth-msal.js')) {
	throw new Error('Custom app config did not preload the auth module through mxscript');
}

if (appConfigContext.window.DRAWIO_MSGRAPH_CLIENT_ID !== '70d8b9a4-3050-4f09-9f6c-23edb16595b6' ||
	appConfigContext.window.DRAWIO_MSGRAPH_TENANT_ID !== 'a0485c91-c913-4c24-853d-30728fcb5843') {
	throw new Error('Custom app config did not publish the expected Microsoft Graph app identifiers');
}

if (!Array.isArray(projectConfig.customLibraries)) {
	throw new Error('Custom app config did not initialize the custom library list');
}

const drawioConfig = appConfigContext.window.DRAWIO_CONFIG;

if (drawioConfig?.appendCustomLibraries !== true) {
  throw new Error('Custom app config did not append custom libraries through DRAWIO_CONFIG');
}

if (!drawioConfig?.defaultLibraries?.split(';').includes('iso5807')) {
  throw new Error('Custom app config did not enable the ISO 5807 custom library by default');
}

if (!drawioConfig?.defaultLibraries?.split(';').includes('quality-system')) {
  throw new Error('Custom app config did not enable the Quality System custom library by default');
}

if (!drawioConfig?.defaultLibraries?.split(';').includes('lab-templates')) {
  throw new Error('Custom app config did not enable the Lab Templates custom library by default');
}

if (!drawioConfig?.defaultLibraries?.split(';').includes('antibody-process')) {
  throw new Error('Custom app config did not enable the Antibody Process custom library by default');
}

if (!drawioConfig?.defaultLibraries?.split(';').includes('cart-process')) {
  throw new Error('Custom app config did not enable the CAR-T Process custom library by default');
}

const isoSection = drawioConfig?.libraries?.find((section) => section?.id === 'iso5807');
const isoEntry = isoSection?.entries?.find((entry) => entry?.id === 'iso5807');
const isoLib = isoEntry?.libs?.find((lib) => lib?.url === 'custom-libraries/iso5807.xml');

if (isoLib?.preload !== true || isoLib?.title?.main !== 'ISO 5807 Basic Symbols') {
  throw new Error('Custom app config did not register the expected ISO 5807 library entry');
}

const qualitySystemSection = drawioConfig?.libraries?.find((section) => section?.id === 'quality-system');
const qualitySystemEntry = qualitySystemSection?.entries?.find((entry) => entry?.id === 'quality-system');
const qualitySystemLib = qualitySystemEntry?.libs?.find((lib) => lib?.url === 'custom-libraries/quality-system.xml');

if (qualitySystemLib?.preload !== true || qualitySystemLib?.title?.main !== 'Quality System') {
  throw new Error('Custom app config did not register the expected Quality System library entry');
}

const labTemplatesSection = drawioConfig?.libraries?.find((section) => section?.id === 'lab-templates');
const labTemplatesEntry = labTemplatesSection?.entries?.find((entry) => entry?.id === 'lab-templates');
const labTemplatesLib = labTemplatesEntry?.libs?.find((lib) => lib?.url === 'custom-libraries/lab-templates.xml');

if (labTemplatesLib?.preload !== true || labTemplatesLib?.title?.main !== 'Lab Templates') {
  throw new Error('Custom app config did not register the expected Lab Templates library entry');
}

const antibodyProcessSection = drawioConfig?.libraries?.find((section) => section?.id === 'antibody-process');
const antibodyProcessEntry = antibodyProcessSection?.entries?.find((entry) => entry?.id === 'antibody-process');
const antibodyProcessLib = antibodyProcessEntry?.libs?.find((lib) => lib?.url === 'custom-libraries/antibody-process.xml');

if (antibodyProcessLib?.preload !== true || antibodyProcessLib?.title?.main !== 'Antibody Process') {
  throw new Error('Custom app config did not register the expected Antibody Process library entry');
}

const cartProcessSection = drawioConfig?.libraries?.find((section) => section?.id === 'cart-process');
const cartProcessEntry = cartProcessSection?.entries?.find((entry) => entry?.id === 'cart-process');
const cartProcessLib = cartProcessEntry?.libs?.find((lib) => lib?.url === 'custom-libraries/cart-process.xml');

if (cartProcessLib?.preload !== true || cartProcessLib?.title?.main !== 'CAR-T Process') {
  throw new Error('Custom app config did not register the expected CAR-T Process library entry');
}

const isoLibraryXml = await readFile(isoLibraryPath, 'utf8');
const libraryJson = isoLibraryXml.match(/<mxlibrary><!\[CDATA\[([\s\S]*)\]\]><\/mxlibrary>/)?.[1];

if (libraryJson == null) {
  throw new Error('ISO 5807 custom library is not wrapped in an mxlibrary CDATA block');
}

const libraryEntries = JSON.parse(libraryJson);

if (libraryEntries.length !== 19 || libraryEntries[0].id !== 'terminator') {
  throw new Error('ISO 5807 custom library does not contain the expected 19 shape entries');
}

if (!libraryEntries.every((entry) => entry.xml.includes('<mxGraphModel>') && entry.title)) {
  throw new Error('ISO 5807 custom library entries must include draw.io cell XML and tooltip titles');
}

const qualitySystemLibraryXml = await readFile(qualitySystemLibraryPath, 'utf8');
const qualitySystemLibraryJson = qualitySystemLibraryXml.match(/<mxlibrary><!\[CDATA\[([\s\S]*)\]\]><\/mxlibrary>/)?.[1];

if (qualitySystemLibraryJson == null) {
  throw new Error('Quality System custom library is not wrapped in an mxlibrary CDATA block');
}

const qualitySystemLibraryEntries = JSON.parse(qualitySystemLibraryJson);

if (qualitySystemLibraryEntries.length !== 10 || qualitySystemLibraryEntries[0].id !== 'change-control-impact') {
  throw new Error('Quality System custom library does not contain the expected 10 shape entries');
}

const labTemplatesLibraryXml = await readFile(labTemplatesLibraryPath, 'utf8');
const labTemplatesLibraryJson = labTemplatesLibraryXml.match(/<mxlibrary><!\[CDATA\[([\s\S]*)\]\]><\/mxlibrary>/)?.[1];

if (labTemplatesLibraryJson == null) {
  throw new Error('Lab Templates custom library is not wrapped in an mxlibrary CDATA block');
}

const labTemplatesLibraryEntries = JSON.parse(labTemplatesLibraryJson);

if (labTemplatesLibraryEntries.length !== 7 || labTemplatesLibraryEntries[0].id !== 'flow-cytometry') {
  throw new Error('Lab Templates custom library does not contain the expected 7 template entries');
}

const antibodyProcessLibraryXml = await readFile(antibodyProcessLibraryPath, 'utf8');
const antibodyProcessLibraryJson = antibodyProcessLibraryXml.match(/<mxlibrary><!\[CDATA\[([\s\S]*)\]\]><\/mxlibrary>/)?.[1];

if (antibodyProcessLibraryJson == null) {
  throw new Error('Antibody Process custom library is not wrapped in an mxlibrary CDATA block');
}

const antibodyProcessLibraryEntries = JSON.parse(antibodyProcessLibraryJson);

if (antibodyProcessLibraryEntries.length !== 15 || antibodyProcessLibraryEntries[0].id !== 'cell-line-development') {
  throw new Error('Antibody Process custom library does not contain the expected 15 entries');
}

const cartProcessLibraryXml = await readFile(cartProcessLibraryPath, 'utf8');
const cartProcessLibraryJson = cartProcessLibraryXml.match(/<mxlibrary><!\[CDATA\[([\s\S]*)\]\]><\/mxlibrary>/)?.[1];

if (cartProcessLibraryJson == null) {
  throw new Error('CAR-T Process custom library is not wrapped in an mxlibrary CDATA block');
}

const cartProcessLibraryEntries = JSON.parse(cartProcessLibraryJson);

if (cartProcessLibraryEntries.length !== 13 || cartProcessLibraryEntries[0].id !== 'leukapheresis') {
	throw new Error('CAR-T Process custom library does not contain the expected 13 entries');
}

const authConfigScript = await readFile(authConfigPath, 'utf8');
const exportHintScript = await readFile(exportHintPluginPath, 'utf8');

if (!authConfigScript.includes('70d8b9a4-3050-4f09-9f6c-23edb16595b6')) {
	throw new Error('MSAL auth config file does not include the expected client ID');
}

if (!authConfigScript.includes('a0485c91-c913-4c24-853d-30728fcb5843')) {
	throw new Error('MSAL auth config file does not include the expected tenant ID');
}

if (!exportHintScript.includes('help/pptx-export.html')) {
	throw new Error('PPTX export hint plugin does not reference the deployed help page');
}

console.log('Custom configuration entry point test passed');
