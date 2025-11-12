import * as vscode from 'vscode';
import { isTemplateFile, isSnippetFile, isSnippetControllerFile } from '../utils/kirbyProject';
import { getTypeHintVariables, isSnippetControllerSupportEnabled } from '../config/settings';

/**
 * Type mapping for Kirby global variables
 */
const TYPE_MAP: Record<string, string> = {
  '$page': '\\Kirby\\Cms\\Page',
  '$site': '\\Kirby\\Cms\\Site',
  '$kirby': '\\Kirby\\Cms\\App'
};

/**
 * Generates a PHPDoc type-hint block for Kirby variables
 * @param variables Array of variable names to include (e.g., ['$page', '$site'])
 * @returns The PHPDoc comment block as a string
 */
export function generateTypeHintBlock(variables: string[]): string {
  const lines = ['<?php', '/**'];

  for (const variable of variables) {
    const type = TYPE_MAP[variable] || 'mixed';
    lines.push(` * @var ${type} ${variable}`);
  }

  lines.push(' */');
  return lines.join('\n') + '\n';
}

/**
 * Checks if a document already contains type-hints
 * @param document The document to check
 * @returns true if type-hints are already present
 */
export function hasTypeHints(document: vscode.TextDocument): boolean {
  const text = document.getText();
  // Check for the presence of @var annotations in the first 20 lines
  const firstLines = text.split('\n').slice(0, 20).join('\n');
  return /@var\s+\\Kirby\\Cms\\/i.test(firstLines);
}

/**
 * Injects type-hints into a document at the beginning
 * @param document The document to inject into
 */
export async function injectTypeHints(document: vscode.TextDocument): Promise<boolean> {
  const filePath = document.uri.fsPath;

  // Check if file is a template, snippet, or snippet controller
  const isTemplate = isTemplateFile(filePath);
  const isSnippet = isSnippetFile(filePath);
  const isSnippetController = isSnippetControllerFile(filePath);

  // Check if file is eligible for type-hint injection
  if (!isTemplate && !isSnippet && !isSnippetController) {
    return false;
  }

  // Respect snippet controller configuration
  if (isSnippetController && !isSnippetControllerSupportEnabled()) {
    return false;
  }

  // Check if type-hints already exist
  if (hasTypeHints(document)) {
    vscode.window.showInformationMessage('Type hints already exist in this file.');
    return false;
  }

  // Get configured variables
  const variables = getTypeHintVariables();
  const typeHintBlock = generateTypeHintBlock(variables);

  // Get the active text editor
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.uri.toString() !== document.uri.toString()) {
    return false;
  }

  // Insert at position 0
  const success = await editor.edit(editBuilder => {
    editBuilder.insert(new vscode.Position(0, 0), typeHintBlock);
  });

  if (success) {
    vscode.window.showInformationMessage('Type hints added successfully.');
  }

  return success;
}

/**
 * Handles automatic type-hint injection on file creation
 * @param uri The URI of the created file
 */
export async function handleFileCreation(uri: vscode.Uri): Promise<void> {
  const filePath = uri.fsPath;

  // Check if it's a template, snippet, or snippet controller file
  const isTemplate = isTemplateFile(filePath);
  const isSnippet = isSnippetFile(filePath);
  const isSnippetController = isSnippetControllerFile(filePath);

  if (!isTemplate && !isSnippet && !isSnippetController) {
    return;
  }

  // Respect snippet controller configuration
  if (isSnippetController && !isSnippetControllerSupportEnabled()) {
    return;
  }

  try {
    // Open the document - VS Code will wait until it's ready
    const document = await vscode.workspace.openTextDocument(uri);

    // Only inject if the document is empty or very small
    // (to avoid overwriting existing content if file wasn't truly new)
    if (document.getText().trim().length < 10) {
      await injectTypeHints(document);
    }
  } catch (error) {
    // Silently fail if document can't be opened
    console.error('Failed to handle file creation for type hints:', error);
  }
}
