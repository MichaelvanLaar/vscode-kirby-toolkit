# Specification Delta: Build Automation Enhancements

## MODIFIED Requirements

### Requirement: Build Status Monitoring
The extension SHALL track the build process state using both terminal lifecycle events AND build tool output parsing, providing real-time status updates during watch mode rebuilds.

#### Scenario: Idle state
- **WHEN** no "Kirby Build" terminal exists
- **AND** no external terminals are tracked
- **THEN** the extension SHALL set build status to "idle"

#### Scenario: Building state (initial build)
- **WHEN** a build terminal is created and active
- **THEN** the extension SHALL set build status to "building"
- **AND** start monitoring terminal output for build events

#### Scenario: Ready state (one-time build)
- **WHEN** build terminal output matches a build success pattern
- **AND** no watch mode is detected
- **THEN** the extension SHALL set build status to "ready"

#### Scenario: Watch mode active state
- **WHEN** build terminal output matches a watch-ready pattern (e.g., "webpack watching")
- **THEN** the extension SHALL set build status to "watch-mode-active"
- **AND** continue monitoring output for rebuild events

#### Scenario: Rebuilding state (watch mode rebuild)
- **WHEN** build status is "watch-mode-active"
- **AND** terminal output matches a build-start pattern
- **THEN** the extension SHALL set build status to "rebuilding"
- **AND** track rebuild start timestamp

#### Scenario: Watch rebuild success
- **WHEN** build status is "rebuilding"
- **AND** terminal output matches a build success pattern
- **THEN** the extension SHALL set build status to "watch-mode-active"
- **AND** update last rebuild timestamp

#### Scenario: Watch rebuild failure
- **WHEN** build status is "rebuilding"
- **AND** terminal output matches a build error pattern
- **THEN** the extension SHALL set build status to "error"
- **AND** preserve watch mode tracking for recovery

#### Scenario: Error state from terminal closure
- **WHEN** build terminal closes unexpectedly (before user stops it manually)
- **THEN** the extension SHALL set build status to "error"

#### Scenario: Fallback to timeout-based status
- **WHEN** output parsing is disabled OR pattern matching fails
- **THEN** the extension SHALL fall back to timeout-based status detection
- **AND** transition to "ready" after 5 seconds as before

### Requirement: Terminal-Based Process Management
The extension SHALL use a hybrid approach combining `node-pty` for output capture with VS Code's Terminal API for display, providing both programmatic monitoring and user interaction.

#### Scenario: Start build watcher with hybrid mode
- **WHEN** user executes "Kirby: Start Build Watcher" command
- **AND** `kirby.enableBuildOutputParsing` is true
- **AND** `node-pty` module is available
- **THEN** the extension SHALL spawn a PTY process for the build command
- **AND** create a custom Pseudoterminal to forward output to VS Code Terminal
- **AND** capture PTY output for parsing
- **AND** allow user to interact with the terminal

#### Scenario: Fallback to pure Terminal API
- **WHEN** user executes build command
- **AND** `node-pty` module is unavailable OR fails to load
- **THEN** the extension SHALL fall back to pure Terminal API approach
- **AND** use timeout-based status detection
- **AND** log a warning message about reduced functionality

#### Scenario: Stop build watcher (hybrid mode)
- **WHEN** user executes "Kirby: Stop Build Watcher" command
- **AND** a PTY-based build process is active
- **THEN** the extension SHALL send SIGTERM to the PTY process
- **AND** dispose of the VS Code terminal
- **AND** clean up output parsing resources

#### Scenario: Prevent duplicate terminals
- **WHEN** user executes "Kirby: Start Build Watcher" command
- **AND** a "Kirby Build" terminal already exists
- **THEN** the extension SHALL reveal the existing terminal instead of creating a new one
- **AND** display an informational message: "Build watcher is already running"

#### Scenario: Restart build watcher
- **WHEN** user executes "Kirby: Restart Build Watcher" command
- **THEN** the extension SHALL stop the existing build process (if running)
- **AND** start a new build process with the same script
- **AND** reset output parser state
- **AND** display success notification

### Requirement: Status Bar Integration
The extension SHALL display build status in VS Code's status bar with enhanced metrics for watch mode and rebuild tracking.

#### Scenario: Status bar idle display
- **WHEN** build status is "idle"
- **THEN** status bar SHALL display "⚫ No build" in gray color

