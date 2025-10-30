import * as vscode from 'vscode';
import { detectKirbyProject, resolveSnippetPath, snippetExists } from './utils/kirbyProject';
import { isAutoInjectTypeHintsEnabled } from './config/settings';
import { injectTypeHints, handleFileCreation } from './providers/typeHintProvider';
import { SnippetCodeLensProvider } from './providers/snippetCodeLens';
import { SnippetDefinitionProvider } from './providers/snippetDefinition';
import { registerNewPageTypeCommand } from './commands/pageTypeScaffolder';
import { registerExtractToSnippetCommand } from './commands/snippetExtractor';
import {
  initializeTailwindIntegration,
  registerConfigureTailwindCommand,
  registerResetTailwindPromptCommand
} from './integrations/tailwindIntegration';
import { BlueprintFieldCodeLensProvider, registerOpenBlueprintCommand } from './providers/blueprintFieldCodeLens';
import { FileNavigationDefinitionProvider } from './providers/fileNavigationProvider';
import { FileNavigationCodeLensProvider, registerOpenRelatedFileCommand } from './providers/fileNavigationCodeLens';
import { BlueprintTemplateSyncWatcher } from './providers/blueprintTemplateSyncWatcher';
import { registerResetSyncPromptsCommand } from './commands/resetSyncPrompts';
import { BuildProcess, BuildState } from './integrations/buildIntegration';
import {
  startBuildWatcher,
  stopBuildWatcher,
  restartBuildWatcher,
  runBuildOnce,
  showBuildTerminal
} from './commands/buildCommands';

// Global reference to sync watcher
let syncWatcher: BlueprintTemplateSyncWatcher | undefined;

// Global reference to build status bar
let buildStatusBar: vscode.StatusBarItem | undefined;

/**
 * Extension activation function
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('Kirby CMS Developer Toolkit is activating...');

  // Detect if this is a Kirby project
  const isKirbyProject = detectKirbyProject();
  if (!isKirbyProject) {
    console.log('Not a Kirby project - extension features disabled');
    return;
  }

  console.log('Kirby project detected - activating features');

  // Register Type-Hint Injection
  registerTypeHintFeatures(context);

  // Register Snippet Navigation
  registerSnippetNavigationFeatures(context);

  // Register Page Type Scaffolding
  registerNewPageTypeCommand(context);

  // Register Snippet Extraction
  registerExtractToSnippetCommand(context);

  // Register Tailwind Integration
  initializeTailwindIntegration(context);
  registerConfigureTailwindCommand(context);
  registerResetTailwindPromptCommand(context);

  // Register Blueprint Field CodeLens
  registerBlueprintFieldFeatures(context);

  // Register Extended File Navigation
  registerFileNavigationFeatures(context);

  // Register Blueprint/Template Synchronization
  registerBlueprintTemplateSyncFeatures(context);

  // Register Build Integration
  registerBuildIntegrationFeatures(context);

  console.log('Kirby CMS Developer Toolkit activated successfully!');
}

/**
 * Register type-hint injection features
 */
function registerTypeHintFeatures(context: vscode.ExtensionContext) {
  // Register command for manual type-hint injection
  const addTypeHintsCommand = vscode.commands.registerCommand('kirby.addTypeHints', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor found');
      return;
    }

    await injectTypeHints(editor.document);
  });

  // Register file creation listener for automatic injection
  if (isAutoInjectTypeHintsEnabled()) {
    const fileCreationListener = vscode.workspace.onDidCreateFiles(async (event) => {
      for (const file of event.files) {
        await handleFileCreation(file);
      }
    });

    context.subscriptions.push(fileCreationListener);
  }

  context.subscriptions.push(addTypeHintsCommand);
}

/**
 * Register snippet navigation features
 */
function registerSnippetNavigationFeatures(context: vscode.ExtensionContext) {
  // Register CodeLens provider
  const codeLensProvider = new SnippetCodeLensProvider();
  const codeLensDisposable = vscode.languages.registerCodeLensProvider(
    { language: 'php', pattern: '**/site/{templates,snippets}/**/*.php' },
    codeLensProvider
  );

  // Register Definition provider
  const definitionProvider = new SnippetDefinitionProvider();
  const definitionDisposable = vscode.languages.registerDefinitionProvider(
    { language: 'php', pattern: '**/site/{templates,snippets}/**/*.php' },
    definitionProvider
  );

  // Register command to open snippet
  const openSnippetCommand = vscode.commands.registerCommand(
    'kirby.openSnippet',
    async (snippetName: string) => {
      if (!snippetName) {
        vscode.window.showErrorMessage('No snippet name provided');
        return;
      }

      // Check if snippet exists
      if (!snippetExists(snippetName)) {
        vscode.window.showErrorMessage(`Snippet file not found: site/snippets/${snippetName}.php`);
        return;
      }

      // Resolve and open snippet
      const snippetPath = resolveSnippetPath(snippetName);
      if (snippetPath) {
        const uri = vscode.Uri.file(snippetPath);
        const document = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(document);
      }
    }
  );

  // Listen for configuration changes to refresh CodeLens
  const configChangeListener = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('kirby.showSnippetCodeLens')) {
      codeLensProvider.refresh();
    }
  });

  context.subscriptions.push(
    codeLensDisposable,
    definitionDisposable,
    openSnippetCommand,
    configChangeListener
  );
}

/**
 * Register Blueprint field features
 */
