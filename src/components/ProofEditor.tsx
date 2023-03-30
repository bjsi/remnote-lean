import { usePlugin, useAPIEventListener, AppEvents, useTracker } from '@remnote/plugin-sdk';
import React from 'react';
import { defaultProofText } from '../lib/const';
import { LeanEditor } from './LeanEditor';
import * as monaco from 'monaco-editor';

interface ProofEditorProps {
  remId: string;
  split: 'vertical' | 'horizontal';
}

export const ProofEditor = (props: ProofEditorProps) => {
  const plugin = usePlugin();
  const fn = monaco.Uri.file(`${props.remId}.lean`).fsPath;
  const rem = useTracker((rp) => rp.rem.findOne(props.remId), [props.remId]);
  const [isDarkMode, setDarkMode] = React.useState(false);
  useAPIEventListener(AppEvents.setDarkMode, undefined, ({ darkMode }) => {
    setDarkMode(darkMode);
  });
  return (
    <LeanEditor
      remId={props.remId}
      plugin={plugin}
      file={fn}
      initialValue={defaultProofText}
      isDarkMode={isDarkMode}
      split={props.split}
      // onValueChange={async (value) => {
      //   if (rem) {
      //     // await rem.setPowerupProperty...
      //   }
      // }}
    />
  );
};