#### Scenario: Status bar building display
- **WHEN** build status is "building"
- **THEN** status bar SHALL display "🔨 Building" in yellow/warning color

#### Scenario: Status bar ready display
- **WHEN** build status is "ready"
- **THEN** status bar SHALL display "✅ Build ready" in green/success color

#### Scenario: Status bar watch mode display
- **WHEN** build status is "watch-mode-active"
- **THEN** status bar SHALL display "👁️ Watching" in blue/info color

#### Scenario: Status bar rebuilding display
- **WHEN** build status is "rebuilding"
- **THEN** status bar SHALL display "🔨 Rebuilding" in yellow/warning color

#### Scenario: Status bar error display
- **WHEN** build status is "error"
- **THEN** status bar SHALL display "❌ Build error" in red/error color

#### Scenario: Status bar tooltip with metrics
- **WHEN** `kirby.showBuildMetrics` is true
- **AND** build duration data is available
- **THEN** status bar tooltip SHALL display last build time (e.g., "Last rebuild: 234ms")
- **AND** display total rebuild count if in watch mode

#### Scenario: Status bar click action
- **WHEN** user clicks the build status bar item
- **THEN** the extension SHALL focus the "Kirby Build" terminal (if it exists)
- **OR** display message "No build terminal is active" if terminal does not exist

#### Scenario: Status bar visibility
- **WHEN** workspace is not a Kirby project (no `site/` directory)
- **THEN** the extension SHALL hide the build status bar item

## ADDED Requirements

### Requirement: Build Tool Output Pattern Matching
The extension SHALL detect build events by matching terminal output against predefined patterns for common build tools.

#### Scenario: Detect Webpack build start
- **WHEN** terminal output contains "Compiling..." or "Hash: [hex]"
- **THEN** the extension SHALL emit a "build-start" event

#### Scenario: Detect Webpack build success
- **WHEN** terminal output contains "compiled successfully" or "Built at:"
- **THEN** the extension SHALL emit a "build-success" event

#### Scenario: Detect Webpack watch mode
- **WHEN** terminal output contains "webpack is watching the files"
- **THEN** the extension SHALL set watch mode flag to true
- **AND** emit a "watch-ready" event

#### Scenario: Detect Vite build start
- **WHEN** terminal output contains "vite v[version] building"
- **THEN** the extension SHALL emit a "build-start" event

#### Scenario: Detect Vite build success
- **WHEN** terminal output contains "built in [time]ms" or "ready in [time]ms"
- **THEN** the extension SHALL emit a "build-success" event

#### Scenario: Detect Vite dev server ready
- **WHEN** terminal output contains "Local:   http://"
- **THEN** the extension SHALL set watch mode flag to true
- **AND** emit a "watch-ready" event

#### Scenario: Detect build tool errors
- **WHEN** terminal output contains "ERROR in" or "error:" or "failed to"
- **THEN** the extension SHALL emit a "build-error" event

#### Scenario: Auto-detect build tool from output
- **WHEN** output parsing begins
- **AND** terminal output contains "webpack [version]"
- **THEN** the extension SHALL activate Webpack output patterns

#### Scenario: Custom pattern configuration
- **WHEN** `kirby.buildToolPatterns` setting defines custom patterns
- **THEN** the extension SHALL use those patterns in addition to built-in ones
- **AND** allow overriding built-in patterns for specific tools

### Requirement: Build Metrics Tracking
The extension SHALL track build performance metrics including duration and rebuild counts.

#### Scenario: Track build duration
- **WHEN** a "build-start" event is detected
- **THEN** the extension SHALL record the start timestamp
- **WHEN** a "build-success" or "build-error" event is detected
- **THEN** the extension SHALL calculate duration and store in state

#### Scenario: Track rebuild count
- **WHEN** in watch mode
- **AND** a rebuild completes
- **THEN** the extension SHALL increment rebuild counter
- **AND** update last rebuild timestamp

#### Scenario: Display metrics in tooltip
- **WHEN** `kirby.showBuildMetrics` is true
- **THEN** status bar tooltip SHALL show:
  - Last build duration (e.g., "234ms" or "2.3s")
  - Rebuild count in watch mode (e.g., "3 rebuilds")
  - Last rebuild timestamp (e.g., "2 seconds ago")

#### Scenario: Reset metrics on build stop
- **WHEN** build watcher is stopped
- **THEN** the extension SHALL reset all metrics to zero
- **AND** clear last rebuild timestamp

