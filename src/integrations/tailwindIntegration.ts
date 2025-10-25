import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { detectTailwind, isTailwindExtensionInstalled } from '../utils/tailwindDetector';

const TAILWIND_PROMPT_STATE_KEY = 'kirby.tailwind.promptShown';

/**
 * Initializes Tailwind CSS integration
 */
export async function initializeTailwindIntegration(context: vscode.ExtensionContext): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return;
  }

  const workspaceFolder = workspaceFolders[0];

  // Check if integration is enabled
  const config = vscode.workspace.getConfiguration('kirby');
  const integrationEnabled = config.get<boolean>('enableTailwindIntegration', true);

  if (!integrationEnabled) {
    return;
  }

  // Detect Tailwind
  const detection = detectTailwind(workspaceFolder);

  if (detection.isInstalled) {
    await handleTailwindDetected(context, workspaceFolder);
  }

  // Set up file watcher for package.json changes
  setupPackageJsonWatcher(context, workspaceFolder);
}

/**
 * Handles when Tailwind CSS is detected
 */
async function handleTailwindDetected(
  context: vscode.ExtensionContext,
  workspaceFolder: vscode.WorkspaceFolder
): Promise<void> {
  // Check if we've already prompted
  const promptShown = context.workspaceState.get<boolean>(TAILWIND_PROMPT_STATE_KEY, false);

  // Check if settings are already configured
  const config = vscode.workspace.getConfiguration('tailwindCSS');
  const includeLanguages = config.get<Record<string, string>>('includeLanguages', {});

  if (includeLanguages.php === 'html') {
    // Already configured
    return;
  }

  if (promptShown) {
    // Already prompted, user declined
    return;
  }

  // Check if Tailwind extension is installed
  if (!isTailwindExtensionInstalled()) {
    const choice = await vscode.window.showInformationMessage(
      'Install Tailwind CSS IntelliSense extension for PHP template support',
      'Install',
      'Not Now'
    );

    if (choice === 'Install') {
      vscode.commands.executeCommand(
        'workbench.extensions.installExtension',
        'bradlc.vscode-tailwindcss'
      );
    }

    context.workspaceState.update(TAILWIND_PROMPT_STATE_KEY, true);
    return;
  }

  // Prompt user to enable integration
  const choice = await vscode.window.showInformationMessage(
    'Tailwind CSS detected. Enable IntelliSense for PHP templates?',
    'Yes',
    'No'
  );

  context.workspaceState.update(TAILWIND_PROMPT_STATE_KEY, true);

  if (choice === 'Yes') {
    await configureTailwindSettings(workspaceFolder);
  }
}

/**
 * Configures Tailwind CSS settings for PHP files
 */
export async function configureTailwindSettings(workspaceFolder: vscode.WorkspaceFolder): Promise<void> {
  try {
    const settingsPath = path.join(workspaceFolder.uri.fsPath, '.vscode', 'settings.json');
    const settingsDir = path.dirname(settingsPath);

    // Create .vscode directory if it doesn't exist
    if (!fs.existsSync(settingsDir)) {
      fs.mkdirSync(settingsDir, { recursive: true });
    }

    let settings: Record<string, unknown> = {};

    // Read existing settings
    if (fs.existsSync(settingsPath)) {
      try {
        const content = fs.readFileSync(settingsPath, 'utf8');
        settings = JSON.parse(content);
      } catch (error) {
        vscode.window.showWarningMessage(
          'Cannot update settings due to invalid JSON. Please fix .vscode/settings.json manually.'
        );
        return;
      }
    }

    // Update settings
    const includeLanguages = (settings['tailwindCSS.includeLanguages'] as Record<string, string>) || {};
    includeLanguages.php = 'html';
    settings['tailwindCSS.includeLanguages'] = includeLanguages;

    // Write settings
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');

    vscode.window.showInformationMessage('Tailwind CSS IntelliSense configured for PHP templates');
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to update settings: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Sets up a file watcher for package.json changes
 */
function setupPackageJsonWatcher(
  context: vscode.ExtensionContext,
  workspaceFolder: vscode.WorkspaceFolder
): void {
  const packageJsonPath = path.join(workspaceFolder.uri.fsPath, 'package.json');
  const watcher = vscode.workspace.createFileSystemWatcher(packageJsonPath);

  watcher.onDidChange(async () => {
    const detection = detectTailwind(workspaceFolder);
    if (detection.isInstalled) {
      await handleTailwindDetected(context, workspaceFolder);
    }
  });

  watcher.onDidCreate(async () => {
    const detection = detectTailwind(workspaceFolder);
    if (detection.isInstalled) {
      await handleTailwindDetected(context, workspaceFolder);
    }
  });

  context.subscriptions.push(watcher);
}

/**
 * Registers the manual Tailwind configuration command
 */
export function registerConfigureTailwindCommand(context: vscode.ExtensionContext): void {
  const command = vscode.commands.registerCommand('kirby.configureTailwind', async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('No workspace folder open');
      return;
    }

    await configureTailwindSettings(workspaceFolders[0]);
  });

  context.subscriptions.push(command);
}

/**
 * Registers the reset Tailwind prompt command
 */
export function registerResetTailwindPromptCommand(context: vscode.ExtensionContext): void {
  const command = vscode.commands.registerCommand('kirby.resetTailwindPrompt', async () => {
    context.workspaceState.update(TAILWIND_PROMPT_STATE_KEY, false);
    vscode.window.showInformationMessage('Tailwind integration prompt has been reset');
  });

  context.subscriptions.push(command);
}
