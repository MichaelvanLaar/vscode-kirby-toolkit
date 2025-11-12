import * as vscode from 'vscode';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';

/**
 * IntelephenseIntegration manages the integration with the Intelephense PHP language server
 * by copying Kirby API stub files to the workspace and configuring Intelephense to index them.
 */
export class IntelephenseIntegration {
    private context: vscode.ExtensionContext;
    private outputChannel: vscode.OutputChannel;
    private stubsInstalled: boolean = false;

    /**
     * The relative path from workspace root where stubs will be copied
     */
    private readonly WORKSPACE_STUBS_DIR = '.vscode/kirby-stubs';

    /**
     * Intelephense extension ID
     */
    private readonly INTELEPHENSE_EXTENSION_ID = 'bmewburn.vscode-intelephense-client';

    constructor(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) {
        this.context = context;
        this.outputChannel = outputChannel;
    }

    /**
     * Initializes the Intelephense integration by checking for the extension,
     * copying stub files, and configuring workspace settings.
     */
    public async initialize(): Promise<boolean> {
        const config = vscode.workspace.getConfiguration('kirby');
        const enabled = config.get<boolean>('enableApiIntelliSense', true);

        if (!enabled) {
            this.log('API IntelliSense is disabled via settings');
            return false;
        }

        // Check if we're in a workspace
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            this.log('No workspace folder found, skipping stub initialization');
            return false;
        }

        // Detect Intelephense extension
        if (!this.detectIntelephense()) {
            await this.showIntelephenseNotInstalledMessage(workspaceFolder.uri.fsPath);
            return false;
        }