function registerBlueprintFieldFeatures(context: vscode.ExtensionContext) {
  // Register CodeLens provider
  const codeLensProvider = new BlueprintFieldCodeLensProvider(context);
  const codeLensDisposable = vscode.languages.registerCodeLensProvider(
    { language: 'php', pattern: '**/site/templates/**/*.php' },
    codeLensProvider
  );

  // Register open Blueprint command
  registerOpenBlueprintCommand(context);

  context.subscriptions.push(codeLensDisposable);
}

/**
 * Register file navigation features
 */
function registerFileNavigationFeatures(context: vscode.ExtensionContext) {
  // Register Definition provider for file navigation
  const definitionProvider = new FileNavigationDefinitionProvider();
  const definitionDisposable = vscode.languages.registerDefinitionProvider(
    { language: 'php', pattern: '**/site/{templates,controllers,models}/**/*.php' },
    definitionProvider
  );

  // Register CodeLens provider for file navigation
  const codeLensProvider = new FileNavigationCodeLensProvider();
  const codeLensDisposable = vscode.languages.registerCodeLensProvider(
    { language: 'php', pattern: '**/site/{templates,controllers,models}/**/*.php' },
    codeLensProvider
  );

  // Register open related file command
  registerOpenRelatedFileCommand(context);

  context.subscriptions.push(definitionDisposable, codeLensDisposable);
}

/**
 * Register Blueprint/Template synchronization features
 */
function registerBlueprintTemplateSyncFeatures(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('kirby');
  const enabled = config.get<boolean>('enableBlueprintTemplateSync', true);

  if (!enabled) {
    return;
  }

  // Initialize sync watcher
  syncWatcher = new BlueprintTemplateSyncWatcher(context);
  syncWatcher.activate();

  // Register reset command
  registerResetSyncPromptsCommand(context, () => {
    syncWatcher?.resetDismissedPrompts();
  });
}

/**
 * Register build integration features
 */
function registerBuildIntegrationFeatures(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('kirby');
  const enabled = config.get<boolean>('enableBuildIntegration', true);

  if (!enabled) {
    return;
  }

  // Create status bar item
  buildStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  buildStatusBar.command = 'kirby.showBuildTerminal';
  buildStatusBar.tooltip = 'Kirby Build Status - Click to show terminal';
  context.subscriptions.push(buildStatusBar);

  // Initialize build process and register state change listener
  const buildProcess = BuildProcess.getInstance();
  buildProcess.onStateChange((state: BuildState) => {
    updateBuildStatusBar(state);
  });

  // Update initial state
  updateBuildStatusBar(buildProcess.getState());

  // Register build commands
  context.subscriptions.push(
    vscode.commands.registerCommand('kirby.startBuildWatcher', startBuildWatcher),
    vscode.commands.registerCommand('kirby.stopBuildWatcher', stopBuildWatcher),
    vscode.commands.registerCommand('kirby.restartBuildWatcher', restartBuildWatcher),
    vscode.commands.registerCommand('kirby.runBuildOnce', runBuildOnce),
    vscode.commands.registerCommand('kirby.showBuildTerminal', showBuildTerminal)
  );

  // Auto-start build if configured
  const autoStart = config.get<boolean>('buildAutoStart', false);
  if (autoStart) {
    const delay = config.get<number>('buildAutoStartDelay', 2000);
    setTimeout(async () => {
      // Check if build terminal already exists
      if (!buildProcess.isRunning()) {
        // Check workspace state to see if we've shown the notification
        const hasShownNotification = context.workspaceState.get('buildAutoStartNotificationShown', false);

        if (!hasShownNotification) {
          vscode.window.showInformationMessage(
            'Kirby Toolkit auto-started build process. Disable in settings if not desired.',
            'Disable'
          ).then((action) => {
            if (action === 'Disable') {
              config.update('buildAutoStart', false, vscode.ConfigurationTarget.Workspace);
            }
          });
          context.workspaceState.update('buildAutoStartNotificationShown', true);
        }

        await startBuildWatcher();
      }
    }, delay);
  }
}

/**
 * Updates the build status bar based on build state
 */
function updateBuildStatusBar(state: BuildState) {
  if (!buildStatusBar) {
    return;
  }

  switch (state) {
    case BuildState.Idle:
      buildStatusBar.text = '⚫ No build';
      buildStatusBar.backgroundColor = undefined;
      buildStatusBar.show();
      break;

    case BuildState.Building:
      buildStatusBar.text = '🔨 Building';
      buildStatusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
      buildStatusBar.show();
      break;

    case BuildState.Ready:
      buildStatusBar.text = '✅ Build ready';
      buildStatusBar.backgroundColor = undefined;
      buildStatusBar.show();
      break;

    case BuildState.Error:
      buildStatusBar.text = '❌ Build error';
      buildStatusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
      buildStatusBar.show();
      break;
  }
}

/**
 * Extension deactivation function
 */
export function deactivate() {
  // Clean up sync watcher
  if (syncWatcher) {
    syncWatcher.deactivate();
    syncWatcher = undefined;
  }

  // Clean up build process
  const buildProcess = BuildProcess.getInstance();
  buildProcess.dispose();

  // Clean up status bar
  if (buildStatusBar) {
    buildStatusBar.dispose();
    buildStatusBar = undefined;
  }

  console.log('Kirby CMS Developer Toolkit deactivated');
}
