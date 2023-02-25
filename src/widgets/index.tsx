import { declareIndexPlugin, ReactRNPlugin, WidgetLocation } from '@remnote/plugin-sdk';
import '../style.css';
import '../App.css';
import { registerLeanLanguage } from '../lib/langservice';
import { LeanJsOpts } from 'lean-client-js-browser';

import { Buffer } from 'buffer';

// @ts-ignore
window.Buffer = Buffer;

const hostPrefix = './dist/';

const leanJsOpts: LeanJsOpts = {
  javascript: hostPrefix + 'lean_js_js.js',
  libraryZip: hostPrefix + 'library.zip',
  libraryMeta: hostPrefix + 'library.info.json',
  libraryOleanMap: hostPrefix + 'library.olean_map.json',
  libraryKey: 'library',
  webassemblyJs: hostPrefix + 'lean_js_wasm.js',
  webassemblyWasm: hostPrefix + 'lean_js_wasm.wasm',
  dbName: 'leanlibrary',
};

async function onActivate(plugin: ReactRNPlugin) {
  registerLeanLanguage(leanJsOpts);

  // Register settings
  await plugin.settings.registerStringSetting({
    id: 'name',
    title: 'What is your Name?',
    defaultValue: 'Bob',
  });

  await plugin.settings.registerBooleanSetting({
    id: 'pizza',
    title: 'Do you like pizza?',
    defaultValue: true,
  });

  await plugin.settings.registerNumberSetting({
    id: 'favorite-number',
    title: 'What is your favorite number?',
    defaultValue: 42,
  });

  // A command that inserts text into the editor if focused.
  await plugin.app.registerCommand({
    id: 'editor-command',
    name: 'Editor Command',
    action: async () => {
      plugin.editor.insertPlainText('Hello World!');
    },
  });

  // Show a toast notification to the user.
  await plugin.app.toast("I'm a toast!");

  // Register a sidebar widget.
  await plugin.app.registerWidget('sample_widget', WidgetLocation.RightSidebar, {
    dimensions: { height: 'auto', width: '100%' },
  });
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