        // Initialize stubs
        try {
            await this.initializeStubs(workspaceFolder.uri.fsPath);
            await this.configureIntelephense(workspaceFolder.uri.fsPath);
            await this.updateGitignore(workspaceFolder.uri.fsPath);
            this.stubsInstalled = true;
            this.log('Kirby API stubs initialized successfully');
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logError('Failed to initialize API stubs', error);
            void vscode.window.showErrorMessage(
                `Failed to initialize Kirby API stubs: ${errorMessage}. Check the Kirby Toolkit output channel for details.`
            );
            return false;
        }
    }

    /**
     * Detects if the Intelephense extension is installed
     */
    public detectIntelephense(): boolean {
        const extension = vscode.extensions.getExtension(this.INTELEPHENSE_EXTENSION_ID);
        const isInstalled = extension !== undefined;
        this.log(`Intelephense extension ${isInstalled ? 'detected' : 'not found'}`);
        return isInstalled;
    }

    /**
     * Shows a one-time informational message recommending Intelephense installation
     */
    private async showIntelephenseNotInstalledMessage(workspacePath: string): Promise<void> {
        // Check if we've already shown this message for this workspace
        const storageKey = `intelephense-prompt-shown-${this.getWorkspaceHash(workspacePath)}`;
        const alreadyShown = this.context.globalState.get<boolean>(storageKey, false);

        if (alreadyShown) {
            return;
        }

        const choice = await vscode.window.showInformationMessage(
            'The Kirby Toolkit can provide enhanced API IntelliSense with the Intelephense extension. Would you like to install it?',
            'Install Intelephense',
            'Not Now'
        );

        if (choice === 'Install Intelephense') {
            await vscode.commands.executeCommand('workbench.extensions.installExtension', this.INTELEPHENSE_EXTENSION_ID);
        }

        // Mark as shown
        await this.context.globalState.update(storageKey, true);
    }

    /**
     * Generates a simple hash from the workspace path for storage keys
     */
    private getWorkspaceHash(workspacePath: string): string {
        // Simple hash function (not cryptographic, just for uniqueness)
        let hash = 0;
        for (let i = 0; i < workspacePath.length; i++) {
            const char = workspacePath.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * Copies stub files from the extension to the workspace
     */
    public async initializeStubs(workspacePath: string): Promise<void> {
        const targetDir = path.join(workspacePath, this.WORKSPACE_STUBS_DIR);

        // Skip if stubs already exist
        if (fs.existsSync(targetDir)) {
            this.log('Stub directory already exists, skipping copy');
            this.stubsInstalled = true;
            return;
        }

        this.log(`Copying stubs to ${targetDir}`);

        // Get source directory (from extension's bundled stubs)
        const config = vscode.workspace.getConfiguration('kirby');
        const customStubsPath = config.get<string>('customStubsPath', '');

        let sourceDir: string;
        if (customStubsPath) {
            // Validate custom stubs path for security
            const validatedPath = this.validateStubsPath(customStubsPath, workspacePath);
            if (!validatedPath) {
                this.logError('Invalid custom stubs path, falling back to bundled stubs', new Error('Path validation failed'));
                void vscode.window.showWarningMessage(
                    'Invalid custom stubs path in settings. Using bundled stubs instead.'
                );
                sourceDir = path.join(this.context.extensionPath, 'out', 'stubs', 'kirby-api');
            } else if (!fs.existsSync(validatedPath)) {
                this.log(`Custom stubs path does not exist: ${validatedPath}, using bundled stubs`);
                sourceDir = path.join(this.context.extensionPath, 'out', 'stubs', 'kirby-api');
            } else {
                sourceDir = validatedPath;
                this.log(`Using custom stubs from ${validatedPath}`);
            }
        } else {
            sourceDir = path.join(this.context.extensionPath, 'out', 'stubs', 'kirby-api');
            this.log(`Using bundled stubs from ${sourceDir}`);
        }

        if (!fs.existsSync(sourceDir)) {
            throw new Error(`Stub source directory not found: ${sourceDir}`);
        }

        // Copy stubs recursively
        await this.copyDirectory(sourceDir, targetDir);
        this.log('Stub files copied successfully');
    }

    /**
     * Validates a custom stubs path for security
     * @param customPath The custom path from settings
     * @param workspacePath The workspace root path
     * @returns The validated absolute path, or null if invalid
     */
    private validateStubsPath(customPath: string, workspacePath: string): string | null {
        if (!customPath || typeof customPath !== 'string') {
            return null;
        }

        // Resolve to absolute path
        const absolutePath = path.isAbsolute(customPath)
            ? path.resolve(customPath)
            : path.resolve(workspacePath, customPath);

        // Normalize to remove any .. or . segments
        const normalizedPath = path.normalize(absolutePath);

        // If relative path, ensure it resolves within workspace
        if (!path.isAbsolute(customPath)) {
            const relativePath = path.relative(workspacePath, normalizedPath);
            if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
                this.logError('Custom stubs path escapes workspace directory', new Error('Security violation'));
                return null;
            }
        }

        // Additional safety: check the path doesn't point to sensitive system directories
        const dangerousPaths = [
            '/etc', '/sys', '/proc', '/dev', '/root', '/boot',
            'C:\\Windows', 'C:\\Program Files', 'C:\\Program Files (x86)', 'C:\\System'
        ];
        if (dangerousPaths.some(dangerous => normalizedPath.startsWith(dangerous))) {
            this.logError('Custom stubs path points to sensitive system directory', new Error('Security violation'));
            return null;
        }

        return normalizedPath;
    }

    /**
     * Recursively copies a directory (async for better performance)
     */
    private async copyDirectory(source: string, target: string): Promise<void> {
        // Create target directory
        try {
            await fsPromises.mkdir(target, { recursive: true });
        } catch (error) {
            // Directory might already exist, that's fine
        }

        // Read directory contents
        const entries = await fsPromises.readdir(source, { withFileTypes: true });

        // Process entries in parallel for better performance
        await Promise.all(entries.map(async (entry) => {
            const sourcePath = path.join(source, entry.name);
            const targetPath = path.join(target, entry.name);

            // Skip symlinks for security
            if (entry.isSymbolicLink()) {
                this.log(`Skipping symlink: ${sourcePath}`);
                return;
            }

            if (entry.isDirectory()) {
                await this.copyDirectory(sourcePath, targetPath);
            } else if (entry.isFile()) {
                await fsPromises.copyFile(sourcePath, targetPath);
            }
        }));
    }

    /**
     * Configures Intelephense to index the stub directory by updating workspace settings
     */
    public async configureIntelephense(workspacePath: string): Promise<void> {
        const settingsPath = path.join(workspacePath, '.vscode', 'settings.json');
        const stubPath = this.WORKSPACE_STUBS_DIR;

        this.log('Configuring Intelephense settings');

        // Ensure .vscode directory exists
        const vscodeDir = path.dirname(settingsPath);
        try {
            await fsPromises.mkdir(vscodeDir, { recursive: true });
        } catch (error) {
            // Directory might already exist
        }

        // Read existing settings or create new
        let settings: any = {};
        try {
            const content = await fsPromises.readFile(settingsPath, 'utf-8');
            settings = JSON.parse(content);
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                // File doesn't exist yet, that's fine
                this.log('No existing settings.json, will create new');
            } else {
                this.logError('Failed to parse existing settings.json', error);

                // Create backup of malformed file
                const backupPath = settingsPath + '.backup';
                try {
                    const originalContent = await fsPromises.readFile(settingsPath, 'utf-8');
                    await fsPromises.writeFile(backupPath, originalContent, 'utf-8');
                    this.log(`Created backup of malformed settings.json at ${backupPath}`);
                } catch (backupError) {
                    this.logError('Failed to create backup of settings.json', backupError);
                }

                // Warn user
                void vscode.window.showWarningMessage(
                    'Failed to parse .vscode/settings.json. A backup has been created. Using default settings for Intelephense configuration.',
                    'Show Output'
                ).then(choice => {
                    if (choice === 'Show Output') {
                        this.outputChannel.show();
                    }
                });

                // Use empty settings object
                settings = {};
            }
        }

        // Update intelephense.stubs setting
        const currentStubs = settings['intelephense.stubs'] || [];
        if (!Array.isArray(currentStubs)) {
            this.logError('intelephense.stubs is not an array, resetting', new Error('Invalid type'));
            settings['intelephense.stubs'] = [];
        }

        // Validate and filter array items - ensure all items are strings
        const validStubs = Array.isArray(currentStubs)
            ? currentStubs.filter((item): item is string => typeof item === 'string')
            : [];

        // Add stub path if not already present
        if (!validStubs.includes(stubPath)) {
            validStubs.push(stubPath);
            settings['intelephense.stubs'] = validStubs;

            // Write updated settings
            const settingsJson = JSON.stringify(settings, null, 2);
            await fsPromises.writeFile(settingsPath, settingsJson, 'utf-8');
            this.log(`Added ${stubPath} to intelephense.stubs setting`);
        } else {
            this.log('Stub path already in intelephense.stubs setting');
        }
    }

    /**
     * Adds the stub directory to .gitignore
     */
    private async updateGitignore(workspacePath: string): Promise<void> {
        const gitignorePath = path.join(workspacePath, '.gitignore');
        const stubPattern = this.WORKSPACE_STUBS_DIR + '/';

        try {
            let content = '';
            let needsUpdate = true;

            // Read existing .gitignore if it exists
            try {
                content = await fsPromises.readFile(gitignorePath, 'utf-8');
                if (content.includes(stubPattern)) {
                    this.log('.gitignore already contains stub pattern');
                    needsUpdate = false;
                }
            } catch (error) {
                if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                    // File doesn't exist, will be created
                    this.log('.gitignore does not exist, will create');
                } else {
                    throw error;
                }
            }

            if (needsUpdate) {
                // Ensure file ends with newline before appending
                if (content && !content.endsWith('\n')) {
                    content += '\n';
                }
                content += `${stubPattern}\n`;

                await fsPromises.writeFile(gitignorePath, content, 'utf-8');
                this.log('Added stub pattern to .gitignore');
            }
        } catch (error) {
            // Non-critical error, just log it
            this.logError('Failed to update .gitignore (non-critical)', error);
        }
    }

    /**
     * Removes the stub directory pattern from .gitignore
     */
    private async removeFromGitignore(workspacePath: string): Promise<void> {
        const gitignorePath = path.join(workspacePath, '.gitignore');
        const stubPattern = this.WORKSPACE_STUBS_DIR + '/';

        try {
            const content = await fsPromises.readFile(gitignorePath, 'utf-8');
            const lines = content.split('\n');

            // Remove the stub pattern line
            const filteredLines = lines.filter(line => line.trim() !== stubPattern.trim());

            // Only write if something changed
            if (filteredLines.length !== lines.length) {
                const newContent = filteredLines.join('\n');
                await fsPromises.writeFile(gitignorePath, newContent, 'utf-8');
                this.log('Removed stub pattern from .gitignore');
            }
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                // File doesn't exist, nothing to remove
                return;
            }
            // Non-critical error, just log it
            this.logError('Failed to update .gitignore during cleanup (non-critical)', error);
        }
    }

    /**
     * Removes stub files and cleans up Intelephense configuration
     */
    public async cleanupStubs(): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            throw new Error('No workspace folder found');
        }

        const workspacePath = workspaceFolder.uri.fsPath;
        const targetDir = path.join(workspacePath, this.WORKSPACE_STUBS_DIR);

        this.log('Cleaning up API stubs');

        // Remove stub directory
        if (fs.existsSync(targetDir)) {
            fs.rmSync(targetDir, { recursive: true, force: true });
            this.log('Removed stub directory');
        }

        // Remove from Intelephense settings
        await this.removeFromIntelephenseSettings(workspacePath);

        // Remove from .gitignore
        await this.removeFromGitignore(workspacePath);

        this.stubsInstalled = false;
        this.log('Stub cleanup completed');
    }

    /**
     * Removes the stub path from Intelephense settings
     */
    private async removeFromIntelephenseSettings(workspacePath: string): Promise<void> {
        const settingsPath = path.join(workspacePath, '.vscode', 'settings.json');
        const stubPath = this.WORKSPACE_STUBS_DIR;

        try {
            const content = await fsPromises.readFile(settingsPath, 'utf-8');
            const settings = JSON.parse(content);

            if (settings['intelephense.stubs'] && Array.isArray(settings['intelephense.stubs'])) {
                settings['intelephense.stubs'] = settings['intelephense.stubs'].filter(
                    (s: string) => s !== stubPath
                );

                const settingsJson = JSON.stringify(settings, null, 2);
                await fsPromises.writeFile(settingsPath, settingsJson, 'utf-8');
                this.log('Removed stub path from intelephense.stubs setting');
            }
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                // File doesn't exist, nothing to remove
                return;
            }
            this.logError('Failed to update settings.json during cleanup', error);
        }
    }

    /**
     * Reinstalls stub files by removing and re-copying them
     */
    public async reinstallStubs(): Promise<void> {
        await this.cleanupStubs();

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            throw new Error('No workspace folder found');
        }

        await this.initializeStubs(workspaceFolder.uri.fsPath);
        await this.configureIntelephense(workspaceFolder.uri.fsPath);
        await this.updateGitignore(workspaceFolder.uri.fsPath);

        this.stubsInstalled = true;
        this.log('Stubs reinstalled successfully');
    }

    /**
     * Returns whether stubs are currently installed
     */
    public areStubsInstalled(): boolean {
        return this.stubsInstalled;
    }

    /**
     * Logs a message to the output channel
     */
    private log(message: string): void {
        this.outputChannel.appendLine(`[IntelliSense] ${message}`);
    }

    /**
     * Logs an error to the output channel
     */
    private logError(message: string, error: unknown): void {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.outputChannel.appendLine(`[IntelliSense ERROR] ${message}: ${errorMessage}`);
        if (error instanceof Error && error.stack) {
            this.outputChannel.appendLine(error.stack);
        }
    }
}
