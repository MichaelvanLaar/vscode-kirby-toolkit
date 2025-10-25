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
