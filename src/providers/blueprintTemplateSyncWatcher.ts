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
  getBlueprintNameFromTemplate,
  isBlockBlueprintFile,
  isBlockSnippetFile,
  isFieldBlueprintFile,
  isFieldSnippetFile,
  findMatchingBlockSnippet,
  findMatchingBlockBlueprint,
  findMatchingFieldSnippet,
  getBlockSnippetNameFromBlueprint,
  getBlockBlueprintNameFromSnippet,
  getFieldSnippetNameFromBlueprint,
  detectBlockNestingStrategy
} from '../utils/kirbyProject';
import {
  generateBlueprintContent,
  generateTemplateContent,
  generateControllerContent,
  generateModelContent,
  generateBlockSnippetContent,
  generateBlockBlueprintContent,
  generateFieldSnippetContent
} from '../utils/scaffoldingTemplates';
import { getSyncBlockSnippets, getSyncFieldSnippets, getSyncBlockNestingStrategy } from '../config/settings';

/**
 * Manages Blueprint/Template synchronization by watching for file creation events
 * and prompting users to create corresponding counterpart files
 */
export class BlueprintTemplateSyncWatcher {
  private blueprintWatcher: vscode.FileSystemWatcher | undefined;
  private templateWatcher: vscode.FileSystemWatcher | undefined;
  private blockBlueprintWatcher: vscode.FileSystemWatcher | undefined;
  private blockSnippetWatcher: vscode.FileSystemWatcher | undefined;
  private fieldBlueprintWatcher: vscode.FileSystemWatcher | undefined;
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

    // Watch for block Blueprint file creation (if enabled)
    if (getSyncBlockSnippets()) {
      this.blockBlueprintWatcher = vscode.workspace.createFileSystemWatcher(
        '**/site/blueprints/blocks/**/*.yml'
      );

      this.blockBlueprintWatcher.onDidCreate((uri) => {
        this.handleFileCreation(uri, 'block-blueprint');
      });

      // Watch for block snippet file creation
      this.blockSnippetWatcher = vscode.workspace.createFileSystemWatcher(
        '**/site/snippets/blocks/**/*.php'
      );

      this.blockSnippetWatcher.onDidCreate((uri) => {
        this.handleFileCreation(uri, 'block-snippet');
      });

      this.context.subscriptions.push(this.blockBlueprintWatcher, this.blockSnippetWatcher);
    }

    // Watch for field Blueprint file creation (if enabled)
    if (getSyncFieldSnippets()) {
      this.fieldBlueprintWatcher = vscode.workspace.createFileSystemWatcher(
        '**/site/blueprints/fields/**/*.yml'
      );

      this.fieldBlueprintWatcher.onDidCreate((uri) => {
        this.handleFileCreation(uri, 'field-blueprint');
      });

      this.context.subscriptions.push(this.fieldBlueprintWatcher);
    }

