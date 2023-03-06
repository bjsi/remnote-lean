import { declareIndexPlugin, ReactRNPlugin, WidgetLocation } from '@remnote/plugin-sdk';
import '../style.css';
import '../App.css';
import { defaultProofText, leanProofPowerupCode } from '../lib/const';

async function onActivate(plugin: ReactRNPlugin) {
  await registerLeanProofPowerup(plugin);
  await registerApplyLeanProofCommand(plugin);
  await registerProofEditorWidget(plugin);
  await registerOpenProofEditorWidget(plugin);
}

async function onDeactivate(_: ReactRNPlugin) {}

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
        await openProofEditorWidget(plugin, focused._id);
      }
    },
  });
}

async function registerProofEditorWidget(plugin: ReactRNPlugin) {
  await plugin.app.registerWidget('proof_editor', WidgetLocation.Pane, {
    dimensions: { height: 'auto', width: '100%' },
  });
}

async function registerOpenProofEditorWidget(plugin: ReactRNPlugin) {
  await plugin.app.registerWidget('open_proof_editor', WidgetLocation.RightSideOfEditor, {
    dimensions: { height: 'auto', width: 'auto' },
    powerupFilter: leanProofPowerupCode,
  });
}

async function openProofEditorWidget(plugin: ReactRNPlugin, remId: string) {
  await plugin.window.openWidgetInPane('proof_editor', {
    remId: remId,
  });
}

declareIndexPlugin(onActivate, onDeactivate);
