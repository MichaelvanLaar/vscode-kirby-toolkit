# Implementation Tasks: Kirby Panel Integration

## 1. Panel URL Detection Infrastructure
- [ ] 1.1 Create `src/utils/panelDetector.ts` module for URL detection logic
- [ ] 1.2 Implement `isServerRunning(url: string): Promise<boolean>` function using fetch with timeout
- [ ] 1.3 Implement `detectPanelUrl(): Promise<string | null>` with multi-strategy detection
- [ ] 1.4 Add logic to check `kirby.panelUrl` configuration setting first
- [ ] 1.5 Add logic to probe common localhost ports (8000, 3000, 8080, 8888)
- [ ] 1.6 Add logic to parse `package.json` scripts for dev server port hints
- [ ] 1.7 Implement `promptForPanelUrl()` function to request manual URL entry
- [ ] 1.8 Write unit tests for URL detection strategies

## 2. WebView Panel Implementation
- [ ] 2.1 Create `src/panels/kirbyPanelWebView.ts` module
- [ ] 2.2 Implement `KirbyPanelWebView` class with singleton pattern (reuse existing panel)
- [ ] 2.3 Implement `createOrShow(panelUrl: string)` method to create or reveal WebView
- [ ] 2.4 Generate WebView HTML with iframe embedding Panel URL
- [ ] 2.5 Configure WebView options: `enableScripts: true`, `retainContextWhenHidden: true`
- [ ] 2.6 Set WebView title to "Kirby Panel"
- [ ] 2.7 Set WebView icon (use Kirby-themed icon if available)
- [ ] 2.8 Implement disposal logic to clean up WebView resources

## 3. WebView Error Handling
- [ ] 3.1 Add error boundary for iframe loading failures
- [ ] 3.2 Display user-friendly error message if Panel URL is unreachable
- [ ] 3.3 Handle X-Frame-Options blocking with troubleshooting instructions
- [ ] 3.4 Implement retry mechanism with "Reload Panel" functionality
- [ ] 3.5 Log WebView errors to output channel for debugging

## 4. Panel Access Commands
- [ ] 4.1 Create `src/commands/openPanel.ts` module
- [ ] 4.2 Implement `openPanelInWebView()` command handler
- [ ] 4.3 Add server detection check before opening WebView
- [ ] 4.4 Display warning message if server not running with action buttons
- [ ] 4.5 Implement `openPanelInBrowser()` command handler using `vscode.env.openExternal()`
- [ ] 4.6 Implement `reloadPanel()` command to refresh WebView content
- [ ] 4.7 Implement `configurePanelUrl()` command to prompt for manual URL entry and save to settings

## 5. Status Bar Integration
- [ ] 5.1 Create status bar item in `src/extension.ts`
- [ ] 5.2 Set status bar text to "🎛️ Kirby Panel" with tooltip "Open Kirby Panel"
- [ ] 5.3 Configure status bar click behavior to execute `openPanelInWebView` command
- [ ] 5.4 Implement logic to show status bar item only in Kirby workspaces
- [ ] 5.5 Add status bar visibility toggle based on `kirby.enablePanelIntegration` setting
- [ ] 5.6 Update status bar text to indicate server status (e.g., "⚠️ Panel offline" if unreachable)

## 6. Configuration Settings
- [ ] 6.1 Add `kirby.enablePanelIntegration` boolean setting to package.json (default: true)
- [ ] 6.2 Add `kirby.panelUrl` string setting to package.json (default: "")
- [ ] 6.3 Add `kirby.panelAutoDetect` boolean setting to package.json (default: true)
- [ ] 6.4 Add `kirby.panelOpenInWebView` boolean setting to package.json (default: true; if false, always use browser)
- [ ] 6.5 Add configuration descriptions with examples in package.json
- [ ] 6.6 Implement configuration validation for URL format

## 7. Command Registration
- [ ] 7.1 Add `kirby.openPanelWebView` command to package.json
- [ ] 7.2 Add `kirby.openPanelBrowser` command to package.json
- [ ] 7.3 Add `kirby.reloadPanel` command to package.json
- [ ] 7.4 Add `kirby.configurePanelUrl` command to package.json
- [ ] 7.5 Register all commands in `src/extension.ts` activate() function
- [ ] 7.6 Add commands to command palette with appropriate titles

## 8. Server Detection Enhancements
- [ ] 8.1 Implement detection for common Kirby server setups (PHP built-in, Valet, Docker)
- [ ] 8.2 Add logic to extract port from `php -S localhost:8000` command pattern
- [ ] 8.3 Add logic to detect Valet `.test` domain (e.g., `my-project.test/panel`)
- [ ] 8.4 Handle HTTPS URLs with self-signed certificates (allow in fetch options)
- [ ] 8.5 Cache detected URL in memory to avoid repeated probing (5-minute TTL)

## 9. User Experience Enhancements
- [ ] 9.1 Display informational message on first Panel WebView open explaining features
- [ ] 9.2 Add "How to start server" documentation link in error messages
- [ ] 9.3 Implement "Open Panel" quick pick menu with options: WebView, Browser, Configure URL
- [ ] 9.4 Add loading indicator while detecting Panel URL
- [ ] 9.5 Display success notification when Panel WebView opens successfully (optional, configurable)

## 10. Testing
- [ ] 10.1 Create `src/test/panelDetector.test.ts` test suite
- [ ] 10.2 Write test for localhost port probing logic
- [ ] 10.3 Write test for `isServerRunning()` with mock fetch responses
- [ ] 10.4 Write test for package.json parsing to extract port
- [ ] 10.5 Create `src/test/panelWebView.test.ts` test suite
- [ ] 10.6 Write test for WebView creation and singleton behavior
- [ ] 10.7 Write test for WebView disposal and cleanup
- [ ] 10.8 Write test for command handlers (openPanelInWebView, openPanelInBrowser)
- [ ] 10.9 Write test for status bar item visibility logic
- [ ] 10.10 Write integration test verifying WebView displays iframe content

## 11. Documentation
- [ ] 11.1 Update main README.md with Panel Integration feature description
- [ ] 11.2 Add animated GIF/screenshot showing WebView Panel in VS Code
- [ ] 11.3 Document configuration settings with examples (localhost, remote, custom ports)
- [ ] 11.4 Add troubleshooting section for common issues (X-Frame-Options, CORS, authentication)
- [ ] 11.5 Document how to start Kirby development servers (PHP built-in, Valet, Docker)
- [ ] 11.6 Add FAQ section addressing session persistence and authentication
- [ ] 11.7 Update CHANGELOG.md with new version release notes

## 12. Validation and Release
- [ ] 12.1 Run full test suite (`npm test`) and ensure all tests pass
- [ ] 12.2 Manually test in real Kirby project: start server, open WebView, verify Panel loads
- [ ] 12.3 Test Panel authentication in WebView (login flow)
- [ ] 12.4 Test server auto-detection with different port configurations
- [ ] 12.5 Test "Open Panel in Browser" command and verify URL opens externally
- [ ] 12.6 Test status bar item click behavior and visibility logic
- [ ] 12.7 Test with server not running and verify error messages
- [ ] 12.8 Validate OpenSpec change with `openspec validate add-kirby-panel-integration --strict`
- [ ] 12.9 Create pull request and request code review
- [ ] 12.10 After merge, archive OpenSpec change with `openspec archive add-kirby-panel-integration`
