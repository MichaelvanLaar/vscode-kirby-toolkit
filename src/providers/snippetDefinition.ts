import * as vscode from 'vscode';
import { getSnippetNameAtPosition } from '../utils/phpParser';
import { resolveSnippetPath, snippetExists, resolveSnippetControllerPath, snippetControllerExists } from '../utils/kirbyProject';
import { isSnippetControllerSupportEnabled } from '../config/settings';

/**
 * Provides Go-to-Definition support for snippet() calls
 */
export class SnippetDefinitionProvider implements vscode.DefinitionProvider {
  /**
   * Provide definition location for snippet names
   * Returns both snippet and controller files when controller support is enabled
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

    const locations: vscode.Location[] = [];
    const controllerSupportEnabled = isSnippetControllerSupportEnabled();

    // Check if snippet exists
    const snippetPath = resolveSnippetPath(snippetName);
    if (snippetPath && snippetExists(snippetName)) {
      const uri = vscode.Uri.file(snippetPath);
      locations.push(new vscode.Location(uri, new vscode.Position(0, 0)));
    }

    // Check if controller exists (when support is enabled)
    if (controllerSupportEnabled) {
      const controllerPath = resolveSnippetControllerPath(snippetName);
      if (controllerPath && snippetControllerExists(snippetName)) {
        const uri = vscode.Uri.file(controllerPath);
        locations.push(new vscode.Location(uri, new vscode.Position(0, 0)));
      }
    }

    // Return undefined if no files found
    if (locations.length === 0) {
      return undefined;
    }

    // Return single location or array of locations
    return locations.length === 1 ? locations[0] : locations;
  }
}
