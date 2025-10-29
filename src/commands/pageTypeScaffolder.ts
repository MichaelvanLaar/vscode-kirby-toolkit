import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { detectKirbyProject, getWorkspaceRoot, validateFileName } from '../utils/kirbyProject';
import {
  generateBlueprintContent,
  generateTemplateContent,
  generateControllerContent,
  generateModelContent
} from '../utils/scaffoldingTemplates';

/**
 * File types that can be generated
 */
interface FileSelection {
  blueprint: boolean;
  template: boolean;
  controller: boolean;
  model: boolean;
}

/**
 * Registers the New Page Type command
 */
export function registerNewPageTypeCommand(context: vscode.ExtensionContext): void {
  const command = vscode.commands.registerCommand('kirby.newPageType', async () => {
    // Check if this is a Kirby project
    if (!detectKirbyProject()) {
      vscode.window.showErrorMessage('Not a Kirby project. Please open a Kirby workspace.');
      return;
    }

    // Prompt for page type name
    const pageTypeName = await promptPageTypeName();
    if (!pageTypeName) {
      return; // User cancelled
    }

    // Prompt for file selection
    const fileSelection = await promptFileSelection();
    if (!fileSelection) {
      return; // User cancelled
    }

    // Generate files
    try {
      const createdFiles = await generatePageType(pageTypeName, fileSelection);

      if (createdFiles.length > 0) {
        vscode.window.showInformationMessage(
          `Created page type '${pageTypeName}' (${createdFiles.length} files)`,
          'Open Template'
        ).then(choice => {
          if (choice === 'Open Template') {
            const templateFile = createdFiles.find(f => f.includes('/templates/'));
            if (templateFile) {
              vscode.workspace.openTextDocument(templateFile).then(doc => {
                vscode.window.showTextDocument(doc);
              });
            }
          }
        });
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to create page type: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  context.subscriptions.push(command);
}

/**
 * Prompts the user for a page type name
 */
async function promptPageTypeName(): Promise<string | undefined> {
  const name = await vscode.window.showInputBox({
    prompt: 'Enter the page type name (e.g., "project", "article")',
    placeHolder: 'project',
    validateInput: (value) => {
      if (!value || value.trim().length === 0) {
        return 'Page type name cannot be empty';
      }

      if (!validateFileName(value)) {
        return 'Invalid name. Use only letters, numbers, hyphens, and underscores.';
      }

      // Check if Blueprint already exists
      const workspaceRoot = getWorkspaceRoot();
      if (workspaceRoot) {
        const blueprintPath = path.join(workspaceRoot, 'site', 'blueprints', 'pages', `${value}.yml`);
        if (fs.existsSync(blueprintPath)) {
          return `A page type named '${value}' already exists`;
        }
      }

      return null;
    }
  });

  return name?.trim();
}

/**
 * Prompts the user to select which files to generate
 */
async function promptFileSelection(): Promise<FileSelection | undefined> {
  interface QuickPickItemWithId extends vscode.QuickPickItem {
    id: keyof FileSelection;
    required?: boolean;
  }

  const items: QuickPickItemWithId[] = [
    {
      id: 'blueprint',
      label: 'Blueprint',
      description: 'Required',
      picked: true,
      required: true
    },
    {
      id: 'template',
      label: 'Template',
      description: 'Required',
      picked: true,
      required: true
    },
    {
      id: 'controller',
      label: 'Controller',
      description: 'Optional',
      picked: false
    },
    {
      id: 'model',
      label: 'Model',
      description: 'Optional',
      picked: false
    }
  ];

  const selected = await vscode.window.showQuickPick(items, {
    canPickMany: true,
    placeHolder: 'Select files to generate',
    ignoreFocusOut: true
  });

  if (!selected) {
    return undefined;
  }

  // Ensure required files are selected
  const selection: FileSelection = {
    blueprint: true, // Always required
    template: true,  // Always required
    controller: false,
    model: false
  };

  selected.forEach(item => {
    selection[item.id] = true;
  });

  return selection;
}

/**
 * Generates page type files
 */
async function generatePageType(
  pageTypeName: string,
  fileSelection: FileSelection
): Promise<string[]> {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    throw new Error('Workspace root not found');
  }

  const createdFiles: string[] = [];

  try {
    // Generate Blueprint (always required)
    if (fileSelection.blueprint) {
      const blueprintPath = await generateBlueprint(workspaceRoot, pageTypeName);
      createdFiles.push(blueprintPath);
    }

    // Generate Template (always required)
    if (fileSelection.template) {
      const templatePath = await generateTemplate(workspaceRoot, pageTypeName);
      createdFiles.push(templatePath);
    }

    // Generate Controller (optional)
    if (fileSelection.controller) {
      const controllerPath = await generateController(workspaceRoot, pageTypeName);
      createdFiles.push(controllerPath);
    }

    // Generate Model (optional)
    if (fileSelection.model) {
      const modelPath = await generateModel(workspaceRoot, pageTypeName);
      createdFiles.push(modelPath);
    }

    return createdFiles;
  } catch (error) {
    // Clean up any created files on error
    for (const file of createdFiles) {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }
    throw error;
  }
}

/**
 * Generates a Blueprint file
 */
async function generateBlueprint(workspaceRoot: string, pageTypeName: string): Promise<string> {
  const blueprintDir = path.join(workspaceRoot, 'site', 'blueprints', 'pages');
  const blueprintPath = path.join(blueprintDir, `${pageTypeName}.yml`);

  // Create directory if it doesn't exist
  if (!fs.existsSync(blueprintDir)) {
    fs.mkdirSync(blueprintDir, { recursive: true });
  }

  // Generate Blueprint content using utility function
  const content = generateBlueprintContent(pageTypeName);

  fs.writeFileSync(blueprintPath, content, 'utf8');
  return blueprintPath;
}

/**
 * Generates a Template file
 */
async function generateTemplate(workspaceRoot: string, pageTypeName: string): Promise<string> {
  const templateDir = path.join(workspaceRoot, 'site', 'templates');
  const templatePath = path.join(templateDir, `${pageTypeName}.php`);

  // Create directory if it doesn't exist
  if (!fs.existsSync(templateDir)) {
    fs.mkdirSync(templateDir, { recursive: true });
  }

  // Generate Template content using utility function
  const content = generateTemplateContent(pageTypeName);

  fs.writeFileSync(templatePath, content, 'utf8');
  return templatePath;
}

/**
 * Generates a Controller file
 */
async function generateController(workspaceRoot: string, pageTypeName: string): Promise<string> {
  const controllerDir = path.join(workspaceRoot, 'site', 'controllers');
  const controllerPath = path.join(controllerDir, `${pageTypeName}.php`);

  // Create directory if it doesn't exist
  if (!fs.existsSync(controllerDir)) {
    fs.mkdirSync(controllerDir, { recursive: true });
  }

  // Generate Controller content using utility function
  const content = generateControllerContent(pageTypeName);

  fs.writeFileSync(controllerPath, content, 'utf8');
  return controllerPath;
}

/**
 * Generates a Model file
 */
async function generateModel(workspaceRoot: string, pageTypeName: string): Promise<string> {
  const modelDir = path.join(workspaceRoot, 'site', 'models');
  const modelPath = path.join(modelDir, `${pageTypeName}.php`);

  // Create directory if it doesn't exist
  if (!fs.existsSync(modelDir)) {
    fs.mkdirSync(modelDir, { recursive: true });
  }

  // Generate Model content using utility function
  const content = generateModelContent(pageTypeName);

  fs.writeFileSync(modelPath, content, 'utf8');
  return modelPath;
}
