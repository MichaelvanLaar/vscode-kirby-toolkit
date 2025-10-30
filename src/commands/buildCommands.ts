import * as vscode from 'vscode';
import { BuildProcess } from '../integrations/buildIntegration';
import {  detectBuildScripts,
  getNpmCommand,
  hasPackageJson
} from '../utils/buildScriptDetector';

/**
 * Starts the build watcher (dev/watch mode)
 */
export async function startBuildWatcher(): Promise<void> {
  const buildProcess = BuildProcess.getInstance();

  // Check if already running
  if (buildProcess.isRunning()) {
    const action = await vscode.window.showWarningMessage(
      'Build watcher is already running. Restart it?',
      'Restart',
      'Cancel'
    );

    if (action === 'Restart') {
      await restartBuildWatcher();
    }
    return;
  }

  // Get workspace folder
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('No workspace folder found');
    return;
  }

  const workspacePath = workspaceFolder.uri.fsPath;

  // Check if package.json exists
  if (!(await hasPackageJson(workspacePath))) {
    vscode.window.showErrorMessage(
      'No package.json found in workspace root. Add a package.json with build scripts to use this feature.'
    );
    return;
  }

  try {
    // Detect build scripts
    const scripts = await detectBuildScripts(workspacePath);

    // Check for custom build command in settings
    const config = vscode.workspace.getConfiguration('kirby');
    const customCommand = config.get<string>('buildCommand');

    let command: string;

    if (customCommand && customCommand.trim() !== '') {
      // Use custom command
      command = customCommand;
    } else if (scripts.dev) {
      // Use detected dev script - default to "dev" command
      command = getNpmCommand('dev');
    } else if (scripts.watch) {
      // Use detected watch script
      command = getNpmCommand('watch');
    } else {
      // No suitable script found
      const action = await vscode.window.showErrorMessage(
        'No build script found in package.json. Configure a "dev" or "watch" script, or set a custom build command in settings.',
        'Configure'
      );

      if (action === 'Configure') {
        vscode.commands.executeCommand('workbench.action.openSettings', 'kirby.buildCommand');
      }
      return;
    }

    // Start build process
    buildProcess.start(command, workspacePath, workspaceFolder.name);

    vscode.window.showInformationMessage(`Build watcher started: ${command}`);
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to start build watcher: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Stops the build watcher
 */
export async function stopBuildWatcher(): Promise<void> {
  const buildProcess = BuildProcess.getInstance();

  if (!buildProcess.isRunning()) {
    vscode.window.showInformationMessage('No build watcher is running');
    return;
  }

  buildProcess.stop();
  vscode.window.showInformationMessage('Build watcher stopped');
}

/**
 * Restarts the build watcher
 */
export async function restartBuildWatcher(): Promise<void> {
  const buildProcess = BuildProcess.getInstance();

  // Get workspace folder
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('No workspace folder found');
    return;
  }

  const workspacePath = workspaceFolder.uri.fsPath;

  try {
    // Detect build scripts
    const scripts = await detectBuildScripts(workspacePath);

    // Check for custom build command in settings
    const config = vscode.workspace.getConfiguration('kirby');
    const customCommand = config.get<string>('buildCommand');

    let command: string;

    if (customCommand && customCommand.trim() !== '') {
      command = customCommand;
    } else if (scripts.dev) {
      command = getNpmCommand('dev');
    } else if (scripts.watch) {
      command = getNpmCommand('watch');
    } else {
      vscode.window.showErrorMessage('No build script found');
      return;
    }

    // Restart build process
    buildProcess.restart(command, workspacePath, workspaceFolder.name);

    vscode.window.showInformationMessage('Build watcher restarted');
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to restart build watcher: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Runs a one-time build (npm run build)
 */
export async function runBuildOnce(): Promise<void> {
  // Get workspace folder
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('No workspace folder found');
    return;
  }

  const workspacePath = workspaceFolder.uri.fsPath;

  // Check if package.json exists
  if (!(await hasPackageJson(workspacePath))) {
    vscode.window.showErrorMessage('No package.json found in workspace root');
    return;
  }

  try {
    // Detect build scripts
    const scripts = await detectBuildScripts(workspacePath);

    if (!scripts.build) {
      vscode.window.showErrorMessage(
        'No "build" script found in package.json. Add a build script to use this feature.'
      );
      return;
    }

    // Create one-time terminal for build
    const terminal = vscode.window.createTerminal({
      name: 'Kirby Build (One-time)',
      cwd: workspacePath,
      iconPath: new vscode.ThemeIcon('package'),
    });

    terminal.show();
    terminal.sendText(getNpmCommand('build'));

    vscode.window.showInformationMessage('Running one-time build...');
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to run build: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Shows the build terminal (focuses it)
 */
export async function showBuildTerminal(): Promise<void> {
  const buildProcess = BuildProcess.getInstance();

  if (!buildProcess.isRunning()) {
    vscode.window.showInformationMessage('No build watcher is running');
    return;
  }

  buildProcess.show();
}
