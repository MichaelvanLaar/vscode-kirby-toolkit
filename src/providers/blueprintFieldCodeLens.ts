import * as vscode from 'vscode';
import * as fs from 'fs';
import {
  isTemplateFile,
  resolveBlueprintForTemplate,
  getWorkspaceRoot
} from '../utils/kirbyProject';
import { parseBlueprint, formatFieldsForDisplay, BlueprintData } from '../utils/yamlParser';

/**
 * Cache for parsed Blueprint data
 */
const blueprintCache = new Map<string, BlueprintData>();

/**
 * Provides CodeLens for Blueprint fields in template files
 */
export class BlueprintFieldCodeLensProvider implements vscode.CodeLensProvider {
  private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
  public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

  constructor(context: vscode.ExtensionContext) {
    // Set up file watcher for Blueprint changes
    const workspaceRoot = getWorkspaceRoot();
    if (workspaceRoot) {
      const blueprintPattern = new vscode.RelativePattern(workspaceRoot, 'site/blueprints/**/*.yml');
      const watcher = vscode.workspace.createFileSystemWatcher(blueprintPattern);

      watcher.onDidChange(uri => {
        blueprintCache.delete(uri.fsPath);
        this._onDidChangeCodeLenses.fire();
      });

      watcher.onDidCreate(() => {
        this._onDidChangeCodeLenses.fire();
      });

      watcher.onDidDelete(uri => {
        blueprintCache.delete(uri.fsPath);
        this._onDidChangeCodeLenses.fire();
      });

      context.subscriptions.push(watcher);
    }
  }

  public provideCodeLenses(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
    const config = vscode.workspace.getConfiguration('kirby');
    const enabled = config.get<boolean>('showBlueprintFieldCodeLens', true);

    if (!enabled) {
      return [];
    }

    // Only show for template files
    if (!isTemplateFile(document.uri.fsPath)) {
      return [];
    }

    const blueprintPath = resolveBlueprintForTemplate(document.uri.fsPath);
    if (!blueprintPath) {
      return [];
    }

    // Parse Blueprint
    const blueprintData = this.getBlueprintData(blueprintPath);
    if (!blueprintData || blueprintData.fields.length === 0) {
      return [];
    }

    // Get settings
    const showTypes = config.get<boolean>('showBlueprintFieldTypes', false);
    const displayLimit = config.get<number>('blueprintFieldDisplayLimit', 5);

    // Format fields for display
    const fieldsDisplay = formatFieldsForDisplay(blueprintData.fields, showTypes, displayLimit);

    // Create CodeLens on line 1
    const range = new vscode.Range(0, 0, 0, 0);
    const codeLens = new vscode.CodeLens(range, {
      title: `Blueprint Fields: ${fieldsDisplay}`,
      command: 'kirby.openBlueprint',
      arguments: [blueprintPath]
    });

    return [codeLens];
  }

  /**
   * Gets Blueprint data from cache or parses it
   */
  private getBlueprintData(blueprintPath: string): BlueprintData | null {
    // Check cache
    if (blueprintCache.has(blueprintPath)) {
      return blueprintCache.get(blueprintPath)!;
    }

    // Check file size
    try {
      const stats = fs.statSync(blueprintPath);
      if (stats.size > 500 * 1024) {
        // File too large, skip parsing
        return null;
      }
    } catch (error) {
      return null;
    }

    // Read and parse Blueprint
    try {
      const content = fs.readFileSync(blueprintPath, 'utf8');
      const data = parseBlueprint(content);

      if (data) {
        blueprintCache.set(blueprintPath, data);
      }

      return data;
    } catch (error) {
      // Error reading or parsing file
      return null;
    }
  }
}

/**
 * Registers the open Blueprint command
 */
export function registerOpenBlueprintCommand(context: vscode.ExtensionContext): void {
  const command = vscode.commands.registerCommand('kirby.openBlueprint', async (blueprintPath: string) => {
    try {
      const document = await vscode.workspace.openTextDocument(blueprintPath);
      await vscode.window.showTextDocument(document);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to open Blueprint: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  context.subscriptions.push(command);
}
