import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Detects if the current workspace is a Kirby CMS project
 * by checking for the existence of the site/ directory
 */
export function detectKirbyProject(): boolean {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return false;
  }

  const rootPath = workspaceFolders[0].uri.fsPath;
  const sitePath = path.join(rootPath, 'site');

  return fs.existsSync(sitePath) && fs.statSync(sitePath).isDirectory();
}

/**
 * Gets the workspace root path
 */
export function getWorkspaceRoot(): string | undefined {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return undefined;
  }
  return workspaceFolders[0].uri.fsPath;
}

/**
 * Checks if a file path is a Kirby template file
 * @param filePath Absolute path to the file
 */
export function isTemplateFile(filePath: string): boolean {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    return false;
  }

  const relativePath = path.relative(workspaceRoot, filePath);
  return relativePath.startsWith('site/templates/') && filePath.endsWith('.php');
}

/**
 * Checks if a file path is a Kirby snippet file
 * @param filePath Absolute path to the file
 */
export function isSnippetFile(filePath: string): boolean {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    return false;
  }

  const relativePath = path.relative(workspaceRoot, filePath);
  return relativePath.startsWith('site/snippets/') && filePath.endsWith('.php');
}

/**
 * Checks if a file path is a Kirby Blueprint file
 * @param filePath Absolute path to the file
 */
export function isBlueprintFile(filePath: string): boolean {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    return false;
  }

  const relativePath = path.relative(workspaceRoot, filePath);
  return relativePath.startsWith('site/blueprints/') && filePath.endsWith('.yml');
}

/**
 * Sanitizes a snippet name to prevent path traversal attacks
 * @param snippetName The snippet name to sanitize
 * @returns Sanitized snippet name or undefined if invalid
 */
function sanitizeSnippetName(snippetName: string): string | undefined {
  if (!snippetName || typeof snippetName !== 'string') {
    return undefined;
  }

  // Remove any path traversal attempts and normalize
  const sanitized = path.normalize(snippetName).replace(/^(\.\.(\/|\\|$))+/, '');

  // Ensure it doesn't start with / or contain absolute path indicators
  if (path.isAbsolute(sanitized) || sanitized.includes('..')) {
    return undefined;
  }

  return sanitized;
}

/**
 * Resolves a snippet name to its file path
 * @param snippetName Name of the snippet (e.g., 'header' or 'partials/menu')
 * @returns Absolute path to the snippet file, or undefined if workspace not found or invalid name
 */
export function resolveSnippetPath(snippetName: string): string | undefined {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    return undefined;
  }

  // Sanitize snippet name to prevent path traversal
  const sanitized = sanitizeSnippetName(snippetName);
  if (!sanitized) {
    return undefined;
  }

  const snippetPath = path.join(workspaceRoot, 'site', 'snippets', `${sanitized}.php`);

  // Additional security check: ensure the resolved path is within the snippets directory
  const snippetsDir = path.join(workspaceRoot, 'site', 'snippets');
  if (!snippetPath.startsWith(snippetsDir)) {
    return undefined;
  }

  return snippetPath;
}

/**
 * Checks if a snippet file exists
 * @param snippetName Name of the snippet
 */
export function snippetExists(snippetName: string): boolean {
  const snippetPath = resolveSnippetPath(snippetName);
  if (!snippetPath) {
    return false;
  }
  return fs.existsSync(snippetPath);
}

/**
 * Checks if a file path is a Kirby controller file
 * @param filePath Absolute path to the file
 */
export function isControllerFile(filePath: string): boolean {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    return false;
  }

  const relativePath = path.relative(workspaceRoot, filePath);
  return relativePath.startsWith('site/controllers/') && filePath.endsWith('.php');
}

/**
 * Checks if a file path is a Kirby model file
 * @param filePath Absolute path to the file
 */
export function isModelFile(filePath: string): boolean {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    return false;
  }

  const relativePath = path.relative(workspaceRoot, filePath);
  return relativePath.startsWith('site/models/') && filePath.endsWith('.php');
}

/**
 * Resolves a template file to its corresponding controller file
 * @param templatePath Absolute path to the template file
 * @returns Absolute path to the controller file, or undefined if not found
 */
export function resolveControllerPath(templatePath: string): string | undefined {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot || !isTemplateFile(templatePath)) {
    return undefined;
  }

  const fileName = path.basename(templatePath);
  const controllerPath = path.join(workspaceRoot, 'site', 'controllers', fileName);

  return fs.existsSync(controllerPath) ? controllerPath : undefined;
}

/**
 * Resolves a template file to its corresponding model file
 * @param templatePath Absolute path to the template file
 * @returns Absolute path to the model file, or undefined if not found
 */
