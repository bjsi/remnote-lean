import {
  usePlugin,
  renderWidget,
  useRunAsync,
  WidgetLocation,
  useSessionStorageState,
} from '@remnote/plugin-sdk';
import { ToggleInlineProofEditor } from '../components/ToggleInlineProofEditor';
import { inlineEditorsOpenStatesKey } from '../lib/const';

export function OpenInlineProofEditor() {
  const plugin = usePlugin();
  const [openInlineEditors, setOpenInlineEditors] = useSessionStorageState<string[]>(
    inlineEditorsOpenStatesKey,
    []
  );
  const ctx = useRunAsync(
    () => plugin.widget.getWidgetContext<WidgetLocation.RightSideOfEditor>(),
    []
  );
  const remId = ctx?.remId;
  const isOpen = remId && openInlineEditors.includes(remId);

  async function toggleInlineProofEditor(remId: string) {
    if (openInlineEditors.includes(remId)) {
      await plugin.window.closeWidget('inline_proof_editor', { remId });
      remIdInlineEditorMap[remId] = false;
    } else {
      await plugin.app.registerWidget('inline_proof_editor', WidgetLocation.UnderRemEditor, {
        dimensions: { height: 'auto', width: '100%' },
        remIdFilter: remId,
      });
    }
  }
  return (
    <button
      onClick={() => {
        plugin.window.openWidgetInPane('proof_editor', {
          remId,
        });
      }}
    >
      {isOpen ? '🚫' : '🪟'}
    </button>
  );
}

renderWidget(OpenInlineProofEditor);
