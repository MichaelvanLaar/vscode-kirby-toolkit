import * as vscode from 'vscode';
import { KirbyPanelWebView } from '../panels/kirbyPanelWebView';
import { detectPanelUrl, isServerRunning, promptForPanelUrl } from '../utils/panelDetector';

/**
 * Opens the Kirby Panel in a WebView within VS Code
 */
export async function openPanelInWebView(extensionUri: vscode.Uri): Promise<void> {
    try {
        // Detect Panel URL
        const panelUrl = await detectPanelUrl();

        if (!panelUrl) {
            // No URL detected, show warning with actions
            const action = await vscode.window.showWarningMessage(
                'Kirby development server is not running. Start your server and try again.',
                'How to start server',
                'Configure Panel URL'
            );

            if (action === 'How to start server') {
                // Open documentation
                vscode.env.openExternal(vscode.Uri.parse(
                    'https://getkirby.com/docs/guide/quickstart#running-kirby'
                ));
            } else if (action === 'Configure Panel URL') {
                // Prompt for manual URL entry
                const url = await promptForPanelUrl();
                if (url && await isServerRunning(url)) {
                    KirbyPanelWebView.createOrShow(extensionUri, url);
                }
            }
            return;
        }

        // Verify server is reachable
        if (!await isServerRunning(panelUrl)) {
            const action = await vscode.window.showWarningMessage(
                `Panel URL "${panelUrl}" is not reachable. Make sure your server is running.`,
                'How to start server',
                'Configure Panel URL'
            );

            if (action === 'How to start server') {
                vscode.env.openExternal(vscode.Uri.parse(
                    'https://getkirby.com/docs/guide/quickstart#running-kirby'
                ));
            } else if (action === 'Configure Panel URL') {
                const url = await promptForPanelUrl();
                if (url && await isServerRunning(url)) {
                    KirbyPanelWebView.createOrShow(extensionUri, url);
                }
            }
            return;
        }

        // Create or show the WebView with detected URL
        KirbyPanelWebView.createOrShow(extensionUri, panelUrl);

    } catch (error) {
        vscode.window.showErrorMessage(
            `Failed to open Kirby Panel: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

/**
 * Opens the Kirby Panel in the user's default web browser
 */
export async function openPanelInBrowser(): Promise<void> {
    try {
        // Detect Panel URL
        const panelUrl = await detectPanelUrl();

        if (!panelUrl) {
            // No URL detected, show warning with actions
            const action = await vscode.window.showWarningMessage(
                'Kirby development server is not running. Start your server and try again.',
                'How to start server',
                'Configure Panel URL'
            );

            if (action === 'How to start server') {
                vscode.env.openExternal(vscode.Uri.parse(
                    'https://getkirby.com/docs/guide/quickstart#running-kirby'
                ));
            } else if (action === 'Configure Panel URL') {
                const url = await promptForPanelUrl();
                if (url) {
                    // Open in browser regardless of reachability check
                    // Browser will show its own error if unreachable
                    vscode.env.openExternal(vscode.Uri.parse(url));
                }
            }
            return;
        }

        // Open Panel URL in external browser
        await vscode.env.openExternal(vscode.Uri.parse(panelUrl));

    } catch (error) {
        vscode.window.showErrorMessage(
            `Failed to open Kirby Panel in browser: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

/**
 * Reloads the Panel WebView content
 */
export async function reloadPanel(): Promise<void> {
    if (!KirbyPanelWebView.exists()) {
        vscode.window.showInformationMessage('No Panel WebView is open');
        return;
    }

    KirbyPanelWebView.reload();
    vscode.window.showInformationMessage('Panel WebView reloaded');
}

/**
 * Prompts user to configure Panel URL and saves to settings
 */
export async function configurePanelUrl(): Promise<void> {
    const url = await promptForPanelUrl();

    if (url) {
        vscode.window.showInformationMessage(`Panel URL configured: ${url}`);
    }
}

/**
 * Shows a quick pick menu with Panel access options
 */
export async function showPanelQuickPick(extensionUri: vscode.Uri): Promise<void> {
    const options = [
        {
            label: '$(browser) Open in WebView',
            description: 'Open Panel in VS Code WebView',
            action: 'webview'
        },
        {
            label: '$(link-external) Open in Browser',
            description: 'Open Panel in default web browser',
            action: 'browser'
        },
        {
            label: '$(settings-gear) Configure Panel URL',
            description: 'Set or change Panel URL',
            action: 'configure'
        },
        {
            label: '$(refresh) Reload Panel',
            description: 'Refresh the Panel WebView',
            action: 'reload'
        }
    ];

    const selected = await vscode.window.showQuickPick(options, {
        placeHolder: 'Choose how to access the Kirby Panel'
    });

    if (!selected) {
        return;
    }

    switch (selected.action) {
        case 'webview':
            await openPanelInWebView(extensionUri);
            break;
        case 'browser':
            await openPanelInBrowser();
            break;
        case 'configure':
            await configurePanelUrl();
            break;
        case 'reload':
            await reloadPanel();
            break;
    }
}
