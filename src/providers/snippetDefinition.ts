import * as vscode from 'vscode';
import { getSnippetNameAtPosition } from '../utils/phpParser';
import { resolveSnippetPath, snippetExists } from '../utils/kirbyProject';

/**
 * Provides Go-to-Definition support for snippet() calls
 */
export class SnippetDefinitionProvider implements vscode.DefinitionProvider {
  /**
   * Provide definition location for snippet names
   */
  public provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {
    // Get snippet name at cursor position
    const snippetName = getSnippetNameAtPosition(document, position);
    if (!snippetName) {
      return undefined;
    }

    // Resolve snippet path
    const snippetPath = resolveSnippetPath(snippetName);
    if (!snippetPath) {
      return undefined;
    }

    // Check if snippet exists
    if (!snippetExists(snippetName)) {
      return undefined;
    }

    // Return location of snippet file
    const uri = vscode.Uri.file(snippetPath);
    return new vscode.Location(uri, new vscode.Position(0, 0));
  }
}
