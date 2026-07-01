import { readFile } from 'node:fs/promises';
import { Script, createContext } from 'node:vm';
import { join, resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const preConfigPath = join(repoRoot, 'src/main/webapp/js/PreConfig.js');
const appConfigPath = join(repoRoot, 'src/main/webapp/custom-config/app-config.js');
const testLibraryPath = join(repoRoot, 'src/main/webapp/custom-libraries/test-library.xml');

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

if (!drawioConfig?.defaultLibraries?.split(';').includes('biomed-test')) {
  throw new Error('Custom app config did not enable the test custom library by default');
}

const testSection = drawioConfig?.libraries?.find((section) => section?.id === 'biomed-test');
const testEntry = testSection?.entries?.find((entry) => entry?.id === 'biomed-test');
const testLib = testEntry?.libs?.find((lib) => lib?.url === 'custom-libraries/test-library.xml');

if (testLib?.preload !== true || testLib?.title?.main !== 'Biomed Test Shapes') {
  throw new Error('Custom app config did not register the expected test library entry');
}

const testLibraryXml = await readFile(testLibraryPath, 'utf8');
const libraryJson = testLibraryXml.match(/<mxlibrary><!\[CDATA\[([\s\S]*)\]\]><\/mxlibrary>/)?.[1];

if (libraryJson == null) {
  throw new Error('Test custom library is not wrapped in an mxlibrary CDATA block');
}

const libraryEntries = JSON.parse(libraryJson);

if (libraryEntries.length !== 1 || libraryEntries[0].title !== 'T-110 Test Process') {
  throw new Error('Test custom library does not contain the expected shape entry');
}

if (!libraryEntries[0].xml.includes('value="T-110 Test"') || !libraryEntries[0].xml.includes('rounded=0;whiteSpace=wrap;html=1;')) {
  throw new Error('Test custom library shape entry is missing the expected draw.io cell XML');
}

console.log('Custom configuration entry point test passed');
