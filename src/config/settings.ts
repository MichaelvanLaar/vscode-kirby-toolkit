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

/**
 * Check if block snippet synchronization is enabled
 */
export function getSyncBlockSnippets(): boolean {
  return getConfig().get<boolean>('syncBlockSnippets', true);
}

/**
 * Check if field snippet synchronization is enabled
 */
export function getSyncFieldSnippets(): boolean {
  return getConfig().get<boolean>('syncFieldSnippets', false);
}

/**
 * Get the block nesting strategy
 * @returns 'auto' (detect from existing files), 'flat' (dot notation), or 'nested' (directories)
 */
export function getSyncBlockNestingStrategy(): 'auto' | 'flat' | 'nested' {
  return getConfig().get<'auto' | 'flat' | 'nested'>('syncBlockNestingStrategy', 'auto');
}
