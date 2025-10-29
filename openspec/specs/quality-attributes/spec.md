# quality-attributes Specification

## Purpose
TBD - created by archiving change add-nonfunctional-requirements. Update Purpose after archive.
## Requirements
### Requirement: Performance - Extension Activation
The extension SHALL activate quickly to avoid blocking the user's editor startup.

#### Scenario: Fast activation time
- **WHEN** VS Code loads the extension in a Kirby workspace
- **THEN** the extension SHALL complete activation within 500 milliseconds
- **AND** register all commands, providers, and event listeners during this time

#### Scenario: Lazy loading of heavy operations
- **WHEN** extension activation requires expensive operations (e.g., parsing large files, indexing workspace)
- **THEN** the extension SHALL defer these operations until after activation completes
- **AND** perform them asynchronously without blocking the editor

#### Scenario: Activation performance measurement
- **WHEN** developing or testing the extension
- **THEN** activation time SHALL be measurable using VS Code's extension profiling tools
- **AND** performance regressions beyond 500ms threshold SHALL be identified and addressed

### Requirement: Performance - File System Operations
The extension SHALL execute file system operations efficiently to avoid noticeable delays in the editor.

#### Scenario: Fast file read operations
- **WHEN** reading files (e.g., Blueprint YAML, template PHP, package.json)
- **THEN** individual file read operations SHALL complete within 100 milliseconds
- **AND** use VS Code's workspace file system API for optimal performance

#### Scenario: Fast file write operations
- **WHEN** creating or modifying files (e.g., scaffolding templates, extracting snippets)
- **THEN** individual file write operations SHALL complete within 100 milliseconds
- **AND** use VS Code's WorkspaceEdit API for atomic multi-file changes

#### Scenario: File size limits for parsing
- **WHEN** parsing file contents (e.g., extracting Blueprint fields, detecting snippet calls)
- **THEN** the extension SHALL limit parsing to files under 500 KB
- **AND** skip parsing and log a warning for files exceeding this limit to prevent performance degradation

### Requirement: Performance - CodeLens and UI Elements
The extension SHALL render CodeLens and other inline UI elements quickly to avoid visual delays.

#### Scenario: Fast CodeLens rendering
- **WHEN** displaying CodeLens providers (e.g., snippet navigation, Blueprint field display)
- **THEN** CodeLens computation SHALL complete within 200 milliseconds per file
- **AND** render without causing editor jank or scroll lag

#### Scenario: Incremental CodeLens updates
- **WHEN** file content changes and CodeLens must update
- **THEN** the extension SHALL use incremental parsing where possible
- **AND** avoid recomputing the entire CodeLens set if only a small portion changed

### Requirement: Performance - Command Execution
The extension SHALL execute commands responsively based on operation complexity.

#### Scenario: Fast simple command execution
- **WHEN** user executes a simple command (e.g., "Add Type Hints", "Open Panel in Browser")
- **THEN** the command SHALL complete within 300 milliseconds
- **AND** provide immediate feedback (success notification, opened file, etc.)

#### Scenario: Acceptable complex command execution
- **WHEN** user executes a complex command (e.g., "New Page Type" scaffolding, "Reinstall API Stubs")
- **THEN** the command SHALL complete within 2 seconds
- **AND** display a progress indicator (notification, status bar message) if operation takes longer than 500ms

#### Scenario: Cancellable long-running operations
- **WHEN** a command requires more than 2 seconds (e.g., large project indexing)
- **THEN** the extension SHALL provide a cancellation mechanism (progress notification with "Cancel" button)
- **AND** clean up partial state if user cancels

### Requirement: Code Maintainability - Modular Architecture
The extension SHALL follow a modular architecture that supports independent development and testing of features.

#### Scenario: Feature isolation in modules
- **WHEN** implementing a new feature or capability
- **THEN** the feature SHALL be contained in dedicated modules (e.g., `src/commands/`, `src/providers/`, `src/integrations/`)
- **AND** minimize dependencies on other feature modules (prefer utility modules like `src/utils/kirbyProject.ts`)

#### Scenario: Single Responsibility Principle
- **WHEN** creating a new class, function, or module
- **THEN** the component SHALL have a single, clearly defined responsibility
- **AND** be named to reflect that responsibility (e.g., SnippetDefinitionProvider, PageTypeScaffolder)

#### Scenario: Dependency injection over global state
- **WHEN** a module requires configuration or shared utilities
- **THEN** the module SHALL accept these as constructor parameters or function arguments
- **AND** avoid accessing global state or singleton instances (exception: VS Code workspace API)

