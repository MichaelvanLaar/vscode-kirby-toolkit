import * as vscode from 'vscode';

const CONFIG_SECTION = 'kirby';

/**
 * Gets the Kirby extension configuration
 */
function getConfig(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration(CONFIG_SECTION);
}

/**
 * Check if automatic type-hint injection is enabled
 */
export function isAutoInjectTypeHintsEnabled(): boolean {
  return getConfig().get<boolean>('autoInjectTypeHints', true);
}

/**
 * Get the list of variables to include in type-hint blocks
 */
export function getTypeHintVariables(): string[] {
  return getConfig().get<string[]>('typeHintVariables', ['$page', '$site', '$kirby']);
}

/**
 * Check if Blueprint validation is enabled
 */
export function isBlueprintValidationEnabled(): boolean {
  return getConfig().get<boolean>('enableBlueprintValidation', true);
}

/**
 * Get the custom Blueprint schema path (if configured)
 */
export function getBlueprintSchemaPath(): string {
  return getConfig().get<string>('blueprintSchemaPath', '');
}

/**
 * Check if snippet CodeLens is enabled
 */
export function isSnippetCodeLensEnabled(): boolean {
  return getConfig().get<boolean>('showSnippetCodeLens', true);
}
