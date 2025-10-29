# Specification: Panel WebView

## ADDED Requirements

### Requirement: Panel URL Detection
The extension SHALL implement automatic detection of Kirby Panel URLs using multiple strategies to support various development setups.

#### Scenario: Configuration setting priority
- **WHEN** `kirby.panelUrl` configuration setting is set to a non-empty value
- **THEN** the extension SHALL use this URL first before attempting auto-detection
- **AND** verify the URL is reachable before using it

#### Scenario: Localhost port probing
- **WHEN** `kirby.panelUrl` is not configured
- **AND** `kirby.panelAutoDetect` is true
- **THEN** the extension SHALL probe common localhost ports (8000, 3000, 8080, 8888) in sequence
- **AND** test each port with URL pattern `http://localhost:{port}/panel`
- **AND** return the first reachable URL

#### Scenario: Package.json script parsing
- **WHEN** localhost port probing fails to find a server
- **THEN** the extension SHALL read `package.json` in the workspace root
- **AND** parse the `scripts.dev` field to extract port information from server commands
- **AND** test the extracted port for reachability

#### Scenario: Manual URL entry
- **WHEN** all automatic detection strategies fail
- **THEN** the extension SHALL prompt the user to enter a Panel URL manually
- **AND** validate the entered URL format
- **AND** save the validated URL to `kirby.panelUrl` workspace setting

### Requirement: Server Reachability Check
The extension SHALL verify that a Kirby Panel URL is reachable before attempting to display it in a WebView.

#### Scenario: HTTP HEAD request
- **WHEN** checking if a Panel URL is reachable
- **THEN** the extension SHALL send an HTTP HEAD request to the URL
- **AND** use a 2-second timeout to prevent long waits
- **AND** consider status codes 200-299 and 401 (auth required) as "server running"
- **AND** consider connection refused, timeout, or other errors as "server not running"

#### Scenario: Server not running
- **WHEN** Panel URL is not reachable
- **THEN** the extension SHALL display a warning message: "Kirby development server is not running. Start your server and try again."
- **AND** provide action buttons: [How to start server] [Configure Panel URL] [Dismiss]

#### Scenario: How to start server action
- **WHEN** user clicks [How to start server] in the warning message
- **THEN** the extension SHALL open documentation URL with server setup instructions in the default browser

### Requirement: WebView Panel Creation
The extension SHALL create a VS Code WebView panel to embed the Kirby Panel interface within the editor.

#### Scenario: Create new WebView
- **WHEN** user executes "Kirby: Open Panel in WebView" command
- **AND** no Panel WebView currently exists
- **THEN** the extension SHALL create a new WebView panel using `vscode.window.createWebviewPanel()`
- **AND** set the panel title to "Kirby Panel"
- **AND** display it in the second editor column (ViewColumn.Two)

#### Scenario: Reuse existing WebView
- **WHEN** user executes "Kirby: Open Panel in WebView" command
- **AND** a Panel WebView already exists
- **THEN** the extension SHALL reveal the existing WebView panel
- **AND** NOT create a duplicate panel

#### Scenario: WebView HTML generation
- **WHEN** creating a WebView panel
- **THEN** the extension SHALL generate HTML containing an iframe element
- **AND** set the iframe `src` attribute to the detected Panel URL
- **AND** style the iframe to fill the entire WebView viewport (100% width/height, no borders)

#### Scenario: WebView configuration
- **WHEN** creating a WebView panel
- **THEN** the extension SHALL configure WebView options:
  - `enableScripts: true` - Allow Panel JavaScript to execute
  - `retainContextWhenHidden: true` - Preserve state when tab is hidden
  - `localResourceRoots: []` - No local resources needed

### Requirement: WebView Authentication Support
The extension SHALL allow users to authenticate with the Kirby Panel via standard login forms within the WebView.

#### Scenario: Unauthenticated Panel access
- **WHEN** WebView displays a Panel URL that requires authentication
- **THEN** the Kirby Panel SHALL display its standard login form within the iframe
- **AND** the WebView SHALL preserve cookies after successful login

#### Scenario: Session persistence during VS Code session
- **WHEN** user authenticates with the Panel in the WebView
- **THEN** the WebView SHALL maintain the session cookie for the duration of the VS Code session
- **AND** allow navigating between Panel pages without re-authentication

#### Scenario: Session expiration after VS Code restart
- **WHEN** VS Code is closed and reopened
- **THEN** the WebView SHALL NOT retain previous session cookies
- **AND** user will need to re-authenticate on first Panel access

### Requirement: External Browser Access
The extension SHALL provide a command to open the Kirby Panel in the user's default web browser as an alternative to WebView.

#### Scenario: Open Panel in browser
- **WHEN** user executes "Kirby: Open Panel in Browser" command
- **THEN** the extension SHALL detect the Panel URL using the same detection logic
- **AND** open the URL in the default system browser using `vscode.env.openExternal()`

#### Scenario: Browser preference setting
- **WHEN** `kirby.panelOpenInWebView` setting is set to false
- **THEN** all Panel access commands SHALL default to opening in external browser instead of WebView