### Requirement: Code Maintainability - Testability
The extension SHALL be designed for comprehensive automated testing with high code coverage for critical paths.

#### Scenario: Test coverage for core logic
- **WHEN** implementing business logic (e.g., file path resolution, YAML parsing, PHP snippet detection)
- **THEN** the module SHALL have a corresponding test file in `src/test/`
- **AND** achieve >80% code coverage for core logic paths

#### Scenario: Security-critical path coverage
- **WHEN** implementing security-sensitive operations (e.g., file path validation, user input sanitization)
- **THEN** the module SHALL have >90% test coverage
- **AND** include tests for known attack vectors (path traversal, injection, etc.)

#### Scenario: Integration testing for VS Code API usage
- **WHEN** using VS Code extension APIs (commands, providers, file system)
- **THEN** integration tests SHALL verify correct API usage
- **AND** use mock VS Code APIs where appropriate to enable fast, isolated testing

### Requirement: Code Maintainability - Open/Closed Principle
The extension SHALL support adding new features through extension rather than modification of existing code.

#### Scenario: Adding new features without modifying core
- **WHEN** adding a new capability (e.g., new command, new provider)
- **THEN** the change SHALL primarily involve creating new files
- **AND** minimize modifications to existing feature modules (exception: registration in `extension.ts`)

#### Scenario: Configuration-driven feature toggles
- **WHEN** a feature can be enabled/disabled by users
- **THEN** the feature SHALL be toggleable via `package.json` configuration settings
- **AND** gracefully skip initialization when disabled (no errors or warnings)

### Requirement: Implementation Feasibility - Standard VS Code Patterns
The extension SHALL use well-documented VS Code extension API patterns to enable rapid development.

#### Scenario: Use of standard provider interfaces
- **WHEN** implementing language features (navigation, code lens, hover, completion)
- **THEN** the extension SHALL implement VS Code's standard provider interfaces (DefinitionProvider, CodeLensProvider, etc.)
- **AND** follow patterns documented in VS Code extension samples and API documentation

#### Scenario: Leverage existing ecosystem tools
- **WHEN** a capability can be achieved by integrating with existing VS Code extensions or libraries
- **THEN** the extension SHALL prefer integration over reimplementation
- **AND** document dependencies and integration points clearly

#### Scenario: Prototype-friendly implementation
- **WHEN** implementing a new feature
- **THEN** the initial implementation SHALL prioritize simplicity and clarity over optimization
- **AND** allow for iterative refinement based on user feedback

### Requirement: Compatibility - Non-Interference with Existing Extensions
The extension SHALL coexist with popular VS Code extensions without breaking their functionality.

#### Scenario: RedHat YAML extension compatibility
- **WHEN** RedHat YAML extension is installed and active
- **THEN** the toolkit SHALL NOT override or conflict with YAML language features
- **AND** cooperate with YAML extension for Blueprint validation (via yamlValidation contribution)

#### Scenario: Intelephense compatibility
- **WHEN** Intelephense PHP language server is installed
- **THEN** the toolkit SHALL enhance Intelephense with type hints and API stubs
- **AND** NOT interfere with Intelephense's existing PHP completion, hover, or navigation features

#### Scenario: Tailwind CSS IntelliSense compatibility
- **WHEN** Tailwind CSS IntelliSense extension is installed
- **THEN** the toolkit SHALL configure Tailwind to recognize PHP template files
- **AND** NOT override user's existing Tailwind configuration

### Requirement: Compatibility - Graceful Degradation
The extension SHALL handle missing optional dependencies gracefully without errors.

#### Scenario: Intelephense not installed
- **WHEN** Intelephense is not installed
- **AND** toolkit features depend on Intelephense (e.g., API IntelliSense stubs)
- **THEN** the extension SHALL display a one-time informational message recommending installation
- **AND** continue activation and provide non-Intelephense features

#### Scenario: Tailwind extension not installed
- **WHEN** Tailwind CSS IntelliSense is not installed
- **AND** toolkit detects Tailwind in the project
- **THEN** the extension SHALL offer to configure Tailwind but NOT require the extension
- **AND** NOT display errors if configuration cannot be applied

### Requirement: Compatibility - Configuration Respect
The extension SHALL read and write shared VS Code configuration without overwriting user preferences.

#### Scenario: Additive configuration changes
- **WHEN** modifying workspace settings (e.g., adding stub paths to Intelephense, enabling Tailwind for PHP)
- **THEN** the extension SHALL merge new values with existing settings
- **AND** preserve user's existing configuration values

