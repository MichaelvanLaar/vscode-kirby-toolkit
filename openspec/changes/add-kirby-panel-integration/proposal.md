# Add Kirby Panel Integration

## Why

Developers working with Kirby CMS frequently need to switch between their code editor (VS Code) and web browser to access the Kirby Panel for content management tasks like creating pages, editing fields, or previewing content. This context switching interrupts workflow, especially during rapid development cycles where code changes and content updates happen in parallel. Additionally, there's no quick way to launch a local Kirby development server or open the Panel from within VS Code, requiring manual URL typing or bookmark management.

## What Changes

This change introduces **Kirby Panel Integration** by embedding a WebView-based Panel preview directly within VS Code and providing commands to manage Panel access. The implementation will:

- Add a WebView panel that displays the Kirby Panel interface within VS Code's editor area
- Provide commands to open the Panel in the WebView or external browser
- Implement session management to handle Kirby Panel authentication cookies
- Support both local development servers (localhost) and remote Kirby installations (via configuration)
- Add a status bar item for quick Panel access
- Detect if a local development server is running and offer to start one if not

This feature reduces context switching, accelerates content management workflows, and provides a unified development environment for Kirby projects.

## Impact

- **Affected specs**: New capability `panel-webview`
- **Affected code**:
  - New module: `src/panels/kirbyPanelWebView.ts` - WebView panel implementation
  - New module: `src/utils/panelDetector.ts` - Detect Panel URL and server status
  - New module: `src/commands/openPanel.ts` - Command handlers for Panel access
  - Modified: `src/extension.ts` - Register commands and status bar item
  - Modified: `package.json` - Add new commands and configuration settings
- **Configuration**: New settings for Panel URL, authentication preferences, and WebView behavior
- **Dependencies**: None (uses built-in VS Code WebView API)
- **Breaking changes**: None
- **Testing**: New test suite for Panel URL detection, WebView lifecycle, and command handlers
