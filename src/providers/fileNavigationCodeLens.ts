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
  getSnippetNameFromPath
} from '../utils/kirbyProject';
import { isSnippetControllerSupportEnabled } from '../config/settings';

/**
 * Provides CodeLens for navigating between related files
 */
export class FileNavigationCodeLensProvider implements vscode.CodeLensProvider {
  public provideCodeLenses(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
    const config = vscode.workspace.getConfiguration('kirby');
    const codeLensEnabled = config.get<boolean>('showSnippetCodeLens', true);

    if (!codeLensEnabled) {
      return [];
    }

    const filePath = document.uri.fsPath;
    const codeLenses: vscode.CodeLens[] = [];
    const range = new vscode.Range(0, 0, 0, 0);

    // Template file: show controller and model links
    if (isTemplateFile(filePath)) {
      const showControllerNav = config.get<boolean>('showControllerNavigation', true);
      const showModelNav = config.get<boolean>('showModelNavigation', true);

      if (showControllerNav) {
        const controllerPath = resolveControllerPath(filePath);
        if (controllerPath) {
          codeLenses.push(new vscode.CodeLens(range, {
            title: 'Open Controller',
            command: 'kirby.openRelatedFile',
            arguments: [controllerPath]
          }));
        }
      }

      if (showModelNav) {
        const modelPath = resolveModelPath(filePath);
        if (modelPath) {
          codeLenses.push(new vscode.CodeLens(range, {
            title: 'Open Model',
            command: 'kirby.openRelatedFile',
            arguments: [modelPath]
          }));
        }
      }
    }

    // Controller file: show template link
    if (isControllerFile(filePath)) {
      const templatePath = resolveTemplateFromFile(filePath);
      if (templatePath) {
        codeLenses.push(new vscode.CodeLens(range, {
          title: 'Open Template',
          command: 'kirby.openRelatedFile',
          arguments: [templatePath]
        }));
      } else {
        codeLenses.push(new vscode.CodeLens(range, {
          title: 'Template not found',
          command: ''
        }));
      }
    }

    // Model file: show template link
    if (isModelFile(filePath)) {
      const templatePath = resolveTemplateFromFile(filePath);
      if (templatePath) {
        codeLenses.push(new vscode.CodeLens(range, {
          title: 'Open Template',
          command: 'kirby.openRelatedFile',
          arguments: [templatePath]
        }));
      } else {
        codeLenses.push(new vscode.CodeLens(range, {
          title: 'Template not found',
          command: ''
        }));
      }
    }

    // Snippet file: show controller link (when support enabled)
    if (isSnippetControllerSupportEnabled() && isSnippetFile(filePath)) {
      const snippetName = getSnippetNameFromPath(filePath);
      if (snippetName) {
        const controllerPath = resolveSnippetControllerPath(snippetName);
        if (controllerPath && snippetControllerExists(snippetName)) {
          codeLenses.push(new vscode.CodeLens(range, {
            title: 'Open Snippet Controller',
            command: 'kirby.openRelatedFile',
            arguments: [controllerPath]
          }));
        }
      }
    }

    // Snippet controller file: show snippet link (when support enabled)
    if (isSnippetControllerSupportEnabled() && isSnippetControllerFile(filePath)) {
      const snippetPath = resolveSnippetFromController(filePath);
      if (snippetPath) {
        codeLenses.push(new vscode.CodeLens(range, {
          title: 'Open Snippet',
          command: 'kirby.openRelatedFile',
          arguments: [snippetPath]
        }));
      } else {
        codeLenses.push(new vscode.CodeLens(range, {
          title: 'Snippet not found',
          command: ''
        }));
      }
    }

    return codeLenses;
  }
}

/**
 * Registers the open related file command
 */
export function registerOpenRelatedFileCommand(context: vscode.ExtensionContext): void {
  const command = vscode.commands.registerCommand('kirby.openRelatedFile', async (filePath: string) => {
    try {
      const document = await vscode.workspace.openTextDocument(filePath);
      await vscode.window.showTextDocument(document);
    } catch (error) {
      const fileName = filePath.split('/').pop();
      vscode.window.showErrorMessage(`File not found: ${fileName}`);
    }
  });

  context.subscriptions.push(command);
}
