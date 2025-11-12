import * as vscode from 'vscode';
import * as fs from 'fs';
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
            return;
        }

        this.log(`Copying stubs to ${targetDir}`);

        // Get source directory (from extension's bundled stubs)
        const config = vscode.workspace.getConfiguration('kirby');
        const customStubsPath = config.get<string>('customStubsPath', '');

        let sourceDir: string;
        if (customStubsPath && fs.existsSync(customStubsPath)) {
            sourceDir = customStubsPath;
            this.log(`Using custom stubs from ${customStubsPath}`);
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
     * Recursively copies a directory
     */
    private async copyDirectory(source: string, target: string): Promise<void> {
        // Create target directory
        if (!fs.existsSync(target)) {
            fs.mkdirSync(target, { recursive: true });
        }

        // Read directory contents
        const entries = fs.readdirSync(source, { withFileTypes: true });

        for (const entry of entries) {
            const sourcePath = path.join(source, entry.name);
            const targetPath = path.join(target, entry.name);

            if (entry.isDirectory()) {
                await this.copyDirectory(sourcePath, targetPath);
            } else {
                fs.copyFileSync(sourcePath, targetPath);
            }
        }
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
        if (!fs.existsSync(vscodeDir)) {
            fs.mkdirSync(vscodeDir, { recursive: true });
        }

        // Read existing settings or create new
        let settings: any = {};
        if (fs.existsSync(settingsPath)) {
            try {
                const content = fs.readFileSync(settingsPath, 'utf-8');
                settings = JSON.parse(content);
            } catch (error) {
                this.logError('Failed to parse existing settings.json, creating new', error);
            }
        }

        // Update intelephense.stubs setting
        const currentStubs = settings['intelephense.stubs'] || [];
        if (!Array.isArray(currentStubs)) {
            this.logError('intelephense.stubs is not an array, resetting', new Error('Invalid type'));
            settings['intelephense.stubs'] = [];
        }

        // Add stub path if not already present
        if (!currentStubs.includes(stubPath)) {
            currentStubs.push(stubPath);
            settings['intelephense.stubs'] = currentStubs;

            // Write updated settings
            const settingsJson = JSON.stringify(settings, null, 2);
            fs.writeFileSync(settingsPath, settingsJson, 'utf-8');
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
            if (fs.existsSync(gitignorePath)) {
                content = fs.readFileSync(gitignorePath, 'utf-8');
                if (content.includes(stubPattern)) {
                    this.log('.gitignore already contains stub pattern');
                    needsUpdate = false;
                }
            }

            if (needsUpdate) {
                // Ensure file ends with newline before appending
                if (content && !content.endsWith('\n')) {
                    content += '\n';
                }
                content += `${stubPattern}\n`;

                fs.writeFileSync(gitignorePath, content, 'utf-8');
                this.log('Added stub pattern to .gitignore');
            }
        } catch (error) {
            // Non-critical error, just log it
            this.logError('Failed to update .gitignore (non-critical)', error);
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

        this.stubsInstalled = false;
        this.log('Stub cleanup completed');
    }

    /**
     * Removes the stub path from Intelephense settings
     */
    private async removeFromIntelephenseSettings(workspacePath: string): Promise<void> {
        const settingsPath = path.join(workspacePath, '.vscode', 'settings.json');
        const stubPath = this.WORKSPACE_STUBS_DIR;

        if (!fs.existsSync(settingsPath)) {
            return;
        }

        try {
            const content = fs.readFileSync(settingsPath, 'utf-8');
            const settings = JSON.parse(content);

            if (settings['intelephense.stubs'] && Array.isArray(settings['intelephense.stubs'])) {
                settings['intelephense.stubs'] = settings['intelephense.stubs'].filter(
                    (s: string) => s !== stubPath
                );

                const settingsJson = JSON.stringify(settings, null, 2);
                fs.writeFileSync(settingsPath, settingsJson, 'utf-8');
                this.log('Removed stub path from intelephense.stubs setting');
            }
        } catch (error) {
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
