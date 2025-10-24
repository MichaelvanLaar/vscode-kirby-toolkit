# Snippet Navigation

## ADDED Requirements

### Requirement: Snippet Call Detection

The extension SHALL detect `snippet()` function calls in PHP template and snippet files.

#### Scenario: Simple snippet call

- **WHEN** a PHP file contains `snippet('header')`
- **THEN** the extension SHALL identify 'header' as a snippet reference

#### Scenario: Snippet call with data parameter

- **WHEN** a PHP file contains `snippet('header', ['title' => 'Welcome'])`
- **THEN** the extension SHALL identify 'header' as a snippet reference, ignoring the data parameter

#### Scenario: Double-quoted snippet name

- **WHEN** a PHP file contains `snippet("header")`
- **THEN** the extension SHALL identify "header" as a snippet reference

### Requirement: CodeLens Provider

The extension SHALL provide clickable CodeLens links above `snippet()` calls for navigation.

#### Scenario: CodeLens displayed

- **WHEN** a template or snippet file contains a `snippet()` call
- **THEN** a CodeLens link labeled "Open Snippet" SHALL appear above the function call

#### Scenario: CodeLens clicked

- **WHEN** a user clicks the "Open Snippet" CodeLens
- **THEN** the corresponding snippet file SHALL open in the editor

#### Scenario: Snippet file not found

- **WHEN** a user clicks the CodeLens for a non-existent snippet
- **THEN** VS Code SHALL display an error notification: "Snippet file not found: snippets/{name}.php"

### Requirement: Definition Provider

The extension SHALL provide Go-to-Definition support for `snippet()` calls.

#### Scenario: Ctrl+Click navigation

- **WHEN** a user Ctrl+Clicks (or Cmd+Clicks on macOS) on the snippet name in a `snippet()` call
- **THEN** the editor SHALL navigate to the corresponding snippet file

#### Scenario: F12 Go-to-Definition

- **WHEN** a user places the cursor on a snippet name and presses F12
- **THEN** the editor SHALL navigate to the corresponding snippet file

#### Scenario: Peek Definition

- **WHEN** a user places the cursor on a snippet name and invokes "Peek Definition"
- **THEN** VS Code SHALL display the snippet file content in a peek window

### Requirement: Snippet File Resolution

The extension SHALL resolve snippet names to file paths in the Kirby project structure.

#### Scenario: Top-level snippet

- **WHEN** a snippet call references 'header'
- **THEN** the extension SHALL resolve it to `site/snippets/header.php`

#### Scenario: Nested snippet

- **WHEN** a snippet call references 'partials/menu'
- **THEN** the extension SHALL resolve it to `site/snippets/partials/menu.php`

#### Scenario: Custom snippets directory

- **WHEN** a Kirby project uses a custom snippets directory configured in `config.php`
- **THEN** the extension SHOULD resolve snippets from the custom directory (future enhancement, not MVP)

### Requirement: Workspace Detection

The extension SHALL detect Kirby project structure in the workspace.

#### Scenario: Kirby project detected

- **WHEN** the workspace contains a `site/snippets/` directory
- **THEN** the extension SHALL activate snippet navigation features

#### Scenario: Non-Kirby project

- **WHEN** the workspace does not contain a `site/` directory
- **THEN** the extension SHALL NOT provide snippet navigation features

### Requirement: Configuration

The extension SHALL allow users to configure snippet navigation behavior.

#### Scenario: Disable CodeLens

- **WHEN** a user sets `kirby.showSnippetCodeLens` to `false`
- **THEN** the extension SHALL NOT display CodeLens links for snippet calls

#### Scenario: Enable only Definition Provider

- **WHEN** a user disables CodeLens but leaves Definition Provider enabled
- **THEN** Ctrl+Click and F12 navigation SHALL still work without CodeLens visual indicators
