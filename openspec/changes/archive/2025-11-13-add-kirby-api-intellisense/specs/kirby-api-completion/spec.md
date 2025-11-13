# Specification: Kirby API Completion

## ADDED Requirements

### Requirement: Intelephense Extension Detection
The extension SHALL detect whether the Intelephense PHP language server extension is installed in the user's VS Code environment.

#### Scenario: Intelephense installed
- **WHEN** the extension activates in a workspace
- **THEN** it SHALL query the VS Code extension API for Intelephense's extension ID (`bmewburn.vscode-intelephense-client`)
- **AND** if found, proceed with stub initialization

#### Scenario: Intelephense not installed
- **WHEN** the extension activates and Intelephense is not found
- **THEN** it SHALL display a one-time informational notification recommending Intelephense installation
- **AND** continue activation without initializing API IntelliSense features
- **AND** not display the notification again for the same workspace

### Requirement: PHP Stub File Bundling
The extension SHALL bundle pre-generated PHP stub files containing Kirby API class and method signatures for offline use.

#### Scenario: Core Kirby classes included
- **WHEN** the extension is packaged for distribution
- **THEN** it SHALL include stub files for the following Kirby core classes in `src/stubs/kirby-api/Cms/`:
  - `Page.php` (with methods: title(), children(), parent(), url(), etc.)
  - `Site.php` (with methods: children(), find(), pages(), title(), etc.)
  - `File.php` (with methods: url(), filename(), type(), size(), etc.)
  - `User.php` (with methods: email(), role(), name(), permissions(), etc.)
  - `Kirby.php` (with methods: site(), users(), option(), roots(), urls(), etc.)

#### Scenario: Stub files contain PHPDoc annotations
- **WHEN** a stub file is generated
- **THEN** each class and method SHALL include PHPDoc annotations with:
  - Method descriptions
  - `@param` type hints for parameters
  - `@return` type hints for return values
  - `@link` references to official Kirby documentation where applicable

#### Scenario: Field type stubs included
- **WHEN** the extension is packaged
- **THEN** it SHALL include stub files for common Kirby Field types (e.g., TextField, EmailField, UrlField)
- **AND** each Field class SHALL declare common methods (value(), isEmpty(), isNotEmpty(), etc.)

### Requirement: Workspace Stub Directory Creation
The extension SHALL copy bundled stub files to a workspace-specific directory on activation to enable Intelephense indexing.

#### Scenario: First activation in workspace
- **WHEN** the extension activates in a Kirby workspace for the first time
- **AND** `kirby.enableApiIntelliSense` setting is true
- **AND** Intelephense is installed
- **THEN** the extension SHALL create `.vscode/kirby-stubs/` directory in the workspace root
- **AND** copy all stub files from `src/stubs/kirby-api/` to `.vscode/kirby-stubs/`
- **AND** preserve the directory structure (e.g., `Cms/Page.php`)

#### Scenario: Stub directory already exists
- **WHEN** the extension activates and `.vscode/kirby-stubs/` already exists
- **THEN** it SHALL skip copying stub files to avoid overwriting user modifications
- **AND** not display any warnings or errors

#### Scenario: File system permissions error
- **WHEN** stub copying fails due to insufficient permissions or disk errors
- **THEN** the extension SHALL log the error to the output channel
- **AND** display a user-facing error message with troubleshooting guidance
- **AND** continue activation without stub-based IntelliSense

### Requirement: Intelephense Configuration Integration
The extension SHALL configure Intelephense to index the workspace stub directory by updating VS Code workspace settings.

#### Scenario: Update intelephense.stubs setting
- **WHEN** stub files are successfully copied to `.vscode/kirby-stubs/`
- **THEN** the extension SHALL read the current workspace settings from `.vscode/settings.json`
- **AND** add `.vscode/kirby-stubs` to the `intelephense.stubs` array setting
- **AND** preserve any existing stub paths in the setting
- **AND** avoid adding duplicate entries if `.vscode/kirby-stubs` is already present

#### Scenario: Settings.json does not exist
- **WHEN** `.vscode/settings.json` file does not exist in the workspace
- **THEN** the extension SHALL create the file with the `intelephense.stubs` setting
- **AND** include `.vscode/kirby-stubs` as the initial value

#### Scenario: Intelephense reindex trigger
- **WHEN** the `intelephense.stubs` setting is updated
- **THEN** VS Code SHALL trigger Intelephense to reindex the workspace (automatic via configuration change event)
- **AND** stub files SHALL become available for IntelliSense within a few seconds

