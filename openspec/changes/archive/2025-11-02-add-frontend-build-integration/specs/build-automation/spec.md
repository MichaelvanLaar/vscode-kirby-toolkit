# Specification: Build Automation

## ADDED Requirements

### Requirement: Build Script Detection
The extension SHALL automatically detect frontend build scripts from the workspace's package.json file.

#### Scenario: Detect dev script
- **WHEN** extension activates in a workspace containing a package.json
- **AND** package.json contains a `scripts.dev` field
- **THEN** the extension SHALL identify this as the primary development build script

#### Scenario: Detect watch script as fallback
- **WHEN** package.json does not contain a `scripts.dev` field
- **AND** package.json contains a `scripts.watch` field
- **THEN** the extension SHALL identify this as the development build script

#### Scenario: Detect frontend-specific scripts
- **WHEN** package.json contains multiple scripts like `dev`, `dev:css`, `watch:css`
- **THEN** the extension SHALL prioritize scripts with suffixes suggesting frontend builds (`:css`, `:js`, `:assets`)
- **AND** prefer `dev` > `watch` > `dev:css` > `watch:css` in priority order

#### Scenario: Detect build script for one-time compilation
- **WHEN** package.json contains a `scripts.build` field
- **THEN** the extension SHALL identify this as the one-time build script
- **AND** use it for "Run Build Once" commands

#### Scenario: No build scripts found
- **WHEN** package.json does not contain any recognized build scripts
- **THEN** the extension SHALL NOT enable build integration features automatically
- **AND** allow manual configuration via `kirby.buildCommand` setting

### Requirement: Terminal-Based Process Management
The extension SHALL use VS Code's Terminal API to run build processes for better user experience and integration.

#### Scenario: Start build watcher
- **WHEN** user executes "Kirby: Start Build Watcher" command
- **THEN** the extension SHALL create a new Terminal with name "Kirby Build"
- **AND** execute the detected development build script (e.g., `npm run dev`)
- **AND** display the terminal in the terminal panel
- **AND** allow user to interact with the terminal (view output, send Ctrl+C)

#### Scenario: Stop build watcher
- **WHEN** user executes "Kirby: Stop Build Watcher" command
- **AND** a "Kirby Build" terminal is active
- **THEN** the extension SHALL dispose of the terminal
- **AND** send SIGTERM signal to terminate the build process

#### Scenario: Prevent duplicate terminals
- **WHEN** user executes "Kirby: Start Build Watcher" command
- **AND** a "Kirby Build" terminal already exists
- **THEN** the extension SHALL reveal the existing terminal instead of creating a new one
- **AND** display an informational message: "Build watcher is already running"

#### Scenario: Restart build watcher
- **WHEN** user executes "Kirby: Restart Build Watcher" command
- **THEN** the extension SHALL stop the existing build terminal (if running)
- **AND** start a new build terminal with the same script
- **AND** display success notification

### Requirement: Build Status Monitoring
The extension SHALL track the build process state and display status information to the user.

#### Scenario: Idle state
- **WHEN** no "Kirby Build" terminal exists
- **THEN** the extension SHALL set build status to "idle"

#### Scenario: Building state
- **WHEN** a "Kirby Build" terminal is created and active
- **THEN** the extension SHALL set build status to "building"
- **AND** maintain this status for at least 5 seconds

#### Scenario: Ready state
- **WHEN** build terminal has been active for more than 5 seconds without closing
- **THEN** the extension SHALL set build status to "ready"

#### Scenario: Error state
- **WHEN** build terminal closes unexpectedly (before user stops it manually)
- **THEN** the extension SHALL set build status to "error"

### Requirement: Status Bar Integration
The extension SHALL display build status in VS Code's status bar for quick visibility.

#### Scenario: Status bar idle display
- **WHEN** build status is "idle"
- **THEN** status bar SHALL display "⚫ No build" in gray color

#### Scenario: Status bar building display
- **WHEN** build status is "building"
- **THEN** status bar SHALL display "🔨 Building" in yellow/warning color

#### Scenario: Status bar ready display
- **WHEN** build status is "ready"
- **THEN** status bar SHALL display "✅ Build ready" in green/success color

#### Scenario: Status bar error display
- **WHEN** build status is "error"
- **THEN** status bar SHALL display "❌ Build error" in red/error color

#### Scenario: Status bar click action
- **WHEN** user clicks the build status bar item
- **THEN** the extension SHALL focus the "Kirby Build" terminal (if it exists)
- **OR** display message "No build terminal is active" if terminal does not exist

#### Scenario: Status bar visibility
- **WHEN** workspace is not a Kirby project (no `site/` directory)
- **THEN** the extension SHALL hide the build status bar item

### Requirement: Build Commands
The extension SHALL provide commands for manual build process control.

#### Scenario: Start build watcher command
- **WHEN** user executes "Kirby: Start Build Watcher" command
- **AND** build script is detected from package.json
- **THEN** the extension SHALL start the build terminal with the detected script

