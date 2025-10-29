import * as vscode from 'vscode';

/**
 * Registers the Reset Blueprint/Template Sync Prompts command
 */
export function registerResetSyncPromptsCommand(
  context: vscode.ExtensionContext,
  resetCallback: () => void
): void {
  const command = vscode.commands.registerCommand('kirby.resetSyncPrompts', () => {
    resetCallback();
  });

  context.subscriptions.push(command);
}
