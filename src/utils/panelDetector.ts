import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Checks if a server is running at the specified URL
 * @param url The URL to check
 * @returns Promise<boolean> true if server is reachable
 */
export async function isServerRunning(url: string): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000); // 2s timeout

        const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
        });

        clearTimeout(timeout);
        // Accept both successful responses (2xx) and auth required (401)
        return response.ok || response.status === 401;
    } catch (error) {
        // Connection refused, timeout, or other network errors
        return false;
    }
}

/**
 * Extracts port number from a command string (e.g., "php -S localhost:8000")
 * @param command The command string to parse
 * @returns number | null The extracted port or null
 */
function extractPortFromCommand(command: string | undefined): number | null {
    if (!command) {
        return null;
    }

    // Match patterns like:
    // - "php -S localhost:8000"
    // - "php -S 127.0.0.1:3000"
    // - "localhost:8080"
    // - ":8888"
    const portMatch = command.match(/:(\d+)/);
    if (portMatch && portMatch[1]) {
        const port = parseInt(portMatch[1], 10);
        if (port > 0 && port <= 65535) {
            return port;
        }
    }

    return null;
}

/**
 * Reads and parses package.json from workspace root
 * @returns Promise<any | null> Parsed package.json or null
 */
async function readPackageJson(): Promise<any | null> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        return null;
    }

    const packageJsonPath = path.join(workspaceFolders[0].uri.fsPath, 'package.json');

    try {
        if (fs.existsSync(packageJsonPath)) {
            const content = fs.readFileSync(packageJsonPath, 'utf8');
            return JSON.parse(content);
        }
    } catch (error) {
        // Invalid JSON or read error
        return null;
    }

    return null;
}

/**
 * Prompts user to enter Panel URL manually
 * @returns Promise<string | null> The entered URL or null if cancelled
 */
export async function promptForPanelUrl(): Promise<string | null> {
    const url = await vscode.window.showInputBox({
        prompt: 'Enter the Kirby Panel URL',
        placeHolder: 'http://localhost:8000/panel',
        validateInput: (value) => {
            if (!value) {
                return 'URL cannot be empty';
            }
            try {
                new URL(value);
                return undefined; // Valid
            } catch {
                return 'Invalid URL format';
            }
        }
    });

    if (url) {
        // Save to workspace configuration
        const config = vscode.workspace.getConfiguration('kirby');
        await config.update('panelUrl', url, vscode.ConfigurationTarget.Workspace);
    }

    return url || null;
}

/**
 * Detects the Kirby Panel URL using multiple strategies
 * @returns Promise<string | null> The detected Panel URL or null
 */
export async function detectPanelUrl(): Promise<string | null> {
    const config = vscode.workspace.getConfiguration('kirby');

    // Strategy 1: Check explicit configuration
    const configUrl = config.get<string>('panelUrl');
    if (configUrl && configUrl.trim() !== '') {
        if (await isServerRunning(configUrl)) {
            return configUrl;
        }
        // Config URL set but not reachable - log warning but continue to auto-detect
        console.warn(`Configured Panel URL ${configUrl} is not reachable, attempting auto-detection`);
    }

    // Check if auto-detect is enabled
    const autoDetect = config.get<boolean>('panelAutoDetect', true);
    if (!autoDetect) {
        // Auto-detect disabled and config URL not working
        return null;
    }

    // Strategy 2: Probe common localhost ports
    const commonPorts = [8000, 3000, 8080, 8888];
    for (const port of commonPorts) {
        const url = `http://localhost:${port}/panel`;
        if (await isServerRunning(url)) {
            return url;
        }
    }

    // Strategy 3: Parse package.json for server hints
    const packageJson = await readPackageJson();
    if (packageJson?.scripts) {
        // Check common script names
        const scriptNames = ['dev', 'start', 'serve', 'server'];
        for (const scriptName of scriptNames) {
            const script = packageJson.scripts[scriptName];
            const port = extractPortFromCommand(script);
            if (port) {
                const url = `http://localhost:${port}/panel`;
                if (await isServerRunning(url)) {
                    return url;
                }
            }
        }
    }

    // Strategy 4: All detection failed, return null
    // Caller should prompt user or show error
    return null;
}

/**
 * Detects Panel URL with user prompt fallback
 * @param showPromptOnFailure Whether to prompt user if detection fails
 * @returns Promise<string | null> The detected or entered Panel URL
 */
export async function detectPanelUrlWithPrompt(showPromptOnFailure = true): Promise<string | null> {
    let url = await detectPanelUrl();

    if (!url && showPromptOnFailure) {
        url = await promptForPanelUrl();
    }

    return url;
}

/**
 * URL detection result with status information
 */
export interface PanelUrlDetectionResult {
    url: string | null;
    isReachable: boolean;
    detectionMethod: 'config' | 'probe' | 'package-json' | 'manual' | 'failed';
}

/**
 * Detects Panel URL and returns detailed result
 * @returns Promise<PanelUrlDetectionResult> Detection result with metadata
 */
export async function detectPanelUrlDetailed(): Promise<PanelUrlDetectionResult> {
    const config = vscode.workspace.getConfiguration('kirby');

    // Strategy 1: Check explicit configuration
    const configUrl = config.get<string>('panelUrl');
    if (configUrl && configUrl.trim() !== '') {
        const isReachable = await isServerRunning(configUrl);
        if (isReachable) {
            return {
                url: configUrl,
                isReachable: true,
                detectionMethod: 'config'
            };
        }
    }

    // Check if auto-detect is enabled
    const autoDetect = config.get<boolean>('panelAutoDetect', true);
    if (!autoDetect) {
        return {
            url: configUrl || null,
            isReachable: false,
            detectionMethod: 'failed'
        };
    }

    // Strategy 2: Probe common localhost ports
    const commonPorts = [8000, 3000, 8080, 8888];
    for (const port of commonPorts) {
        const url = `http://localhost:${port}/panel`;
        if (await isServerRunning(url)) {
            return {
                url,
                isReachable: true,
                detectionMethod: 'probe'
            };
        }
    }

    // Strategy 3: Parse package.json for server hints
    const packageJson = await readPackageJson();
    if (packageJson?.scripts) {
        const scriptNames = ['dev', 'start', 'serve', 'server'];
        for (const scriptName of scriptNames) {
            const script = packageJson.scripts[scriptName];
            const port = extractPortFromCommand(script);
            if (port) {
                const url = `http://localhost:${port}/panel`;
                if (await isServerRunning(url)) {
                    return {
                        url,
                        isReachable: true,
                        detectionMethod: 'package-json'
                    };
                }
            }
        }
    }

    // All detection failed
    return {
        url: null,
        isReachable: false,
        detectionMethod: 'failed'
    };
}
