import { readFile } from 'node:fs/promises';
import { Script, createContext } from 'node:vm';
import { join, resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const preConfigPath = join(repoRoot, 'src/main/webapp/js/PreConfig.js');
const appConfigPath = join(repoRoot, 'src/main/webapp/custom-config/app-config.js');

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

console.log('Custom configuration entry point test passed');
