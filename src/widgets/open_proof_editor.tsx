import { usePlugin, renderWidget, useRunAsync, WidgetLocation } from '@remnote/plugin-sdk';

export const OpenProofEditor = () => {
  const plugin = usePlugin();
  const ctx = useRunAsync(
    () => plugin.widget.getWidgetContext<WidgetLocation.RightSideOfEditor>(),
    []
  );
  const remId = ctx?.remId;
  return (
    <button
      onClick={() => {
        plugin.window.openWidgetInPane('proof_editor', {
          remId,
        });
      }}
    >
      🪟
    </button>
  );
};

renderWidget(OpenProofEditor);
