import { declareIndexPlugin, ReactRNPlugin, WidgetLocation } from '@remnote/plugin-sdk';
import '../style.css';
import { leanCodeSlotId, leanProofPowerupCode } from '../lib/const';

async function onActivate(plugin: ReactRNPlugin) {
  await registerLeanProofPowerup(plugin);
  await registerApplyLeanProofCommand(plugin);
  await registerOpenPaneProofEditorWidget(plugin);
  await registerPaneProofEditorWidget(plugin);
  await registerQueueWidget(plugin);
}

async function onDeactivate(_: ReactRNPlugin) {}

async function registerLeanProofPowerup(plugin: ReactRNPlugin) {
  await plugin.app.registerPowerup(
    'Lean Proof',
    leanProofPowerupCode,
    'Represents a proof using Lean',
    {
      slots: [
        {
          name: 'Lean',
          code: leanCodeSlotId,
          hidden: true,
        },
      ],
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
        await openPaneProofEditorWidget(plugin, focused._id);
      }
    },
  });
}

async function registerOpenPaneProofEditorWidget(plugin: ReactRNPlugin) {
  await plugin.app.registerWidget('open_proof_editor', WidgetLocation.RightSideOfEditor, {
    dimensions: { height: 'auto', width: '25px' },
    powerupFilter: leanProofPowerupCode,
  });
}

async function registerPaneProofEditorWidget(plugin: ReactRNPlugin) {
  await plugin.app.registerWidget('pane_proof_editor', WidgetLocation.Pane, {
    dimensions: { height: 'auto', width: '100%' },
  });
}

async function openPaneProofEditorWidget(plugin: ReactRNPlugin, remId: string) {
  await plugin.window.openWidgetInPane('pane_proof_editor', {
    remId: remId,
  });
}

async function registerQueueWidget(plugin: ReactRNPlugin) {
  await plugin.app.registerWidget('queue', WidgetLocation.Flashcard, {
    dimensions: { height: 'auto', width: '100%' },
  });
}

declareIndexPlugin(onActivate, onDeactivate);
