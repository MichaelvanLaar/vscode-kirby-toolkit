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
