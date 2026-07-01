import { readFile } from 'node:fs/promises';
import { Script, createContext } from 'node:vm';
import { join, resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const preConfigPath = join(repoRoot, 'src/main/webapp/js/PreConfig.js');
const appConfigPath = join(repoRoot, 'src/main/webapp/custom-config/app-config.js');
const isoLibraryPath = join(repoRoot, 'src/main/webapp/custom-libraries/iso5807.xml');

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

const appConfigContext = createContext({ window: {} });
new Script(await readFile(appConfigPath, 'utf8'), { filename: appConfigPath }).runInContext(appConfigContext);

const projectConfig = appConfigContext.window.BIOMED_FLOWCHART_EDITOR;

if (appConfigContext.window.BIOMED_APP_CONFIG_LOADED !== true) {
  throw new Error('Custom app config did not set the load flag');
}

if (projectConfig?.version !== '0.1.0' || projectConfig?.configLoaded !== true) {
  throw new Error('Custom app config did not expose the expected project namespace');
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

const isoSection = drawioConfig?.libraries?.find((section) => section?.id === 'iso5807');
const isoEntry = isoSection?.entries?.find((entry) => entry?.id === 'iso5807');
const isoLib = isoEntry?.libs?.find((lib) => lib?.url === 'custom-libraries/iso5807.xml');

if (isoLib?.preload !== true || isoLib?.title?.main !== 'ISO 5807 Basic Symbols') {
  throw new Error('Custom app config did not register the expected ISO 5807 library entry');
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

console.log('Custom configuration entry point test passed');
