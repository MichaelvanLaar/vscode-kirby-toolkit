import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Detected build scripts from package.json
 */
export interface BuildScripts {
  /** Development/watch script (e.g., "npm run dev") */
  dev?: string;
  /** One-time build script (e.g., "npm run build") */
  build?: string;
  /** Watch script (e.g., "npm run watch") */
  watch?: string;
}

/**
 * Package.json structure
 */
interface PackageJson {
  scripts?: Record<string, string>;
  [key: string]: any;
}

/**
 * Detects build scripts from package.json in the workspace
 *
 * @param workspacePath Path to workspace folder
 * @returns Promise resolving to detected build scripts
 */
export async function detectBuildScripts(workspacePath: string): Promise<BuildScripts> {
  try {
    const packageJsonPath = path.join(workspacePath, 'package.json');

    // Read package.json
    const content = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJson: PackageJson = JSON.parse(content);

    // Extract scripts
    const scripts = packageJson.scripts || {};

    // Detect dev/watch script with priority
    const devScript =
      scripts.dev ||
      scripts.watch ||
      scripts['dev:css'] ||
      scripts['watch:css'] ||
      scripts['dev:assets'] ||
      scripts['watch:assets'];

    // Detect build script with priority
    const buildScript =
      scripts.build ||
      scripts['build:css'] ||
      scripts['build:assets'] ||
      scripts.compile ||
      scripts['compile:css'];

    // Detect watch script with priority
    const watchScript =
      scripts.watch ||
      scripts.dev ||
      scripts['watch:css'] ||
      scripts['dev:css'];

    return {
      dev: devScript,
      build: buildScript,
      watch: watchScript
    };
  } catch (error) {
    // Handle missing or invalid package.json
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error('package.json not found in workspace root');
    }

    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON in package.json');
    }

    throw error;
  }
}

/**
 * Validates that a build command is executable
 *
 * @param command Build command to validate (e.g., "vite build")
 * @returns True if command appears valid
 */
export function validateBuildCommand(command: string): boolean {
  if (!command || typeof command !== 'string') {
    return false;
  }

  const trimmed = command.trim();

  // Must not be empty
  if (trimmed.length === 0) {
    return false;
  }

  // Should not contain dangerous characters
  const dangerousPatterns = [
    /&&/,  // Command chaining
    /\|\|/, // Or operator
    /;/,    // Command separator
    /`/,    // Command substitution
    /\$\(/, // Command substitution
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmed)) {
      return false;
    }
  }

  return true;
}

/**
 * Gets the npm command to run a script
 *
 * @param scriptName Script name from package.json (e.g., "dev")
 * @returns Full npm command (e.g., "npm run dev")
 */
export function getNpmCommand(scriptName: string): string {
  return `npm run ${scriptName}`;
}

/**
 * Detects if package.json exists in workspace
 *
 * @param workspacePath Path to workspace folder
 * @returns Promise resolving to true if package.json exists
 */
export async function hasPackageJson(workspacePath: string): Promise<boolean> {
  try {
    const packageJsonPath = path.join(workspacePath, 'package.json');
    await fs.access(packageJsonPath);
    return true;
  } catch {
    return false;
  }
}
