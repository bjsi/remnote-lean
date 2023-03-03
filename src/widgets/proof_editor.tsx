import {
  usePlugin,
  renderWidget,
  useRunAsync,
  WidgetLocation,
  AppEvents,
  useAPIEventListener,
} from '@remnote/plugin-sdk';
import { LeanEditor } from '../components/LeanEditor';
import * as monaco from 'monaco-editor';
import { defaultProofText } from '../lib/const';
import React from 'react';

export const ProofEditor = () => {
  const plugin = usePlugin();
  const fn = monaco.Uri.file('test.lean').fsPath;
  const ctx = useRunAsync(() => plugin.widget.getWidgetContext<WidgetLocation.Pane>(), []);
  const data = ctx?.contextData;
  const remId = data?.remId;
  const rem = useRunAsync(() => plugin.rem.findOne(remId), [remId]);
  const [isDarkMode, setDarkMode] = React.useState(false);
  useAPIEventListener(AppEvents.setDarkMode, undefined, ({ darkMode }) => {
    setDarkMode(darkMode);
  });
  return (
    <LeanEditor
      remId={remId}
      plugin={plugin}
      file={fn}
      initialValue={defaultProofText}
      isDarkMode={isDarkMode}
      // onValueChange={async (value) => {
      //   if (rem) {
      //     // await rem.setBackText([value]);
      //   }
      // }}
    />
  );
};

renderWidget(ProofEditor);
