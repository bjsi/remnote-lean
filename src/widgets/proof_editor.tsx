import { usePlugin, renderWidget, useRunAsync, WidgetLocation } from '@remnote/plugin-sdk';
import { LeanEditor } from '../components/LeanEditor';
import * as monaco from 'monaco-editor';
import { defaultProofText } from '../lib/const';

export const ProofEditor = () => {
  const plugin = usePlugin();
  const fn = monaco.Uri.file('test.lean').fsPath;
  const ctx = useRunAsync(() => plugin.widget.getWidgetContext<WidgetLocation.Pane>(), []);
  const data = ctx?.contextData;
  const remId = data?.remId;
  return (
    <LeanEditor
      file={fn}
      initialValue={defaultProofText}
      onValueChange={async (value) => {
        const rem = await plugin.rem.findOne(remId);
        if (rem) {
          // await rem.setBackText([value]);
        }
      }}
    />
  );
};

renderWidget(ProofEditor);
