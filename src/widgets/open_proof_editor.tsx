import { usePlugin, renderWidget, useRunAsync, WidgetLocation } from '@remnote/plugin-sdk';

export const OpenProofEditor = () => {
  const plugin = usePlugin();
  const ctx = useRunAsync(
    () => plugin.widget.getWidgetContext<WidgetLocation.RightSideOfEditor>(),
    []
  );
  const remId = ctx?.remId;
  return (
    <div className="flex items-center justify-center">
      <button
        className="flex items-center justify-center "
        onClick={() => {
          plugin.window.openWidgetInPane('pane_proof_editor', {
            remId,
          });
        }}
      >
        <div>👨‍💻</div>
      </button>
    </div>
  );
};

renderWidget(OpenProofEditor);
