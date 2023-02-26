import { declareIndexPlugin, ReactRNPlugin, WidgetLocation } from '@remnote/plugin-sdk';
import '../style.css';
import '../App.css';
import { registerLeanLanguage } from '../lib/langservice';
import { LeanJsOpts } from 'lean-client-js-browser';

async function onActivate(plugin: ReactRNPlugin) {
  registerLeanLanguage();

  // Register a sidebar widget.
  await plugin.app.registerWidget('sample_widget', WidgetLocation.RightSidebar, {
    dimensions: { height: 'auto', width: '100%' },
  });
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