export function resolveModelPath(templatePath: string): string | undefined {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot || !isTemplateFile(templatePath)) {
    return undefined;
  }

  const fileName = path.basename(templatePath);
  const modelPath = path.join(workspaceRoot, 'site', 'models', fileName);

  return fs.existsSync(modelPath) ? modelPath : undefined;
}

/**
 * Resolves a controller or model file back to its template file
 * @param filePath Absolute path to the controller or model file
 * @returns Absolute path to the template file, or undefined if not found
 */
export function resolveTemplateFromFile(filePath: string): string | undefined {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    return undefined;
  }

  if (!isControllerFile(filePath) && !isModelFile(filePath)) {
    return undefined;
  }

  const fileName = path.basename(filePath);
  const templatePath = path.join(workspaceRoot, 'site', 'templates', fileName);

  return fs.existsSync(templatePath) ? templatePath : undefined;
}

/**
 * Resolves a template file to its corresponding Blueprint file
 * @param templatePath Absolute path to the template file
 * @returns Absolute path to the Blueprint file, or undefined if not found
 */
export function resolveBlueprintForTemplate(templatePath: string): string | undefined {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot || !isTemplateFile(templatePath)) {
    return undefined;
  }

  const baseName = path.basename(templatePath, '.php');

  // Try pages subdirectory first (common convention)
  const pagesPath = path.join(workspaceRoot, 'site', 'blueprints', 'pages', `${baseName}.yml`);
  if (fs.existsSync(pagesPath)) {
    return pagesPath;
  }

  // Try root blueprints directory
  const rootPath = path.join(workspaceRoot, 'site', 'blueprints', `${baseName}.yml`);
  if (fs.existsSync(rootPath)) {
    return rootPath;
  }

  return undefined;
}

/**
 * Validates a file name for security (used in scaffolding)
 * @param fileName The file name to validate
 * @returns True if valid, false otherwise
 */
export function validateFileName(fileName: string): boolean {
  if (!fileName || typeof fileName !== 'string') {
    return false;
  }

  // Reject empty names
  if (fileName.trim().length === 0) {
    return false;
  }

  // Reject path traversal attempts
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return false;
  }

  // Reject absolute paths
  if (path.isAbsolute(fileName)) {
    return false;
  }

  // Only allow alphanumeric, hyphens, and underscores
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  return validPattern.test(fileName);
}

/**
 * Gets the template name from a Blueprint file path
 * Handles nested Blueprint paths (e.g., blog/post.yml → blog.post.php)
 * @param blueprintPath Absolute path to the Blueprint file
 * @returns Template name (without .php extension), or undefined if not a valid Blueprint
 */
export function getTemplateNameFromBlueprint(blueprintPath: string): string | undefined {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot || !isBlueprintFile(blueprintPath)) {
    return undefined;
  }

  const relativePath = path.relative(workspaceRoot, blueprintPath);

  // Extract the path relative to site/blueprints/pages/
  const blueprintsPrefix = 'site/blueprints/pages/';
  if (!relativePath.startsWith(blueprintsPrefix)) {
    return undefined;
  }

  // Remove prefix and .yml extension
  const blueprintName = relativePath
    .substring(blueprintsPrefix.length)
    .replace(/\.yml$/, '');

  // Convert nested paths to dot notation (blog/post → blog.post)
  const templateName = blueprintName.replace(/[\/\\]/g, '.');

  return templateName;
}

/**
 * Gets the Blueprint name from a template file path
 * Handles dot notation templates (e.g., blog.post.php → blog/post.yml)
 * @param templatePath Absolute path to the template file
 * @returns Blueprint name (without .yml extension), or undefined if not a valid template
 */
export function getBlueprintNameFromTemplate(templatePath: string): string | undefined {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot || !isTemplateFile(templatePath)) {
    return undefined;
  }

  // Get the base name without extension
  const baseName = path.basename(templatePath, '.php');

  // Convert dot notation to nested path (blog.post → blog/post)
  const blueprintName = baseName.replace(/\./g, path.sep);

  return blueprintName;
}

/**
 * Finds the matching template file for a Blueprint file
 * @param blueprintUri VS Code URI of the Blueprint file
 * @returns VS Code URI of the template file, or undefined if not found
 */
export function findMatchingTemplate(blueprintUri: vscode.Uri): vscode.Uri | undefined {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    return undefined;
  }

  const templateName = getTemplateNameFromBlueprint(blueprintUri.fsPath);
  if (!templateName) {
    return undefined;
  }

  const templatePath = path.join(workspaceRoot, 'site', 'templates', `${templateName}.php`);

  if (fs.existsSync(templatePath)) {
    return vscode.Uri.file(templatePath);
  }

  return undefined;
}