### Requirement: Output Buffer Management
The extension SHALL efficiently manage terminal output buffering to prevent memory issues with verbose build tools.

#### Scenario: Buffer size limit
- **WHEN** terminal output accumulates during parsing
- **THEN** the extension SHALL limit buffer size to 100KB
- **AND** discard oldest data when limit is exceeded

#### Scenario: Chunk-based parsing
- **WHEN** new output data arrives from PTY
- **THEN** the extension SHALL parse in chunks (not line-by-line)
- **AND** process each chunk within 10ms to avoid blocking

#### Scenario: Buffer reset on rebuild
- **WHEN** a new build starts in watch mode
- **THEN** the extension SHALL clear the output buffer
- **AND** start fresh parsing for the new build

### Requirement: External Terminal Monitoring
The extension SHALL optionally monitor build processes started in external terminals (npm scripts panel, custom terminals).

#### Scenario: Monitor npm scripts panel terminals
- **WHEN** `kirby.monitorAllTerminals` is true
- **AND** a new terminal is opened with name matching "npm: [script]"
- **THEN** the extension SHALL detect if [script] is a build script
- **AND** associate this terminal with build status if true

#### Scenario: Extract script name from terminal
- **WHEN** npm scripts panel creates terminal "npm: dev"
- **THEN** the extension SHALL extract "dev" as the script name
- **AND** check if "dev" matches detected build scripts

#### Scenario: Track external terminal build status
- **WHEN** an external terminal is associated with build status
- **THEN** the extension SHALL monitor its output for build events
- **AND** update status bar based on parsed events
- **AND** NOT create a new terminal (use existing one)

#### Scenario: External terminal closure
- **WHEN** an external terminal associated with build status is closed
- **THEN** the extension SHALL update build status to "idle"
- **AND** remove the terminal association

#### Scenario: Opt-in external monitoring
- **WHEN** `kirby.monitorAllTerminals` is false (default)
- **THEN** the extension SHALL NOT monitor external terminals
- **AND** only track extension-created terminals

#### Scenario: Custom terminal patterns
- **WHEN** `kirby.externalTerminalPatterns` is configured
- **THEN** the extension SHALL use those patterns to identify external build terminals
- **AND** support patterns like ["npm:", "yarn:", "pnpm:"]

### Requirement: Output Parsing Configuration
The extension SHALL provide configuration options to control output parsing behavior.

#### Scenario: Enable/disable output parsing
- **WHEN** `kirby.enableBuildOutputParsing` is set to false
- **THEN** the extension SHALL use pure Terminal API without PTY
- **AND** fall back to timeout-based status detection

#### Scenario: Custom build tool patterns
- **WHEN** `kirby.buildToolPatterns` defines custom patterns
- **THEN** the extension SHALL merge custom patterns with built-in ones
- **AND** allow overriding specific event patterns per tool

#### Scenario: Enable/disable build metrics
- **WHEN** `kirby.showBuildMetrics` is set to false
- **THEN** status bar tooltip SHALL NOT display duration or rebuild count
- **AND** only show basic status information

#### Scenario: Configuration hot-reload
- **WHEN** user changes output parsing settings
- **THEN** the extension SHALL apply changes without requiring restart
- **AND** preserve current build status during config reload

### Requirement: Error Handling and Graceful Degradation
The extension SHALL handle errors in output parsing and PTY operations gracefully.

#### Scenario: node-pty load failure
- **WHEN** `node-pty` module fails to load at extension activation
- **THEN** the extension SHALL log a warning
- **AND** fall back to pure Terminal API approach
- **AND** display informational message: "Build output parsing unavailable. Using basic status detection."

#### Scenario: Pattern match failure
- **WHEN** output parsing is enabled
- **AND** no patterns match terminal output after 10 seconds
- **THEN** the extension SHALL fall back to timeout-based status
- **AND** log debug message about unknown build tool

#### Scenario: PTY spawn failure
- **WHEN** PTY process fails to spawn
- **THEN** the extension SHALL fall back to Terminal API
- **AND** display error notification with troubleshooting steps

#### Scenario: Regex performance issue
- **WHEN** a custom pattern causes regex performance issues (>100ms)
- **THEN** the extension SHALL disable that pattern
- **AND** log a warning about pattern performance
- **AND** continue with remaining patterns