#### Scenario: User configuration precedence
- **WHEN** user has explicitly configured a setting that conflicts with toolkit defaults
- **THEN** the extension SHALL respect the user's configuration
- **AND** NOT override it without explicit user action (e.g., command to reset configuration)

### Requirement: User Experience - Zero Configuration
The extension SHALL work out-of-the-box for standard Kirby projects without requiring setup.

#### Scenario: Automatic Kirby project detection
- **WHEN** workspace contains a `site/` directory with Kirby structure
- **THEN** the extension SHALL automatically detect it as a Kirby project
- **AND** enable toolkit features without user configuration

#### Scenario: Sensible default settings
- **WHEN** extension activates for the first time
- **THEN** all features SHALL use sensible defaults (e.g., auto-inject type hints: true, CodeLens enabled: true)
- **AND** users can opt-out via settings rather than opt-in

### Requirement: User Experience - Progressive Disclosure
The extension SHALL expose advanced features through progressive disclosure to avoid overwhelming new users.

#### Scenario: Basic features visible by default
- **WHEN** user first installs the extension
- **THEN** core features (type hints, Blueprint validation, snippet navigation) SHALL be immediately visible
- **AND** advanced features (Panel WebView, Build Integration) are discoverable via Command Palette

#### Scenario: Settings for power users
- **WHEN** user needs fine-grained control
- **THEN** advanced settings SHALL be available in VS Code settings UI
- **AND** grouped logically under "Kirby CMS Developer Toolkit" category

### Requirement: User Experience - Contextual Actions
The extension SHALL provide actions and information at the point of relevance in the editor.

#### Scenario: CodeLens at point of use
- **WHEN** user is editing a file with toolkit-relevant code (e.g., `snippet()` call, template with Blueprint)
- **THEN** CodeLens links SHALL appear inline above the relevant code
- **AND** clicking CodeLens SHALL perform the contextually appropriate action (navigate, display info)

#### Scenario: Quick actions in context menus
- **WHEN** user right-clicks in a relevant file (e.g., PHP template)
- **THEN** toolkit commands SHALL appear in the context menu where appropriate (e.g., "Extract to Snippet" when text is selected)

### Requirement: User Experience - Clear Feedback
The extension SHALL provide clear, actionable feedback for user-initiated actions.

#### Scenario: Success notifications
- **WHEN** user executes a command that completes successfully (e.g., "New Page Type", "Configure Tailwind")
- **THEN** the extension SHALL display a success notification
- **AND** include actionable next steps (e.g., "Open template file", "View generated files")

#### Scenario: Error notifications with guidance
- **WHEN** an error occurs (e.g., file creation fails, server not found)
- **THEN** the extension SHALL display an error notification with a clear explanation
- **AND** provide troubleshooting guidance or action buttons (e.g., "Check permissions", "Configure URL")

#### Scenario: Progress indicators for long operations
- **WHEN** an operation takes longer than 500ms (e.g., scaffolding, stub installation)
- **THEN** the extension SHALL display a progress indicator (notification or status bar message)
- **AND** update progress as the operation proceeds

### Requirement: User Experience - Non-Intrusive Design
The extension SHALL enhance workflow without cluttering the UI or interrupting focus.

#### Scenario: Disableable UI elements
- **WHEN** user finds a UI element intrusive (e.g., CodeLens, status bar items)
- **THEN** the extension SHALL provide a setting to disable that element
- **AND** document the setting in README and VS Code settings UI

#### Scenario: One-time informational messages
- **WHEN** extension displays an informational message (e.g., "Intelephense recommended", "Auto-started build")
- **THEN** the message SHALL be shown only once per workspace
- **AND** provide a "Don't show again" option

#### Scenario: Minimal status bar footprint
- **WHEN** extension adds status bar items (e.g., build status, Panel access)
- **THEN** status bar items SHALL be concise (icon + short text)
- **AND** hide status bar items in non-Kirby workspaces

### Requirement: User Experience - Onboarding for New Users
The extension SHALL provide guidance for developers new to Kirby CMS or the toolkit.

#### Scenario: First-time feature discovery
- **WHEN** user installs the extension and opens a Kirby project for the first time
- **THEN** the extension MAY display a welcome message explaining key features
- **AND** provide links to README or documentation

#### Scenario: Contextual help in settings
- **WHEN** user views toolkit settings in VS Code settings UI
- **THEN** each setting SHALL have a clear description explaining its purpose
- **AND** include examples where appropriate (e.g., "Panel URL: http://localhost:8000/panel")

#### Scenario: Tooltips and hover information
- **WHEN** user hovers over CodeLens links or status bar items
- **THEN** a tooltip SHALL appear explaining the action
- **AND** include keyboard shortcuts if applicable

