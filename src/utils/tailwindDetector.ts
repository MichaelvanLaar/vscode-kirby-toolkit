import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Result of Tailwind CSS detection
 */
export interface TailwindDetectionResult {
  isInstalled: boolean;
  version?: string;
  packageJsonPath?: string;
}

/**
 * Detects if Tailwind CSS is installed in the workspace
 * @param workspaceFolder The workspace folder to check
 * @returns Detection result with installation status and version
 */
export function detectTailwind(workspaceFolder: vscode.WorkspaceFolder): TailwindDetectionResult {
  const packageJsonPath = path.join(workspaceFolder.uri.fsPath, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    return { isInstalled: false };
  }

  try {
    const content = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(content);

    // Check both dependencies and devDependencies
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};

    const version = dependencies.tailwindcss || devDependencies.tailwindcss;

    if (version) {
      return {
        isInstalled: true,
        version: version,
        packageJsonPath: packageJsonPath
      };
    }

    return { isInstalled: false };
  } catch (error) {
    // Invalid JSON or read error
    return { isInstalled: false };
  }
}

/**
 * Gets the Tailwind CSS version from the detection result
 * @param result Detection result
 * @returns Version string or undefined
 */
export function getTailwindVersion(result: TailwindDetectionResult): string | undefined {
  return result.version;
}

/**
 * Checks if the Tailwind CSS IntelliSense extension is installed
 * @returns True if the extension is installed
 */
export function isTailwindExtensionInstalled(): boolean {
  const extension = vscode.extensions.getExtension('bradlc.vscode-tailwindcss');
  return extension !== undefined;
}
