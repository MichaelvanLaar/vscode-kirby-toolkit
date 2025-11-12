import * as vscode from 'vscode';
import {
  isTemplateFile,
  isControllerFile,
  isModelFile,
  isSnippetFile,
  isSnippetControllerFile,
  resolveControllerPath,
  resolveModelPath,
  resolveTemplateFromFile,
  resolveSnippetControllerPath,
  resolveSnippetFromController,
  snippetControllerExists,
  snippetExists,
  getSnippetNameFromPath
} from '../utils/kirbyProject';
import { isSnippetControllerSupportEnabled } from '../config/settings';

/**
 * Provides Definition navigation for template/controller/model files
 */
export class FileNavigationDefinitionProvider implements vscode.DefinitionProvider {
  public provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {
    const filePath = document.uri.fsPath;
    const locations: vscode.Location[] = [];

    // Navigate from template to controller/model
    if (isTemplateFile(filePath)) {
      const controllerPath = resolveControllerPath(filePath);
      if (controllerPath) {
        locations.push(new vscode.Location(
          vscode.Uri.file(controllerPath),
          new vscode.Position(0, 0)
        ));
      }

      const modelPath = resolveModelPath(filePath);
      if (modelPath) {
        locations.push(new vscode.Location(
          vscode.Uri.file(modelPath),
          new vscode.Position(0, 0)
        ));
      }
    }

    // Navigate from controller/model back to template
    if (isControllerFile(filePath) || isModelFile(filePath)) {
      const templatePath = resolveTemplateFromFile(filePath);
      if (templatePath) {
        locations.push(new vscode.Location(
          vscode.Uri.file(templatePath),
          new vscode.Position(0, 0)
        ));
      }
    }

    // Navigate from snippet to controller (when support enabled)
    if (isSnippetControllerSupportEnabled()) {
      if (isSnippetFile(filePath)) {
        const snippetName = getSnippetNameFromPath(filePath);
        if (snippetName) {
          const controllerPath = resolveSnippetControllerPath(snippetName);
          if (controllerPath && snippetControllerExists(snippetName)) {
            locations.push(new vscode.Location(
              vscode.Uri.file(controllerPath),
              new vscode.Position(0, 0)
            ));
          }
        }
      }

      // Navigate from controller back to snippet
      if (isSnippetControllerFile(filePath)) {
        const snippetPath = resolveSnippetFromController(filePath);
        if (snippetPath && snippetExists(getSnippetNameFromPath(snippetPath) || '')) {
          locations.push(new vscode.Location(
            vscode.Uri.file(snippetPath),
            new vscode.Position(0, 0)
          ));
        }
      }
    }

    return locations.length > 0 ? locations : null;
  }
}
