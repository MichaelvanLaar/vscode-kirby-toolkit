import * as vscode from 'vscode';
import { detectKirbyProject, resolveSnippetPath, snippetExists } from './utils/kirbyProject';
import { isAutoInjectTypeHintsEnabled } from './config/settings';
import { injectTypeHints, handleFileCreation } from './providers/typeHintProvider';
import { SnippetCodeLensProvider } from './providers/snippetCodeLens';
import { SnippetDefinitionProvider } from './providers/snippetDefinition';

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
 * Extension deactivation function
 */
export function deactivate() {
  console.log('Kirby CMS Developer Toolkit deactivated');
}
