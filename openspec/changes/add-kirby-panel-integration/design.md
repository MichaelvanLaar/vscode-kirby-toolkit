# Design: Kirby Panel Integration

## Context

Kirby CMS provides a web-based administration interface (the "Panel") for content management, typically accessed at `http://localhost:8000/panel` during development. Developers frequently need to:
- Preview content changes after updating templates/blueprints
- Create test content while building features
- Verify field configurations in Blueprints
- Check page routing and URL structures

This requires constant context switching between VS Code and a web browser, disrupting flow and slowing down development.

**Key constraints:**
- Cannot modify Kirby Panel source code (must work with standard Panel)
- Must handle authentication (Panel requires login)
- WebView has limitations (no direct cookie access, separate JavaScript context)
- Local development servers may not be running when extension activates
- Panel URLs vary by project (localhost vs. remote servers vs. custom ports)

**Stakeholders:**
- Extension users: Want seamless Panel access without leaving VS Code
- Extension maintainers: Need a solution that works reliably across different Kirby installations

## Goals / Non-Goals

**Goals:**
- Embed Kirby Panel in a VS Code WebView for in-editor access
- Provide command to open Panel in default web browser (for users who prefer external access)
- Auto-detect local development server URLs (localhost:8000, localhost:3000, etc.)
- Support manual Panel URL configuration for remote/custom setups
- Handle Panel authentication within the WebView (session cookies)
- Add status bar item for quick Panel access
- Detect if local server is running and provide helpful error messages