### Requirement: Gitignore Management
The extension SHALL automatically add the stub directory to the workspace's `.gitignore` file to prevent accidental version control commits.

#### Scenario: Update existing .gitignore
- **WHEN** stub directory is created
- **AND** a `.gitignore` file exists in the workspace root
- **THEN** the extension SHALL append `.vscode/kirby-stubs/` to the `.gitignore` file
- **AND** avoid adding duplicate entries if the pattern already exists

#### Scenario: Create .gitignore if missing
- **WHEN** stub directory is created
- **AND** no `.gitignore` file exists in the workspace root
- **THEN** the extension SHALL create a new `.gitignore` file
- **AND** add `.vscode/kirby-stubs/` as the first entry

#### Scenario: Gitignore update failure
- **WHEN** `.gitignore` update fails (permissions error, etc.)
- **THEN** the extension SHALL log a warning to the output channel
- **AND** NOT block activation or display user-facing errors

### Requirement: Configuration Settings
The extension SHALL provide configuration settings to control API IntelliSense behavior and allow customization.

#### Scenario: Enable/disable master toggle
- **WHEN** user sets `kirby.enableApiIntelliSense` to false
- **THEN** the extension SHALL skip all stub initialization logic on activation
- **AND** not copy stub files or update Intelephense configuration

#### Scenario: Kirby version selection
- **WHEN** user sets `kirby.kirbyVersion` to a specific version (e.g., "4.0", "4.1")
- **THEN** the extension SHALL use stub files corresponding to that version
- **AND** in initial implementation (v0.4.0), only version "4.0" is supported

#### Scenario: Custom stub path
- **WHEN** user sets `kirby.customStubsPath` to a non-empty directory path
- **THEN** the extension SHALL copy stub files from the custom path instead of bundled stubs
- **AND** validate the custom path exists and contains valid PHP files
- **AND** display an error if the custom path is invalid

### Requirement: API IntelliSense in PHP Files
The extension SHALL enable intelligent autocompletion, hover documentation, and signature help for Kirby API classes and methods in PHP files.

#### Scenario: Method autocompletion
- **WHEN** user types `$page->` in a PHP template or snippet file
- **AND** Intelephense is active with Kirby stubs indexed
- **THEN** VS Code SHALL display a completion list with Kirby Page methods (title(), children(), parent(), etc.)
- **AND** each completion item SHALL include method signature and description from PHPDoc

#### Scenario: Hover documentation
- **WHEN** user hovers over a Kirby method call (e.g., `$page->title()`)
- **THEN** VS Code SHALL display a hover tooltip with:
  - Method signature
  - Description from PHPDoc
  - Link to official Kirby documentation (if present in stub)

#### Scenario: Method chaining support
- **WHEN** user types `$page->children()->first()->` in a PHP file
- **THEN** VS Code SHALL infer the return type of each method in the chain
- **AND** provide accurate completions for the final method call context

#### Scenario: Signature help for parameters
- **WHEN** user types `$page->find(` and triggers parameter hints (e.g., Ctrl+Shift+Space)
- **THEN** VS Code SHALL display parameter information from the stub's PHPDoc `@param` annotations

### Requirement: Stub Cleanup Commands
The extension SHALL provide commands to manage stub files for troubleshooting and cleanup purposes.

#### Scenario: Remove API stubs command
- **WHEN** user executes "Kirby: Remove API Stubs" command
- **THEN** the extension SHALL delete the `.vscode/kirby-stubs/` directory and all its contents
- **AND** remove `.vscode/kirby-stubs` from the `intelephense.stubs` setting in workspace configuration
- **AND** display a confirmation message

#### Scenario: Reinstall API stubs command
- **WHEN** user executes "Kirby: Reinstall API Stubs" command
- **THEN** the extension SHALL delete existing `.vscode/kirby-stubs/` directory (if present)
- **AND** re-copy stub files from bundled sources
- **AND** update Intelephense configuration
- **AND** display a success message

### Requirement: Error Handling and Logging
The extension SHALL provide clear error messages and diagnostic logging for stub-related operations.

#### Scenario: Output channel logging
- **WHEN** stub initialization or configuration operations occur
- **THEN** the extension SHALL log detailed information to the "Kirby Toolkit" output channel
- **AND** include timestamps and operation status (success/failure)

#### Scenario: User-facing error messages
- **WHEN** a critical error occurs (e.g., file system failure)
- **THEN** the extension SHALL display a user-friendly error notification
- **AND** provide actionable troubleshooting steps
- **AND** include a link to the output channel for detailed logs