#### Scenario: Run build once command
- **WHEN** user executes "Kirby: Run Build Once" command
- **THEN** the extension SHALL execute the one-time build script (e.g., `npm run build`)
- **AND** create a terminal named "Kirby Build (once)"
- **AND** NOT mark this as a persistent build watcher

#### Scenario: Show build terminal command
- **WHEN** user executes "Kirby: Show Build Terminal" command
- **AND** a "Kirby Build" terminal exists
- **THEN** the extension SHALL reveal and focus the terminal

#### Scenario: Missing build script error
- **WHEN** user executes a build command
- **AND** no build script is detected or configured
- **THEN** the extension SHALL display an error notification: "No build script found. Configure via kirby.buildCommand setting."
- **AND** provide action button [Configure Build Command]

### Requirement: Auto-Start Configuration
The extension SHALL support automatic build watcher startup when opening a workspace.

#### Scenario: Auto-start disabled by default
- **WHEN** extension activates in a Kirby workspace
- **AND** `kirby.buildAutoStart` setting is false (default)
- **THEN** the extension SHALL NOT automatically start the build watcher

#### Scenario: Auto-start enabled
- **WHEN** extension activates in a Kirby workspace
- **AND** `kirby.buildAutoStart` setting is true
- **THEN** the extension SHALL wait for `kirby.buildAutoStartDelay` milliseconds (default: 2000ms)
- **AND** start the build watcher using the script specified in `kirby.buildAutoStartScript` setting (default: "dev")
- **AND** display a one-time informational notification on first auto-start

#### Scenario: Auto-start notification
- **WHEN** build watcher auto-starts for the first time in a workspace
- **THEN** the extension SHALL display notification: "Kirby Toolkit auto-started build process. Disable in settings."
- **AND** store workspace state flag to prevent repeated notifications
- **AND** provide action button [Don't show again]

#### Scenario: Prevent duplicate auto-start
- **WHEN** auto-start logic runs
- **AND** a "Kirby Build" terminal already exists
- **THEN** the extension SHALL NOT start a new build watcher
- **AND** NOT display any notifications

### Requirement: Custom Build Command Configuration
The extension SHALL allow users to override automatic script detection with custom build commands.

#### Scenario: Custom dev command
- **WHEN** `kirby.buildCommand` setting is set to a non-empty string (e.g., "npm run custom:dev")
- **THEN** the extension SHALL use this command for build watcher instead of auto-detected script

#### Scenario: Custom build-once command
- **WHEN** `kirby.buildCommand` is configured
- **AND** user executes "Run Build Once" command
- **THEN** the extension SHALL use the custom command (not auto-detected build script)

#### Scenario: Custom command validation
- **WHEN** `kirby.buildCommand` is set
- **THEN** the extension SHALL validate that the command is a non-empty string
- **AND** log a warning if command appears invalid (does not contain "npm" or "yarn" or "pnpm")

### Requirement: Multi-Workspace Support
The extension SHALL support independent build processes in multi-root VS Code workspaces.

#### Scenario: Workspace folder identification
- **WHEN** VS Code has multiple workspace folders
- **AND** user executes a build command
- **THEN** the extension SHALL determine the active workspace folder based on current editor
- **AND** use that folder's package.json for script detection

#### Scenario: Independent build terminals
- **WHEN** multiple Kirby workspace folders are present
- **THEN** the extension SHALL allow one build terminal per workspace folder
- **AND** name terminals with workspace folder name (e.g., "Kirby Build - ProjectA")

#### Scenario: Status bar multi-workspace behavior
- **WHEN** multiple workspace folders have active build processes
- **THEN** status bar SHALL display the build state of the currently active workspace folder

### Requirement: Error Handling and User Guidance
The extension SHALL provide clear error messages and troubleshooting guidance for build-related issues.

#### Scenario: Package.json not found
- **WHEN** user executes a build command
- **AND** no package.json exists in the workspace root
- **THEN** the extension SHALL display error: "No package.json found. Build integration requires Node.js project structure."

#### Scenario: npm command not found
- **WHEN** build terminal fails to start because npm is not installed
- **THEN** the terminal SHALL display standard shell error
- **AND** extension SHALL detect terminal closure and set status to "error"

#### Scenario: Build script execution failure
- **WHEN** build script fails to execute (exit code != 0)
- **AND** terminal closes due to script error
- **THEN** the extension SHALL set build status to "error"
- **AND** display notification: "Build process exited with error. Check terminal output for details."

### Requirement: Extension Lifecycle Management
The extension SHALL properly clean up build processes when deactivating or closing.

#### Scenario: Terminal cleanup on deactivation
- **WHEN** extension deactivates (VS Code closes or extension disabled)
- **AND** build terminals exist
- **THEN** the extension SHALL dispose of all build terminals
- **AND** terminate associated processes gracefully (SIGTERM)

#### Scenario: Terminal disposal subscription
- **WHEN** creating a build terminal
- **THEN** the extension SHALL register the terminal in `context.subscriptions`
- **AND** ensure automatic cleanup when extension context is disposed

#### Scenario: Status bar cleanup
- **WHEN** extension deactivates
- **THEN** the extension SHALL dispose of the status bar item
- **AND** remove event listeners for terminal lifecycle events
