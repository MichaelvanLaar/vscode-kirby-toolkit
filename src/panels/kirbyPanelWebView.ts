import * as vscode from 'vscode';

/**
 * Manages the Kirby Panel WebView instance
 * Implements singleton pattern to ensure only one Panel WebView exists at a time
 */
export class KirbyPanelWebView {
    private static currentPanel: KirbyPanelWebView | undefined;
    private readonly panel: vscode.WebviewPanel;
    private disposables: vscode.Disposable[] = [];
    private panelUrl: string;

    /**
     * Creates or reveals the Kirby Panel WebView
     * @param extensionUri Extension's URI for resource loading
     * @param panelUrl The Kirby Panel URL to display
     * @returns KirbyPanelWebView instance
     */
    public static createOrShow(extensionUri: vscode.Uri, panelUrl: string): KirbyPanelWebView {
        const column = vscode.ViewColumn.Two;

        // If we already have a panel, show it and update URL if needed
        if (KirbyPanelWebView.currentPanel) {
            KirbyPanelWebView.currentPanel.panel.reveal(column);
            KirbyPanelWebView.currentPanel.updateUrl(panelUrl);
            return KirbyPanelWebView.currentPanel;
        }

        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(
            'kirbyPanel',
            'Kirby Panel',
            column,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: []
            }
        );

        KirbyPanelWebView.currentPanel = new KirbyPanelWebView(panel, extensionUri, panelUrl);
        return KirbyPanelWebView.currentPanel;
    }

    /**
     * Reloads the current Panel WebView if it exists
     */
    public static reload(): void {
        if (KirbyPanelWebView.currentPanel) {
            KirbyPanelWebView.currentPanel.updateHtml();
        }
    }

    /**
     * Checks if a Panel WebView currently exists
     */
    public static exists(): boolean {
        return KirbyPanelWebView.currentPanel !== undefined;
    }

    /**
     * Disposes the current Panel WebView if it exists
     */
    public static dispose(): void {
        if (KirbyPanelWebView.currentPanel) {
            KirbyPanelWebView.currentPanel.panel.dispose();
            KirbyPanelWebView.currentPanel = undefined;
        }
    }

    private constructor(
        panel: vscode.WebviewPanel,
        private readonly extensionUri: vscode.Uri,
        panelUrl: string
    ) {
        this.panel = panel;
        this.panelUrl = panelUrl;

        // Set the webview's initial html content
        this.updateHtml();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

        // Handle messages from the webview (if needed for error reporting)
        this.panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'error':
                        vscode.window.showErrorMessage(message.text);
                        break;
                    case 'info':
                        console.log('Panel WebView:', message.text);
                        break;
                }
            },
            null,
            this.disposables
        );
    }

    /**
     * Updates the Panel URL and refreshes the WebView
     */
    private updateUrl(newUrl: string): void {
        if (this.panelUrl !== newUrl) {
            this.panelUrl = newUrl;
            this.updateHtml();
        }
    }

    /**
     * Updates the WebView's HTML content
     */
    private updateHtml(): void {
        this.panel.webview.html = this.getHtmlForWebview();
    }

    /**
     * Generates the HTML content for the WebView
     */
    private getHtmlForWebview(): string {
        // Escape the URL to prevent XSS
        const escapedUrl = this.panelUrl
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; frame-src http: https:; script-src 'unsafe-inline';">
    <title>Kirby Panel</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100vh;
            overflow: hidden;
        }
        iframe {
            width: 100%;
            height: 100%;
            border: none;
            display: block;
        }
        .error-container {
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }
        .error-message {
            background-color: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 10px;
        }
        .loading {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="loading" id="loading">Loading Kirby Panel...</div>
    <iframe
        id="panel-frame"
        src="${escapedUrl}"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals"
        allow="clipboard-read; clipboard-write"
        style="display: none;">
    </iframe>

    <script>
        (function() {
            const vscode = acquireVsCodeApi();
            const iframe = document.getElementById('panel-frame');
            const loading = document.getElementById('loading');

            // Show iframe when loaded
            iframe.addEventListener('load', function() {
                loading.style.display = 'none';
                iframe.style.display = 'block';
                vscode.postMessage({
                    command: 'info',
                    text: 'Panel loaded successfully'
                });
            });

            // Handle loading errors
            iframe.addEventListener('error', function(e) {
                loading.style.display = 'none';
                document.body.innerHTML = \`
                    <div class="error-container">
                        <div class="error-message">
                            <strong>Failed to load Kirby Panel</strong><br>
                            The Panel could not be loaded. This might be because:<br>
                            <ul>
                                <li>The server is not running</li>
                                <li>The URL is incorrect</li>
                                <li>The server blocks iframe embedding (X-Frame-Options)</li>
                            </ul>
                            Try opening the Panel in your browser instead.
                        </div>
                    </div>
                \`;
                vscode.postMessage({
                    command: 'error',
                    text: 'Failed to load Panel in WebView'
                });
            });

            // Timeout fallback - show iframe after 3 seconds even if load event didn't fire
            setTimeout(function() {
                if (loading.style.display !== 'none') {
                    loading.style.display = 'none';
                    iframe.style.display = 'block';
                }
            }, 3000);
        })();
    </script>
</body>
</html>`;
    }

    /**
     * Disposes the WebView and cleans up resources
     */
    private dispose(): void {
        KirbyPanelWebView.currentPanel = undefined;

        // Clean up our resources
        this.panel.dispose();

        while (this.disposables.length) {
            const disposable = this.disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}
