import * as vscode from 'vscode';
import { findSnippetCalls } from '../utils/phpParser';
import { isTemplateFile, isSnippetFile, snippetControllerExists, resolveSnippetControllerPath } from '../utils/kirbyProject';
import { isSnippetCodeLensEnabled, isSnippetControllerSupportEnabled } from '../config/settings';

/**
 * Provides CodeLens for snippet() function calls
 */
export class SnippetCodeLensProvider implements vscode.CodeLensProvider {
  private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
  public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

  /**
   * Refresh CodeLens display
   */
  public refresh(): void {
    this._onDidChangeCodeLenses.fire();
  }

  /**
   * Provide CodeLens items for a document
   */
  public provideCodeLenses(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
    // Check if CodeLens is enabled
    if (!isSnippetCodeLensEnabled()) {
      return [];
    }

    // Only provide CodeLens for template and snippet files
    const filePath = document.uri.fsPath;
    if (!isTemplateFile(filePath) && !isSnippetFile(filePath)) {
      return [];
    }

    const snippetCalls = findSnippetCalls(document);
    const codeLenses: vscode.CodeLens[] = [];
    const controllerSupportEnabled = isSnippetControllerSupportEnabled();

    for (const call of snippetCalls) {
      // Create a range for the entire line (for better visual placement)
      const lineRange = document.lineAt(call.line).range;

      // Always add the "Open Snippet" CodeLens
      const snippetCodeLens = new vscode.CodeLens(lineRange, {
        title: '$(link) Open Snippet',
        tooltip: `Open snippet: ${call.snippetName}`,
        command: 'kirby.openSnippet',
        arguments: [call.snippetName]
      });
      codeLenses.push(snippetCodeLens);

      // Check if controller exists and add "Open Controller" CodeLens
      if (controllerSupportEnabled && snippetControllerExists(call.snippetName)) {
        const controllerCodeLens = new vscode.CodeLens(lineRange, {
          title: '$(file-code) Open Controller',
          tooltip: `Open snippet controller: ${call.snippetName}.controller.php`,
          command: 'kirby.openSnippetController',
          arguments: [call.snippetName]
        });
        codeLenses.push(controllerCodeLens);
      }
    }

    return codeLenses;
  }
}
