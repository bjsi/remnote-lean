import { declareIndexPlugin, ReactRNPlugin, WidgetLocation } from '@remnote/plugin-sdk';
import '../style.css';
import '../App.css';
import { defaultProofText, inlineEditorsOpenStatesKey, leanProofPowerupCode } from '../lib/const';

async function onActivate(plugin: ReactRNPlugin) {
  await registerLeanProofPowerup(plugin);
  await registerApplyLeanProofCommand(plugin);
  await registerPaneProofEditorWidget(plugin);
  await registerOpenInlineProofEditorButton(plugin);
  await plugin.storage.setSession(inlineEditorsOpenStatesKey, []);
}

async function onDeactivate(_: ReactRNPlugin) {}

async function registerOpenInlineProofEditorButton(plugin: ReactRNPlugin) {
  await plugin.app.registerWidget('toggle_inline_proof_editor', WidgetLocation.UnderRemEditor, {
    dimensions: { height: 'auto', width: '100%' },
    powerupFilter: leanProofPowerupCode,
  });
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
