import { usePlugin, renderWidget, useRunAsync, WidgetLocation } from '@remnote/plugin-sdk';
import { ProofEditor } from '../components/ProofEditor';

export const InlineProofEditor = () => {
  const plugin = usePlugin();
  const ctx = useRunAsync(
    () => plugin.widget.getWidgetContext<WidgetLocation.UnderRemEditor>(),
    []
  );
  const remId = ctx?.remId;
  if (!remId) {
    return null;
  }
  return <ProofEditor remId={remId} split="vertical" />;
};

renderWidget(InlineProofEditor);