### Requirement: Status Bar Integration
The extension SHALL display a status bar item for quick access to the Kirby Panel.

#### Scenario: Status bar item visibility
- **WHEN** extension activates in a Kirby workspace
- **AND** `kirby.enablePanelIntegration` is true
- **THEN** the extension SHALL display a status bar item with text "🎛️ Kirby Panel"
- **AND** position it in the status bar (default alignment: right)

#### Scenario: Status bar click action
- **WHEN** user clicks the status bar item
- **THEN** the extension SHALL execute "Kirby: Open Panel in WebView" command

#### Scenario: Status bar server status indicator
- **WHEN** Panel URL is detected and server is running
- **THEN** the status bar item SHALL display "🎛️ Kirby Panel"
- **WHEN** Panel URL is configured but server is not reachable
- **THEN** the status bar item SHALL display "⚠️ Panel offline"
- **AND** tooltip SHALL show "Kirby Panel server is not reachable"

#### Scenario: Hide status bar in non-Kirby workspace
- **WHEN** workspace does not contain a `site/` directory (not a Kirby project)
- **THEN** the extension SHALL hide the status bar item

### Requirement: Panel Reload Functionality
The extension SHALL provide a command to refresh the Panel WebView content without closing the panel.

#### Scenario: Reload Panel command
- **WHEN** user executes "Kirby: Reload Panel" command
- **AND** a Panel WebView is currently open
- **THEN** the extension SHALL reload the WebView content
- **AND** preserve the WebView's current URL (including any Panel navigation state)

#### Scenario: Reload when WebView not open
- **WHEN** user executes "Kirby: Reload Panel" command
- **AND** no Panel WebView is currently open
- **THEN** the extension SHALL display an information message: "No Panel WebView is open"

### Requirement: Panel URL Configuration
The extension SHALL provide configuration settings and commands to manage Panel URLs.

#### Scenario: Configure Panel URL command
- **WHEN** user executes "Kirby: Configure Panel URL" command
- **THEN** the extension SHALL prompt for a URL input with placeholder "http://localhost:8000/panel"
- **AND** validate the entered URL format (must be HTTP/HTTPS URL)
- **AND** save the valid URL to `kirby.panelUrl` workspace setting

#### Scenario: Auto-detect toggle
- **WHEN** `kirby.panelAutoDetect` setting is set to false
- **THEN** the extension SHALL NOT attempt automatic URL detection
- **AND** ONLY use `kirby.panelUrl` configuration value

#### Scenario: Enable/disable Panel integration
- **WHEN** `kirby.enablePanelIntegration` setting is set to false
- **THEN** the extension SHALL NOT register Panel commands
- **AND** NOT display status bar item
- **AND** NOT perform Panel URL detection

### Requirement: Error Handling and User Feedback
The extension SHALL provide clear error messages and troubleshooting guidance for common Panel integration issues.

#### Scenario: iframe embedding blocked
- **WHEN** WebView fails to load Panel due to X-Frame-Options or CSP headers
- **THEN** the extension SHALL detect the iframe loading error
- **AND** display an error notification: "Panel cannot be embedded due to server security settings. Open in browser instead?"
- **AND** provide action buttons: [Open in Browser] [Troubleshooting Guide]

#### Scenario: Network timeout
- **WHEN** Panel URL takes longer than 2 seconds to respond during detection
- **THEN** the extension SHALL consider the server unreachable
- **AND** display server not running warning

#### Scenario: Invalid URL configuration
- **WHEN** `kirby.panelUrl` is set to an invalid URL format
- **THEN** the extension SHALL log a warning to the output channel
- **AND** fall back to auto-detection (if enabled)

### Requirement: WebView Lifecycle Management
The extension SHALL properly manage WebView creation, disposal, and resource cleanup.

#### Scenario: WebView disposal on close
- **WHEN** user closes the Panel WebView tab
- **THEN** the extension SHALL dispose of the WebView resources
- **AND** allow creating a new WebView on next Panel access

#### Scenario: Extension deactivation cleanup
- **WHEN** VS Code extension is deactivated (VS Code closes or extension disabled)
- **THEN** the extension SHALL dispose of any active Panel WebViews
- **AND** dispose of status bar item
- **AND** clean up event listeners and subscriptions

### Requirement: Multi-Root Workspace Support
The extension SHALL support Panel integration in multi-root VS Code workspaces with multiple Kirby projects.

#### Scenario: Workspace folder detection
- **WHEN** VS Code has multiple workspace folders
- **AND** user executes Panel command
- **THEN** the extension SHALL detect which workspace folder is active (based on current editor)
- **AND** use Panel URL configuration specific to that workspace folder

#### Scenario: Multiple WebView instances
- **WHEN** multiple Kirby workspace folders are present
- **THEN** the extension SHALL allow one Panel WebView per workspace folder
- **AND** label each WebView with the workspace folder name (e.g., "Kirby Panel - Project A")
