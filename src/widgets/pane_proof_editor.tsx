import { usePlugin, renderWidget, useRunAsync, WidgetLocation } from '@remnote/plugin-sdk';
import { ProofEditor } from '../components/ProofEditor';

export const PaneProofEditor = () => {
  const plugin = usePlugin();
  const ctx = useRunAsync(() => plugin.widget.getWidgetContext<WidgetLocation.Pane>(), []);
  const data = ctx?.contextData;
  const remId = data?.remId;
  if (!remId) {
    return null;
  }
  return <ProofEditor remId={remId} split="vertical" />;
};

renderWidget(PaneProofEditor);