**Non-Goals:**
- Modifying Kirby Panel UI or adding custom features to the Panel itself
- Implementing a custom content management interface (use Kirby's existing Panel)
- Starting/stopping Kirby PHP servers automatically (too complex, varies by setup)
- Deep integration with Panel APIs for programmatic content manipulation (future enhancement)
- Supporting Kirby 3.x Panel (focus on Kirby 4.x)

## Decisions

### Decision 1: WebView Implementation Approach

**What:** Use VS Code's WebView API to embed the Kirby Panel as an iframe-like component within the editor.

**Why:**
- Native VS Code feature designed for embedded web content
- Supports HTML/CSS/JavaScript rendering
- Handles navigation and page reloads
- Provides security sandboxing
- Works cross-platform (Windows, macOS, Linux)

**Implementation details:**
```typescript
const panel = vscode.window.createWebviewPanel(
  'kirbyPanel',           // Internal ID
  'Kirby Panel',          // Display title
  vscode.ViewColumn.Two,  // Show in second editor column
  {
    enableScripts: true,  // Required for Panel JavaScript
    retainContextWhenHidden: true, // Keep state when switching tabs
  }
);

panel.webview.html = `
  <!DOCTYPE html>
  <html>
    <body style="margin:0;padding:0;overflow:hidden;">
      <iframe src="${panelUrl}"
              style="width:100%;height:100vh;border:none;"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups">
      </iframe>
    </body>
  </html>
`;
```

**Alternatives considered:**
1. **Custom TreeView with Panel-like UI** - Build a custom VS Code TreeView mimicking Panel structure
   - *Rejected*: Massive duplication of effort, wouldn't match actual Panel features, high maintenance
2. **External browser automation** - Use puppeteer/playwright to control external browser programmatically
   - *Rejected*: Heavy dependency, complex setup, defeats "in-editor" goal
3. **Electron BrowserView** - Use Electron's native BrowserView API
   - *Rejected*: Not exposed to VS Code extensions, would require VS Code fork

### Decision 2: Panel URL Detection Strategy

**What:** Implement multi-strategy Panel URL detection:
1. Check workspace configuration (`kirby.panelUrl` setting)
2. Auto-detect local server by probing common ports (8000, 3000, 8080)
3. Parse `package.json` scripts for dev server commands (e.g., `"dev": "php -S localhost:8000"`)
4. Prompt user to enter URL manually if detection fails

**Why:**
- Different projects use different setups (PHP built-in server, Node proxy, Laravel Valet, Docker, etc.)
- Configuration setting allows override for edge cases
- Auto-detection provides zero-config experience for common setups
- Manual entry is last resort for complex configurations

**Detection order:**
```typescript
async function detectPanelUrl(): Promise<string> {
  // 1. Check explicit configuration
  const configUrl = vscode.workspace.getConfiguration('kirby').get<string>('panelUrl');
  if (configUrl && await isServerRunning(configUrl)) {
    return configUrl;
  }

  // 2. Probe common localhost ports
  const commonPorts = [8000, 3000, 8080, 8888];
  for (const port of commonPorts) {
    const url = `http://localhost:${port}/panel`;
    if (await isServerRunning(url)) {
      return url;
    }
  }

  // 3. Parse package.json for server hints
  const packageJson = await readPackageJson();
  const devScript = packageJson?.scripts?.dev;
  const port = extractPortFromCommand(devScript);
  if (port) {
    const url = `http://localhost:${port}/panel`;
    if (await isServerRunning(url)) {
      return url;
    }
  }

  // 4. Prompt user
  return await promptForPanelUrl();
}
```

**Alternatives considered:**
1. **Only use configuration setting** - Require manual URL entry
   - *Rejected*: Poor user experience, violates zero-config principle
2. **Parse Kirby config files** - Read PHP config to extract URL
   - *Rejected*: Requires PHP execution or complex parsing, brittle
3. **Scan all ports** - Brute-force scan 1000-65535
   - *Rejected*: Slow, invasive, may trigger firewalls

### Decision 3: Authentication and Session Management

**What:** Rely on WebView's cookie handling to manage Panel authentication sessions automatically.

**Why:**
- WebView maintains cookies across page navigations within the same session
- User logs in via Panel's standard login form (no custom auth needed)
- Session persists until WebView is closed or extension reloads
- No need to implement custom cookie storage or token management

**User flow:**
1. User opens Panel WebView
2. If not authenticated, Panel displays standard login form
3. User enters credentials (same as browser-based login)
4. WebView stores session cookie automatically
5. Subsequent Panel navigation reuses session

**Limitations:**
- Session cookies are not shared between WebView and external browser (separate contexts)
- Session does not persist across VS Code restarts (WebView state is ephemeral)
- No automatic re-authentication if session expires

**Alternatives considered:**
1. **Store credentials in VS Code secrets API** - Save username/password and auto-login
   - *Rejected*: Security risk, requires credential management, violates Kirby's auth model
2. **OAuth integration** - Implement OAuth flow for Panel access
   - *Rejected*: Kirby doesn't provide OAuth by default, overly complex
3. **Share cookies with system browser** - Sync cookies between WebView and Chrome/Firefox
   - *Rejected*: Not supported by VS Code WebView API, platform-specific hacks required

### Decision 4: Status Bar Integration

**What:** Add a status bar item (bottom-right of VS Code window) for quick Panel access:

```
[🎛️ Kirby Panel]  ← Clickable, opens Panel WebView
```

**Why:**
- Always visible and accessible (status bar is persistent)
- Single-click access to Panel (faster than Command Palette)
- Non-intrusive (status bar items are small and optional)
- Consistent with VS Code UI patterns (e.g., language selector, Git branch)

**Behavior:**
- Left-click: Opens Panel in WebView (default action)
- Right-click context menu:
  - "Open Panel in WebView"
  - "Open Panel in Browser"
  - "Reload Panel"
  - "Configure Panel URL"

**Visibility:**
- Only show status bar item in Kirby workspaces (detect `site/` directory)
- Hide if `kirby.enablePanelIntegration` is false

**Alternatives considered:**
1. **Activity Bar icon** - Add custom icon to left sidebar
   - *Rejected*: Too prominent for secondary feature, clutters UI
2. **Command Palette only** - No persistent UI element
   - *Rejected*: Requires remembering command name, slower access
3. **CodeLens in templates** - Show "Open Panel" link in template files
   - *Rejected*: Only visible when editing templates, not always accessible

### Decision 5: Development Server Detection

**What:** Before opening Panel WebView, check if a local development server is running. If not, display a helpful error message with instructions.

**Why:**
- Opening WebView to a non-running server shows a cryptic browser error
- Users may forget to start their development server before opening Panel
- Provides educational feedback for new Kirby developers

**Implementation:**
```typescript
async function openPanelWebView() {
  const panelUrl = await detectPanelUrl();

  if (!panelUrl || !await isServerRunning(panelUrl)) {
    const action = await vscode.window.showWarningMessage(
      'Kirby development server is not running. Start your server and try again.',
      'How to start server',
      'Configure Panel URL'
    );

    if (action === 'How to start server') {
      // Open documentation link
    } else if (action === 'Configure Panel URL') {
      // Prompt for manual URL entry
    }
    return;
  }

  // Proceed with WebView creation
}
```

**Server detection logic:**
```typescript
async function isServerRunning(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000); // 2s timeout

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return response.ok || response.status === 401; // 401 = Panel requires auth (server is running)
  } catch (error) {
    return false; // ECONNREFUSED, timeout, etc.
  }
}
```

## Risks / Trade-offs

### Risk 1: Panel Layout Issues in WebView
**Risk:** Kirby Panel may not render correctly in WebView due to CSS viewport units, responsive design, or JavaScript assumptions about window object.

**Mitigation:**
- Test Panel rendering in WebView during development with various screen sizes
- Document known layout issues in README
- Provide "Open in Browser" fallback command for users experiencing issues
- Consider adding CSS injection to fix common layout problems (if necessary)

### Risk 2: Authentication Session Persistence
**Risk:** Users must re-authenticate every time they restart VS Code, which can be annoying during development.

**Mitigation:**
- Document this limitation clearly in README
- Consider Phase 2 enhancement: Store session cookies in VS Code's SecretStorage and restore on reload
- For now, accept limitation as trade-off for security and simplicity

### Risk 3: Performance Overhead
**Risk:** Rendering Panel in WebView may consume significant memory/CPU, especially with multiple WebView instances.

**Mitigation:**
- Limit to one active Panel WebView instance at a time (reuse existing panel)
- Use `retainContextWhenHidden: false` if memory usage is problematic (testing required)
- Provide setting to disable WebView and use browser-only mode

### Risk 4: CORS and Same-Origin Policy
**Risk:** Panel may block iframe embedding due to `X-Frame-Options` or Content Security Policy headers.

**Mitigation:**
- Test with standard Kirby installation (Kirby does not set `X-Frame-Options` by default)
- Document workaround: Users can modify Kirby config to allow iframe embedding if needed
- Provide clear error message if iframe loading fails with instructions to check server headers

### Risk 5: Complex Server Setups
**Risk:** Auto-detection may fail with Docker, reverse proxies, HTTPS with self-signed certs, or custom domains.

**Mitigation:**
- Provide `kirby.panelUrl` configuration for manual override
- Document common setups (Docker, Valet, etc.) in README with example configurations
- Display helpful error messages when detection fails with troubleshooting steps

## Migration Plan

**Phase 1: Initial Implementation (v0.4.0 or v0.5.0)**
1. Implement WebView panel with iframe-based Panel embedding
2. Add Panel URL auto-detection for localhost servers
3. Implement status bar item with click-to-open functionality
4. Add commands: "Open Panel in WebView", "Open Panel in Browser"
5. Implement server detection with helpful error messages
6. Write comprehensive tests for URL detection and WebView lifecycle

**Phase 2: Enhanced Features (v0.6.0)**
1. Add session persistence using VS Code SecretStorage
2. Implement "Reload Panel" command for refreshing WebView
3. Add context menu to status bar item (right-click options)
4. Support HTTPS URLs with self-signed certificate handling
5. Add telemetry to understand usage patterns

**Phase 3: Advanced Integration (v0.7.0)**
1. Add "Open Current Page in Panel" command (detect page from template file)
2. Implement bidirectional sync: refresh code editor when content changes in Panel (via websocket)
3. Support multiple Panel instances for multi-root workspaces
4. Add Panel navigation history (back/forward buttons in WebView toolbar)

**Rollback Plan:**
- If WebView rendering causes critical issues, provide hotfix that disables WebView by default
- Users can still use "Open Panel in Browser" command
- No data loss risk (feature only displays Panel, doesn't modify content)

## Open Questions

1. **Panel Iframe Embedding:** Does Kirby 4.x set any headers that prevent iframe embedding?
   - *Proposed answer*: Test with fresh Kirby installation; if blocked, document workaround in Kirby config

2. **Multi-Language Support:** Should Panel language setting sync with VS Code's display language?
   - *Proposed answer*: No automatic sync in Phase 1; Panel uses its own language setting

3. **Mobile/Tablet Panel:** Should WebView support responsive Panel layout (narrow viewport)?
   - *Proposed answer*: Yes, test with different editor column widths to ensure usability

4. **Panel API Access:** Should we expose Kirby's REST API for programmatic content access in future?
   - *Proposed answer*: Phase 3 feature; requires authentication token management and API wrapper implementation
