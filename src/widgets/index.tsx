import { declareIndexPlugin, ReactRNPlugin, WidgetLocation } from '@remnote/plugin-sdk';
import '../style.css';
import '../App.css';
import { defaultProofText, leanProofPowerupCode } from '../lib/const';

async function onActivate(plugin: ReactRNPlugin) {
  await registerLeanProofPowerup(plugin);
  await registerApplyLeanProofCommand(plugin);
  await registerPaneProofEditorWidget(plugin);
}

async function onDeactivate(_: ReactRNPlugin) {}

const remIdInlineEditorMap: Record<string, boolean> = {};

async function toggleInlineProofEditor(plugin: ReactRNPlugin, remId: string) {
  if (remIdInlineEditorMap[remId]) {
    await plugin.window.closeWidget('inline_proof_editor', { remId });
    remIdInlineEditorMap[remId] = false;
  } else {
    await plugin.app.registerWidget('inline_proof_editor', WidgetLocation.UnderRemEditor, {
      dimensions: { height: 'auto', width: '100%' },
      remIdFilter: remId,
    });
  }
}

async function registerLeanProofPowerup(plugin: ReactRNPlugin) {
  await plugin.app.registerPowerup(
    'Lean Proof',
    leanProofPowerupCode,
    'Represents a proof using Lean',
    {
      slots: [],
    }
  );
}

async function registerApplyLeanProofCommand(plugin: ReactRNPlugin) {
  await plugin.app.registerCommand({
    id: 'apply_lean_proof_powerup',
    name: 'Lean Proof',
    action: async () => {
      const focused = await plugin.focus.getFocusedRem();
      if (focused) {
        await focused.addPowerup(leanProofPowerupCode);
        await focused.setBackText([defaultProofText]);
        await openPaneProofEditorWidget(plugin, focused._id);
      }
    },
  });
}

async function registerPaneProofEditorWidget(plugin: ReactRNPlugin) {
  await plugin.app.registerWidget('proof_editor', WidgetLocation.Pane, {
    dimensions: { height: 'auto', width: '100%' },
  });
}

async function openPaneProofEditorWidget(plugin: ReactRNPlugin, remId: string) {
  await plugin.window.openWidgetInPane('pane_proof_editor', {
    remId: remId,
  });
}

declareIndexPlugin(onActivate, onDeactivate);