/**
 * Finds the matching Blueprint file for a template file
 * @param templateUri VS Code URI of the template file
 * @returns VS Code URI of the Blueprint file, or undefined if not found
 */
export function findMatchingBlueprint(templateUri: vscode.Uri): vscode.Uri | undefined {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    return undefined;
  }

  const blueprintName = getBlueprintNameFromTemplate(templateUri.fsPath);
  if (!blueprintName) {
    return undefined;
  }

  const blueprintPath = path.join(workspaceRoot, 'site', 'blueprints', 'pages', `${blueprintName}.yml`);

  if (fs.existsSync(blueprintPath)) {
    return vscode.Uri.file(blueprintPath);
  }

  return undefined;
}

/**
 * Checks if a file path is a Kirby block Blueprint file
 * @param filePath Absolute path to the file
 */
export function isBlockBlueprintFile(filePath: string): boolean {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    return false;
  }

  const relativePath = path.relative(workspaceRoot, filePath);
  return relativePath.startsWith('site/blueprints/blocks/') && filePath.endsWith('.yml');
}

/**
 * Checks if a file path is a Kirby block snippet file
 * @param filePath Absolute path to the file
 */
export function isBlockSnippetFile(filePath: string): boolean {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    return false;
  }

  const relativePath = path.relative(workspaceRoot, filePath);
  return relativePath.startsWith('site/snippets/blocks/') && filePath.endsWith('.php');
}

/**
 * Checks if a file path is a Kirby field Blueprint file
 * @param filePath Absolute path to the file
 */
export function isFieldBlueprintFile(filePath: string): boolean {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    return false;
  }

  const relativePath = path.relative(workspaceRoot, filePath);
  return relativePath.startsWith('site/blueprints/fields/') && filePath.endsWith('.yml');
}

/**
 * Checks if a file path is a Kirby field snippet file
 * @param filePath Absolute path to the file
 */
export function isFieldSnippetFile(filePath: string): boolean {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    return false;
  }

  const relativePath = path.relative(workspaceRoot, filePath);
  return relativePath.startsWith('site/snippets/fields/') && filePath.endsWith('.php');
}

/**
 * Detects the block nesting strategy used in the workspace
 * by analyzing existing block snippet files
 * @param workspaceRoot Absolute path to the workspace root
 * @returns 'flat' (dot notation) or 'nested' (directories)
 */
export function detectBlockNestingStrategy(workspaceRoot: string): 'flat' | 'nested' {
  const blocksDir = path.join(workspaceRoot, 'site', 'snippets', 'blocks');

  if (!fs.existsSync(blocksDir)) {
    // Default to nested for new projects (modern convention)
    return 'nested';
  }

  try {
    const entries = fs.readdirSync(blocksDir, { withFileTypes: true });

    // Check if there are any subdirectories
    const hasNestedDirs = entries.some(entry => entry.isDirectory());

    // Check if there are any files with dot notation
    const hasFlatFiles = entries.some(entry => entry.isFile() && entry.name.includes('.') && entry.name.endsWith('.php'));

    // If both exist, prefer nested (more modern)
    if (hasNestedDirs) {
      return 'nested';
    }

    if (hasFlatFiles) {
      return 'flat';
    }

    // Default to nested if no files exist yet
    return 'nested';
  } catch {
    return 'nested';
  }
}

/**
 * Gets the block snippet name from a Blueprint file path
 * @param blueprintPath Absolute path to the Blueprint file
 * @param strategy Nesting strategy ('flat' or 'nested')
 * @returns Snippet name (without .php extension), or undefined if not a valid Blueprint
 */
export function getBlockSnippetNameFromBlueprint(blueprintPath: string, strategy: 'flat' | 'nested'): string | undefined {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot || !isBlockBlueprintFile(blueprintPath)) {
    return undefined;
  }

  const relativePath = path.relative(workspaceRoot, blueprintPath);
  const blueprintsPrefix = 'site/blueprints/blocks/';

  if (!relativePath.startsWith(blueprintsPrefix)) {
    return undefined;
  }

  // Remove prefix and .yml extension
  const blockName = relativePath
    .substring(blueprintsPrefix.length)
    .replace(/\.yml$/, '');

  if (strategy === 'flat') {
    // Convert nested paths to dot notation (gallery/image → gallery.image)
    return blockName.replace(/[\/\\]/g, '.');
  } else {
    // Keep nested structure (gallery/image → gallery/image)
    return blockName;
  }
}

/**
 * Gets the block Blueprint name from a snippet file path
 * @param snippetPath Absolute path to the snippet file
 * @returns Blueprint name (without .yml extension), or undefined if not a valid snippet
 */
