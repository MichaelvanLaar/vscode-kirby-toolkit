import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { detectKirbyProject, getWorkspaceRoot, resolveSnippetPath, snippetExists } from '../utils/kirbyProject';
import { isAutoInjectTypeHintsEnabled, getTypeHintVariables } from '../config/settings';

/**
 * Registers the Extract to Snippet command
 */
export function registerExtractToSnippetCommand(context: vscode.ExtensionContext): void {
  const command = vscode.commands.registerCommand('kirby.extractToSnippet', async () => {
    // Check if this is a Kirby project
    if (!detectKirbyProject()) {
      vscode.window.showErrorMessage('Not a Kirby project. Please open a Kirby workspace.');
      return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor');
      return;
    }

    const selection = editor.selection;
    if (selection.isEmpty) {
      vscode.window.showErrorMessage('Please select code to extract into a snippet');
      return;
    }

    const selectedText = editor.document.getText(selection);

    // Validate selection
    const validation = validateSelection(selectedText);
    if (!validation.valid && validation.error) {
      vscode.window.showErrorMessage(validation.error);
      return;
    }

    // Show warning for unbalanced brackets
    if (validation.warning) {
      const proceed = await vscode.window.showWarningMessage(
        validation.warning,
        'Continue Anyway',
        'Cancel'
      );
      if (proceed !== 'Continue Anyway') {
        return;
      }
    }

    // Prompt for snippet name
    const snippetName = await promptSnippetName();
    if (!snippetName) {
      return; // User cancelled
    }

    // Check if snippet already exists
    if (snippetExists(snippetName)) {
      vscode.window.showErrorMessage(`Snippet '${snippetName}' already exists. Please choose a different name.`);
      return;
    }

    // Extract to snippet
    try {
      await extractToSnippet(editor, selection, selectedText, snippetName);

      vscode.window.showInformationMessage(
        `Extracted to snippet '${snippetName}'`,
        'Open Snippet'
      ).then(choice => {
        if (choice === 'Open Snippet') {
          const snippetPath = resolveSnippetPath(snippetName);
          if (snippetPath) {
            vscode.workspace.openTextDocument(snippetPath).then(doc => {
              vscode.window.showTextDocument(doc);
            });
          }
        }
      });
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to extract snippet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  context.subscriptions.push(command);
}

/**
 * Validation result
 */
interface ValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
}

/**
 * Validates the selected code
 */
function validateSelection(text: string): ValidationResult {
  if (text.trim().length === 0) {
    return {
      valid: false,
      error: 'Selection is empty'
    };
  }

  // Check size limit (100KB)
  if (text.length > 100 * 1024) {
    return {
      valid: true,
      warning: 'Selection is very large (>100KB). Are you sure you want to extract this to a snippet?'
    };
  }

  // Check for unbalanced brackets
  const brackets = { '{': '}', '(': ')', '[': ']' };
  const stack: string[] = [];

  for (const char of text) {
    if (Object.keys(brackets).includes(char)) {
      stack.push(char);
    } else if (Object.values(brackets).includes(char)) {
      const last = stack.pop();
      if (!last || brackets[last as keyof typeof brackets] !== char) {
        return {
          valid: true,
          warning: 'Selection may contain unbalanced brackets. The extracted snippet may not work correctly.'
        };
      }
    }
  }

  if (stack.length > 0) {
    return {
      valid: true,
      warning: 'Selection may contain unbalanced brackets. The extracted snippet may not work correctly.'
    };
  }

  return { valid: true };
}

/**
 * Prompts the user for a snippet name
 */
async function promptSnippetName(): Promise<string | undefined> {
  const name = await vscode.window.showInputBox({
    prompt: 'Enter snippet name (e.g., "header" or "partials/menu")',
    placeHolder: 'header',
    validateInput: (value) => {
      if (!value || value.trim().length === 0) {
        return 'Snippet name cannot be empty';
      }

      // Check for path traversal and invalid characters
      if (value.includes('..') || value.includes('\\')) {
        return 'Invalid snippet name. Use only letters, numbers, hyphens, underscores, and forward slashes for nested paths.';
      }

      // Check if it's an absolute path
      if (path.isAbsolute(value)) {
        return 'Snippet name cannot be an absolute path';
      }

      return null;
    }
  });

  return name?.trim();
}

/**
 * Extracts the selected code to a snippet file and replaces it with a snippet() call
 */
async function extractToSnippet(
  editor: vscode.TextEditor,
  selection: vscode.Selection,
  selectedText: string,
  snippetName: string
): Promise<void> {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    throw new Error('Workspace root not found');
  }

  // Create snippet file
  const snippetPath = resolveSnippetPath(snippetName);
  if (!snippetPath) {
    throw new Error('Invalid snippet name');
  }

  // Create directory if needed
  const snippetDir = path.dirname(snippetPath);
  if (!fs.existsSync(snippetDir)) {
    fs.mkdirSync(snippetDir, { recursive: true });
  }

  // Prepare snippet content
  let snippetContent = selectedText;

  // Add type hints if enabled and not already present
  const autoInjectTypeHints = isAutoInjectTypeHintsEnabled();
  if (autoInjectTypeHints && !selectedText.includes('@var')) {
    const variables = getTypeHintVariables();
    let typeHints = '<?php\n/**\n';
    for (const variable of variables) {
      const type = getTypeForVariable(variable);
      typeHints += ` * @var ${type} ${variable}\n`;
    }
    typeHints += ' */\n?>\n';
    snippetContent = typeHints + snippetContent;
  }

  // Prepare replacement snippet call
  const indentation = getLineIndentation(editor.document, selection.start.line);
  const isInPhpContext = isSelectionInPhpContext(editor.document, selection);

  let replacementText: string;
  if (isInPhpContext) {
    replacementText = `${indentation}snippet('${snippetName}')`;
  } else {
    replacementText = `${indentation}<?php snippet('${snippetName}') ?>`;
  }

  // Use WorkspaceEdit for atomic operation
  const edit = new vscode.WorkspaceEdit();

  // Create snippet file
  const snippetUri = vscode.Uri.file(snippetPath);
  edit.createFile(snippetUri, { ignoreIfExists: false });
  edit.insert(snippetUri, new vscode.Position(0, 0), snippetContent);

  // Replace selection with snippet call
  edit.replace(editor.document.uri, selection, replacementText);

  // Apply all edits atomically
  const success = await vscode.workspace.applyEdit(edit);
  if (!success) {
    throw new Error('Failed to apply edits');
  }
}

/**
 * Gets the indentation of a line
 */
function getLineIndentation(document: vscode.TextDocument, lineNumber: number): string {
  const line = document.lineAt(lineNumber);
  const match = line.text.match(/^(\s*)/);
  return match ? match[1] : '';
}

/**
 * Checks if the selection is within a PHP context (inside <?php ?> tags)
 */
function isSelectionInPhpContext(document: vscode.TextDocument, selection: vscode.Selection): boolean {
  const textBeforeSelection = document.getText(new vscode.Range(
    new vscode.Position(0, 0),
    selection.start
  ));

  // Count PHP open and close tags
  const openTags = (textBeforeSelection.match(/<\?php/g) || []).length;
  const closeTags = (textBeforeSelection.match(/\?>/g) || []).length;

  // If more open tags than close tags, we're in PHP context
  return openTags > closeTags;
}

/**
 * Gets the type for a variable (for type hints)
 */
function getTypeForVariable(variable: string): string {
  switch (variable) {
    case '$page':
      return '\\Kirby\\Cms\\Page';
    case '$site':
      return '\\Kirby\\Cms\\Site';
    case '$kirby':
      return '\\Kirby\\Cms\\App';
    default:
      return 'mixed';
  }
}
