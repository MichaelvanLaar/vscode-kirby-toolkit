import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {
  getWorkspaceRoot,
  isBlueprintFile,
  isTemplateFile,
  findMatchingTemplate,
  findMatchingBlueprint,
  getTemplateNameFromBlueprint,
  getBlueprintNameFromTemplate
} from '../utils/kirbyProject';
import {
  generateBlueprintContent,
  generateTemplateContent,
  generateControllerContent,
  generateModelContent
} from '../utils/scaffoldingTemplates';

/**
 * Manages Blueprint/Template synchronization by watching for file creation events
 * and prompting users to create corresponding counterpart files
 */
export class BlueprintTemplateSyncWatcher {
  private blueprintWatcher: vscode.FileSystemWatcher | undefined;
  private templateWatcher: vscode.FileSystemWatcher | undefined;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private workspaceState: vscode.Memento;
  private activeNotification: boolean = false;

  constructor(private context: vscode.ExtensionContext) {
    this.workspaceState = context.workspaceState;
  }

  /**
   * Activates the file system watchers
   */
  activate(): void {
    // Check if sync feature is enabled
    const config = vscode.workspace.getConfiguration('kirby');
    if (!config.get<boolean>('enableBlueprintTemplateSync', true)) {
      return;
    }

    // Watch for Blueprint file creation
    this.blueprintWatcher = vscode.workspace.createFileSystemWatcher(
      '**/site/blueprints/pages/**/*.yml'
    );

    this.blueprintWatcher.onDidCreate((uri) => {
      this.handleFileCreation(uri, 'blueprint');
    });

    // Watch for Template file creation
    this.templateWatcher = vscode.workspace.createFileSystemWatcher(
      '**/site/templates/**/*.php'
    );

    this.templateWatcher.onDidCreate((uri) => {
      this.handleFileCreation(uri, 'template');
    });

    // Listen for configuration changes to restart watchers
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('kirby.enableBlueprintTemplateSync')) {
        this.deactivate();
        this.activate();
      }
    });

    this.context.subscriptions.push(this.blueprintWatcher, this.templateWatcher);
  }

  /**
   * Deactivates the file system watchers
   */
  deactivate(): void {
    this.blueprintWatcher?.dispose();
    this.templateWatcher?.dispose();

    // Clear any pending debounce timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
  }

  /**
   * Handles file creation with debouncing
   */
  private handleFileCreation(uri: vscode.Uri, type: 'blueprint' | 'template'): void {
    const key = uri.fsPath;

    // Clear existing timer for this file
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key)!);
    }

    // Set new timer with 500ms debounce
    const timer = setTimeout(() => {
      if (type === 'blueprint') {
        this.onBlueprintCreated(uri);
      } else {
        this.onTemplateCreated(uri);
      }
      this.debounceTimers.delete(key);
    }, 500);

    this.debounceTimers.set(key, timer);
  }

  /**
   * Handles Blueprint file creation
   */
  private async onBlueprintCreated(blueprintUri: vscode.Uri): Promise<void> {
    // Check if file is in ignored folders
    if (this.isIgnoredFolder(blueprintUri)) {
      return;
    }

    // Check if dismissed for this file
    if (this.isDismissedForFile(blueprintUri)) {
      return;
    }

    // Check if matching template already exists
    const matchingTemplate = findMatchingTemplate(blueprintUri);
    if (matchingTemplate) {
      return; // Template already exists, no need to prompt
    }

    // Show sync prompt
    await this.showBlueprintSyncPrompt(blueprintUri);
  }

  /**
   * Handles Template file creation
   */
  private async onTemplateCreated(templateUri: vscode.Uri): Promise<void> {
    // Check if file is in ignored folders
    if (this.isIgnoredFolder(templateUri)) {
      return;
    }

    // Check if dismissed for this file
    if (this.isDismissedForFile(templateUri)) {
      return;
    }

    // Check if matching Blueprint already exists
    const matchingBlueprint = findMatchingBlueprint(templateUri);
    if (matchingBlueprint) {
      return; // Blueprint already exists, no need to prompt
    }

    // Show sync prompt
    await this.showTemplateSyncPrompt(templateUri);
  }

  /**
   * Shows synchronization prompt for Blueprint creation
   */
  private async showBlueprintSyncPrompt(blueprintUri: vscode.Uri): Promise<void> {
    // Prevent multiple concurrent notifications
    if (this.activeNotification) {
      return;
    }

    const config = vscode.workspace.getConfiguration('kirby');
    const promptBehavior = config.get<string>('syncPromptBehavior', 'ask');

    // Check if user has disabled prompts
    if (promptBehavior === 'never') {
      return;
    }

    const blueprintName = path.basename(blueprintUri.fsPath, '.yml');
    const templateName = getTemplateNameFromBlueprint(blueprintUri.fsPath);

    if (!templateName) {
      return;
    }

    this.activeNotification = true;

    // Auto-create if behavior is set to "always"
    if (promptBehavior === 'always') {
      const createController = config.get<boolean>('syncCreateController', false);
      const createModel = config.get<boolean>('syncCreateModel', false);
      await this.createTemplateFromBlueprint(blueprintUri, createController, createModel);
      this.activeNotification = false;
      return;
    }

    // Show notification with action buttons
    const action = await vscode.window.showInformationMessage(
      `📄 Blueprint '${blueprintName}.yml' created without a template. Create '${templateName}.php'?`,
      'Create Template',
      'Create Template + Controller + Model',
      "Don't ask again",
      'Dismiss'
    );

    this.activeNotification = false;

    if (action === 'Create Template') {
      await this.createTemplateFromBlueprint(blueprintUri, false, false);
    } else if (action === 'Create Template + Controller + Model') {
      await this.createTemplateFromBlueprint(blueprintUri, true, true);
    } else if (action === "Don't ask again") {
      this.dismissForFile(blueprintUri);
    }
  }

  /**
   * Shows synchronization prompt for Template creation
   */
  private async showTemplateSyncPrompt(templateUri: vscode.Uri): Promise<void> {
    // Prevent multiple concurrent notifications
    if (this.activeNotification) {
      return;
    }

    const config = vscode.workspace.getConfiguration('kirby');
    const promptBehavior = config.get<string>('syncPromptBehavior', 'ask');

    // Check if user has disabled prompts
    if (promptBehavior === 'never') {
      return;
    }

    const templateName = path.basename(templateUri.fsPath, '.php');
    const blueprintName = getBlueprintNameFromTemplate(templateUri.fsPath);

    if (!blueprintName) {
      return;
    }

    this.activeNotification = true;

    // Auto-create if behavior is set to "always"
    if (promptBehavior === 'always') {
      await this.createBlueprintFromTemplate(templateUri);
      this.activeNotification = false;
      return;
    }

    // Show notification with action buttons
    const action = await vscode.window.showInformationMessage(
      `📄 Template '${templateName}.php' created without a Blueprint. Create Blueprint?`,
      'Create Blueprint',
      "Don't ask again",
      'Dismiss'
    );

    this.activeNotification = false;

    if (action === 'Create Blueprint') {
      await this.createBlueprintFromTemplate(templateUri);
    } else if (action === "Don't ask again") {
      this.dismissForFile(templateUri);
    }
  }

  /**
   * Creates a Template file from a Blueprint
   */
  private async createTemplateFromBlueprint(
    blueprintUri: vscode.Uri,
    includeController: boolean,
    includeModel: boolean
  ): Promise<void> {
    try {
      const workspaceRoot = getWorkspaceRoot();
      if (!workspaceRoot) {
        throw new Error('Workspace root not found');
      }

      const templateName = getTemplateNameFromBlueprint(blueprintUri.fsPath);
      if (!templateName) {
        throw new Error('Could not determine template name from Blueprint');
      }

      // Extract page type name (remove nested path dots for naming)
      const pageTypeName = templateName.split('.').pop() || templateName;

      // Create template directory if needed
      const templateDir = path.join(workspaceRoot, 'site', 'templates');
      if (!fs.existsSync(templateDir)) {
        fs.mkdirSync(templateDir, { recursive: true });
      }

      // Generate and write template file
      const templatePath = path.join(templateDir, `${templateName}.php`);
      const templateContent = generateTemplateContent(pageTypeName);
      fs.writeFileSync(templatePath, templateContent, 'utf8');

      const createdFiles = [templatePath];

      // Create controller if requested
      if (includeController) {
        const controllerDir = path.join(workspaceRoot, 'site', 'controllers');
        if (!fs.existsSync(controllerDir)) {
          fs.mkdirSync(controllerDir, { recursive: true });
        }
        const controllerPath = path.join(controllerDir, `${templateName}.php`);
        const controllerContent = generateControllerContent(pageTypeName);
        fs.writeFileSync(controllerPath, controllerContent, 'utf8');
        createdFiles.push(controllerPath);
      }

      // Create model if requested
      if (includeModel) {
        const modelDir = path.join(workspaceRoot, 'site', 'models');
        if (!fs.existsSync(modelDir)) {
          fs.mkdirSync(modelDir, { recursive: true });
        }
        const modelPath = path.join(modelDir, `${templateName}.php`);
        const modelContent = generateModelContent(pageTypeName);
        fs.writeFileSync(modelPath, modelContent, 'utf8');
        createdFiles.push(modelPath);
      }

      // Show success notification
      const fileList = createdFiles.map(f => path.basename(f)).join(', ');
      const action = await vscode.window.showInformationMessage(
        `✅ Created ${createdFiles.length} file(s): ${fileList}`,
        'Open Template'
      );

      if (action === 'Open Template') {
        const doc = await vscode.workspace.openTextDocument(templatePath);
        await vscode.window.showTextDocument(doc);
      }
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to create template: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Creates a Blueprint file from a Template
   */
  private async createBlueprintFromTemplate(templateUri: vscode.Uri): Promise<void> {
    try {
      const workspaceRoot = getWorkspaceRoot();
      if (!workspaceRoot) {
        throw new Error('Workspace root not found');
      }

      const blueprintName = getBlueprintNameFromTemplate(templateUri.fsPath);
      if (!blueprintName) {
        throw new Error('Could not determine Blueprint name from template');
      }

      // Extract page type name
      const pageTypeName = path.basename(templateUri.fsPath, '.php').split('.').pop() || path.basename(templateUri.fsPath, '.php');

      // Create Blueprint directory if needed (including nested directories)
      const blueprintPath = path.join(workspaceRoot, 'site', 'blueprints', 'pages', `${blueprintName}.yml`);
      const blueprintDir = path.dirname(blueprintPath);
      if (!fs.existsSync(blueprintDir)) {
        fs.mkdirSync(blueprintDir, { recursive: true });
      }

      // Generate and write Blueprint file
      const blueprintContent = generateBlueprintContent(pageTypeName);
      fs.writeFileSync(blueprintPath, blueprintContent, 'utf8');

      // Show success notification
      const action = await vscode.window.showInformationMessage(
        `✅ Created Blueprint: ${path.basename(blueprintPath)}`,
        'Open Blueprint'
      );

      if (action === 'Open Blueprint') {
        const doc = await vscode.workspace.openTextDocument(blueprintPath);
        await vscode.window.showTextDocument(doc);
      }
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to create Blueprint: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Checks if a file is in an ignored folder
   */
  private isIgnoredFolder(uri: vscode.Uri): boolean {
    const config = vscode.workspace.getConfiguration('kirby');
    const ignoreFolders = config.get<string[]>('syncIgnoreFolders', []);

    const workspaceRoot = getWorkspaceRoot();
    if (!workspaceRoot) {
      return false;
    }

    const relativePath = path.relative(workspaceRoot, uri.fsPath);

    return ignoreFolders.some(pattern => {
      // Simple pattern matching (exact folder name or prefix)
      return relativePath.includes(pattern);
    });
  }

  /**
   * Checks if sync prompt has been dismissed for a file
   */
  private isDismissedForFile(uri: vscode.Uri): boolean {
    const dismissedFiles = this.workspaceState.get<string[]>('kirby.dismissedSyncFiles', []);
    return dismissedFiles.includes(uri.fsPath);
  }

  /**
   * Marks a file as dismissed (don't show sync prompt again)
   */
  private dismissForFile(uri: vscode.Uri): void {
    const dismissedFiles = this.workspaceState.get<string[]>('kirby.dismissedSyncFiles', []);
    if (!dismissedFiles.includes(uri.fsPath)) {
      dismissedFiles.push(uri.fsPath);
      this.workspaceState.update('kirby.dismissedSyncFiles', dismissedFiles);
    }
  }

  /**
   * Resets all dismissed sync prompts
   */
  resetDismissedPrompts(): void {
    this.workspaceState.update('kirby.dismissedSyncFiles', []);
    vscode.window.showInformationMessage('Sync prompts have been reset.');
  }
}