    // Listen for configuration changes to restart watchers
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('kirby.enableBlueprintTemplateSync') ||
          event.affectsConfiguration('kirby.syncBlockSnippets') ||
          event.affectsConfiguration('kirby.syncFieldSnippets')) {
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
    this.blockBlueprintWatcher?.dispose();
    this.blockSnippetWatcher?.dispose();
    this.fieldBlueprintWatcher?.dispose();

    // Clear any pending debounce timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
  }

  /**
   * Handles file creation with debouncing
   */
  private handleFileCreation(uri: vscode.Uri, type: 'blueprint' | 'template' | 'block-blueprint' | 'block-snippet' | 'field-blueprint'): void {
    const key = uri.fsPath;

    // Clear existing timer for this file
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key)!);
    }

    // Set new timer with 500ms debounce
    const timer = setTimeout(() => {
      switch (type) {
        case 'blueprint':
          this.onBlueprintCreated(uri);
          break;
        case 'template':
          this.onTemplateCreated(uri);
          break;
        case 'block-blueprint':
          this.onBlockBlueprintCreated(uri);
          break;
        case 'block-snippet':
          this.onBlockSnippetCreated(uri);
          break;
        case 'field-blueprint':
          this.onFieldBlueprintCreated(uri);
          break;
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
   * Handles block Blueprint file creation
   */
  private async onBlockBlueprintCreated(blueprintUri: vscode.Uri): Promise<void> {
    // Check if file is in ignored folders
    if (this.isIgnoredFolder(blueprintUri)) {
      return;
    }

    // Check if dismissed for this file
    if (this.isDismissedForFile(blueprintUri)) {
      return;
    }

    // Check if matching snippet already exists
    const matchingSnippet = findMatchingBlockSnippet(blueprintUri);
    if (matchingSnippet) {
      return; // Snippet already exists, no need to prompt
    }

    // Show sync prompt
    await this.showBlockBlueprintSyncPrompt(blueprintUri);
  }

  /**
   * Handles block snippet file creation
   */
  private async onBlockSnippetCreated(snippetUri: vscode.Uri): Promise<void> {
    // Check if file is in ignored folders
    if (this.isIgnoredFolder(snippetUri)) {
      return;
    }

    // Check if dismissed for this file
    if (this.isDismissedForFile(snippetUri)) {
      return;
    }

    // Check if matching Blueprint already exists
    const matchingBlueprint = findMatchingBlockBlueprint(snippetUri);
    if (matchingBlueprint) {
      return; // Blueprint already exists, no need to prompt
    }

    // Show sync prompt
    await this.showBlockSnippetSyncPrompt(snippetUri);
  }

  /**
   * Handles field Blueprint file creation
   */
  private async onFieldBlueprintCreated(blueprintUri: vscode.Uri): Promise<void> {
    // Check if file is in ignored folders
    if (this.isIgnoredFolder(blueprintUri)) {
      return;
    }

    // Check if dismissed for this file
    if (this.isDismissedForFile(blueprintUri)) {
      return;
    }

    // Check if matching snippet already exists
    const matchingSnippet = findMatchingFieldSnippet(blueprintUri);
    if (matchingSnippet) {
      return; // Snippet already exists, no need to prompt
    }

    // Show sync prompt
    await this.showFieldBlueprintSyncPrompt(blueprintUri);
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
   * Shows synchronization prompt for block Blueprint creation
   */
  private async showBlockBlueprintSyncPrompt(blueprintUri: vscode.Uri): Promise<void> {
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

    this.activeNotification = true;

    // Auto-create if behavior is set to "always"
    if (promptBehavior === 'always') {
      await this.createBlockSnippetFromBlueprint(blueprintUri);
      this.activeNotification = false;
      return;
    }

    // Show notification with action buttons
    const action = await vscode.window.showInformationMessage(
      `📄 Block Blueprint '${blueprintName}.yml' created without a snippet. Create snippet?`,
      'Create Snippet',
      "Don't ask again",
      'Dismiss'
    );

    this.activeNotification = false;

    if (action === 'Create Snippet') {
      await this.createBlockSnippetFromBlueprint(blueprintUri);
    } else if (action === "Don't ask again") {
      this.dismissForFile(blueprintUri);
    }
  }

  /**
   * Shows synchronization prompt for block snippet creation
   */
  private async showBlockSnippetSyncPrompt(snippetUri: vscode.Uri): Promise<void> {
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

    const snippetName = path.basename(snippetUri.fsPath, '.php');

    this.activeNotification = true;

    // Auto-create if behavior is set to "always"
    if (promptBehavior === 'always') {
      await this.createBlockBlueprintFromSnippet(snippetUri);
      this.activeNotification = false;
      return;
    }

    // Show notification with action buttons
    const action = await vscode.window.showInformationMessage(
      `📄 Block snippet '${snippetName}.php' created without a Blueprint. Create Blueprint?`,
      'Create Blueprint',
      "Don't ask again",
      'Dismiss'
    );

    this.activeNotification = false;

    if (action === 'Create Blueprint') {
      await this.createBlockBlueprintFromSnippet(snippetUri);
    } else if (action === "Don't ask again") {
      this.dismissForFile(snippetUri);
    }
  }

  /**
   * Shows synchronization prompt for field Blueprint creation
   */
  private async showFieldBlueprintSyncPrompt(blueprintUri: vscode.Uri): Promise<void> {
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

    this.activeNotification = true;

    // Auto-create if behavior is set to "always"
    if (promptBehavior === 'always') {
      await this.createFieldSnippetFromBlueprint(blueprintUri);
      this.activeNotification = false;
      return;
    }

    // Show notification with action buttons
    const action = await vscode.window.showInformationMessage(
      `📄 Field Blueprint '${blueprintName}.yml' created without a snippet. Create snippet?`,
      'Create Snippet',
      "Don't ask again",
      'Dismiss'
    );

    this.activeNotification = false;

    if (action === 'Create Snippet') {
      await this.createFieldSnippetFromBlueprint(blueprintUri);
    } else if (action === "Don't ask again") {
      this.dismissForFile(blueprintUri);
    }
  }

  /**
   * Creates a block snippet file from a Blueprint
   */
  private async createBlockSnippetFromBlueprint(blueprintUri: vscode.Uri): Promise<void> {
    try {
      const workspaceRoot = getWorkspaceRoot();
      if (!workspaceRoot) {
        throw new Error('Workspace root not found');
      }

      // Determine nesting strategy
      const configStrategy = getSyncBlockNestingStrategy();
      const strategy = configStrategy === 'auto'
        ? detectBlockNestingStrategy(workspaceRoot)
        : configStrategy;

      const snippetName = getBlockSnippetNameFromBlueprint(blueprintUri.fsPath, strategy);
      if (!snippetName) {
        throw new Error('Could not determine snippet name from Blueprint');
      }

      // Extract block name for boilerplate
      const blockName = snippetName.split(/[\/\\.]/).pop() || snippetName;

      // Create snippet directory if needed (including nested directories)
      const snippetPath = path.join(workspaceRoot, 'site', 'snippets', 'blocks', `${snippetName}.php`);
      const snippetDir = path.dirname(snippetPath);
      if (!fs.existsSync(snippetDir)) {
        fs.mkdirSync(snippetDir, { recursive: true });
      }

      // Generate and write snippet file
      const snippetContent = generateBlockSnippetContent(blockName);
      fs.writeFileSync(snippetPath, snippetContent, 'utf8');

      // Show success notification
      const action = await vscode.window.showInformationMessage(
        `✅ Created block snippet: ${path.basename(snippetPath)}`,
        'Open Snippet'
      );

      if (action === 'Open Snippet') {
        const doc = await vscode.workspace.openTextDocument(snippetPath);
        await vscode.window.showTextDocument(doc);
      }
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to create block snippet: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Creates a block Blueprint file from a snippet
   */
  private async createBlockBlueprintFromSnippet(snippetUri: vscode.Uri): Promise<void> {
    try {
      const workspaceRoot = getWorkspaceRoot();
      if (!workspaceRoot) {
        throw new Error('Workspace root not found');
      }

      const blueprintName = getBlockBlueprintNameFromSnippet(snippetUri.fsPath);
      if (!blueprintName) {
        throw new Error('Could not determine Blueprint name from snippet');
      }

      // Extract block name for boilerplate
      const blockName = blueprintName.split(/[\/\\]/).pop() || blueprintName;

      // Create Blueprint directory if needed (including nested directories)
      const blueprintPath = path.join(workspaceRoot, 'site', 'blueprints', 'blocks', `${blueprintName}.yml`);
      const blueprintDir = path.dirname(blueprintPath);
      if (!fs.existsSync(blueprintDir)) {
        fs.mkdirSync(blueprintDir, { recursive: true });
      }

      // Generate and write Blueprint file
      const blueprintContent = generateBlockBlueprintContent(blockName);
      fs.writeFileSync(blueprintPath, blueprintContent, 'utf8');

      // Show success notification
      const action = await vscode.window.showInformationMessage(
        `✅ Created block Blueprint: ${path.basename(blueprintPath)}`,
        'Open Blueprint'
      );

      if (action === 'Open Blueprint') {
        const doc = await vscode.workspace.openTextDocument(blueprintPath);
        await vscode.window.showTextDocument(doc);
      }
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to create block Blueprint: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Creates a field snippet file from a Blueprint
   */
  private async createFieldSnippetFromBlueprint(blueprintUri: vscode.Uri): Promise<void> {
    try {
      const workspaceRoot = getWorkspaceRoot();
      if (!workspaceRoot) {
        throw new Error('Workspace root not found');
      }

      // Use nested strategy for fields (modern convention)
      const snippetName = getFieldSnippetNameFromBlueprint(blueprintUri.fsPath, 'nested');
      if (!snippetName) {
        throw new Error('Could not determine snippet name from Blueprint');
      }

      // Extract field name for boilerplate
      const fieldName = snippetName.split(/[\/\\.]/).pop() || snippetName;

      // Create snippet directory if needed (including nested directories)
      const snippetPath = path.join(workspaceRoot, 'site', 'snippets', 'fields', `${snippetName}.php`);
      const snippetDir = path.dirname(snippetPath);
      if (!fs.existsSync(snippetDir)) {
        fs.mkdirSync(snippetDir, { recursive: true });
      }

      // Generate and write snippet file
      const snippetContent = generateFieldSnippetContent(fieldName);
      fs.writeFileSync(snippetPath, snippetContent, 'utf8');

      // Show success notification
      const action = await vscode.window.showInformationMessage(
        `✅ Created field snippet: ${path.basename(snippetPath)}`,
        'Open Snippet'
      );

      if (action === 'Open Snippet') {
        const doc = await vscode.workspace.openTextDocument(snippetPath);
        await vscode.window.showTextDocument(doc);
      }
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to create field snippet: ${error instanceof Error ? error.message : 'Unknown error'}`
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