export function getBlockBlueprintNameFromSnippet(snippetPath: string): string | undefined {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot || !isBlockSnippetFile(snippetPath)) {
    return undefined;
  }

  const relativePath = path.relative(workspaceRoot, snippetPath);
  const snippetsPrefix = 'site/snippets/blocks/';

  if (!relativePath.startsWith(snippetsPrefix)) {
    return undefined;
  }

  // Remove prefix and .php extension
  const blockName = relativePath
    .substring(snippetsPrefix.length)
    .replace(/\.php$/, '');

  // Convert dot notation to nested path (gallery.image → gallery/image)
  return blockName.replace(/\./g, path.sep);
}

/**
 * Gets the field snippet name from a Blueprint file path
 * @param blueprintPath Absolute path to the Blueprint file
 * @param strategy Nesting strategy ('flat' or 'nested')
 * @returns Snippet name (without .php extension), or undefined if not a valid Blueprint
 */
export function getFieldSnippetNameFromBlueprint(blueprintPath: string, strategy: 'flat' | 'nested'): string | undefined {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot || !isFieldBlueprintFile(blueprintPath)) {
    return undefined;
  }

  const relativePath = path.relative(workspaceRoot, blueprintPath);
  const blueprintsPrefix = 'site/blueprints/fields/';

  if (!relativePath.startsWith(blueprintsPrefix)) {
    return undefined;
  }

  // Remove prefix and .yml extension
  const fieldName = relativePath
    .substring(blueprintsPrefix.length)
    .replace(/\.yml$/, '');

  if (strategy === 'flat') {
    // Convert nested paths to dot notation
    return fieldName.replace(/[\/\\]/g, '.');
  } else {
    // Keep nested structure
    return fieldName;
  }
}

/**
 * Finds the matching block snippet file for a block Blueprint file
 * @param blueprintUri VS Code URI of the Blueprint file
 * @returns Absolute path to the snippet file, or undefined if not found
 */
export function findMatchingBlockSnippet(blueprintUri: vscode.Uri): string | undefined {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot || !isBlockBlueprintFile(blueprintUri.fsPath)) {
    return undefined;
  }

  // Try nested strategy first
  let snippetName = getBlockSnippetNameFromBlueprint(blueprintUri.fsPath, 'nested');
  if (snippetName) {
    const snippetPath = path.join(workspaceRoot, 'site', 'snippets', 'blocks', `${snippetName}.php`);
    if (fs.existsSync(snippetPath)) {
      return snippetPath;
    }
  }

  // Try flat strategy
  snippetName = getBlockSnippetNameFromBlueprint(blueprintUri.fsPath, 'flat');
  if (snippetName) {
    const snippetPath = path.join(workspaceRoot, 'site', 'snippets', 'blocks', `${snippetName}.php`);
    if (fs.existsSync(snippetPath)) {
      return snippetPath;
    }
  }

  return undefined;
}

/**
 * Finds the matching block Blueprint file for a block snippet file
 * @param snippetUri VS Code URI of the snippet file
 * @returns Absolute path to the Blueprint file, or undefined if not found
 */
export function findMatchingBlockBlueprint(snippetUri: vscode.Uri): string | undefined {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot || !isBlockSnippetFile(snippetUri.fsPath)) {
    return undefined;
  }

  const blueprintName = getBlockBlueprintNameFromSnippet(snippetUri.fsPath);
  if (!blueprintName) {
    return undefined;
  }

  const blueprintPath = path.join(workspaceRoot, 'site', 'blueprints', 'blocks', `${blueprintName}.yml`);

  if (fs.existsSync(blueprintPath)) {
    return blueprintPath;
  }

  return undefined;
}

/**
 * Finds the matching field snippet file for a field Blueprint file
 * @param blueprintUri VS Code URI of the Blueprint file
 * @returns Absolute path to the snippet file, or undefined if not found
 */
export function findMatchingFieldSnippet(blueprintUri: vscode.Uri): string | undefined {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot || !isFieldBlueprintFile(blueprintUri.fsPath)) {
    return undefined;
  }

  // Try nested strategy first
  let snippetName = getFieldSnippetNameFromBlueprint(blueprintUri.fsPath, 'nested');
  if (snippetName) {
    const snippetPath = path.join(workspaceRoot, 'site', 'snippets', 'fields', `${snippetName}.php`);
    if (fs.existsSync(snippetPath)) {
      return snippetPath;
    }
  }

  // Try flat strategy
  snippetName = getFieldSnippetNameFromBlueprint(blueprintUri.fsPath, 'flat');
  if (snippetName) {
    const snippetPath = path.join(workspaceRoot, 'site', 'snippets', 'fields', `${snippetName}.php`);
    if (fs.existsSync(snippetPath)) {
      return snippetPath;
    }
  }

  return undefined;
}
