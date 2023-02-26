import { declareIndexPlugin, ReactRNPlugin, WidgetLocation } from '@remnote/plugin-sdk';
import '../style.css';
import '../App.css';
import { defaultProofText, leanProofPowerupCode } from '../lib/const';

async function onActivate(plugin: ReactRNPlugin) {
  await plugin.app.registerPowerup(
    'Lean Proof',
    leanProofPowerupCode,
    'Represents a proof using Lean',
    {
      slots: [],
    }
  );

  await plugin.app.registerCommand({
    id: 'apply_lean_proof_powerup',
    name: 'Lean Proof',
    action: async () => {
      const focused = await plugin.focus.getFocusedRem();
      if (focused) {
        await focused.addPowerup(leanProofPowerupCode);
        await focused.setBackText([defaultProofText]);
        await plugin.window.openWidgetInPane('proof_editor', {
          remId: focused._id,
        });
      }
    },
  });

  await plugin.app.registerWidget('proof_editor', WidgetLocation.Pane, {
    dimensions: { height: 'auto', width: '100%' },
  });

  await plugin.app.registerWidget('open_proof_editor', WidgetLocation.RightSideOfEditor, {
    dimensions: { height: 'auto', width: 'auto' },
    powerupFilter: leanProofPowerupCode,
  });
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
