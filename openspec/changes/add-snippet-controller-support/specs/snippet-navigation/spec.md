## MODIFIED Requirements

### Requirement: Snippet Call Detection

The extension SHALL detect `snippet()` function calls in PHP template, snippet, and snippet controller files.

#### Scenario: Simple snippet call

- **WHEN** a PHP file contains `snippet('header')`
- **THEN** the extension SHALL identify 'header' as a snippet reference

#### Scenario: Snippet call with data parameter

- **WHEN** a PHP file contains `snippet('header', ['title' => 'Welcome'])`
- **THEN** the extension SHALL identify 'header' as a snippet reference, ignoring the data parameter

#### Scenario: Double-quoted snippet name

- **WHEN** a PHP file contains `snippet("header")`
- **THEN** the extension SHALL identify "header" as a snippet reference

#### Scenario: Snippet call in controller file

- **WHEN** a snippet controller file contains `snippet('footer')`
- **THEN** the extension SHALL identify 'footer' as a snippet reference

### Requirement: CodeLens Provider

The extension SHALL provide clickable CodeLens links above `snippet()` calls for navigation to snippets and their controllers.

#### Scenario: CodeLens displayed for snippet

- **WHEN** a template or snippet file contains a `snippet()` call
- **THEN** a CodeLens link labeled "Open Snippet" SHALL appear above the function call

#### Scenario: CodeLens with controller available

- **WHEN** a `snippet()` call references a snippet that has an associated controller file
- **THEN** two CodeLens links SHALL appear: "Open Snippet" and "Open Controller"

#### Scenario: CodeLens clicked for snippet

- **WHEN** a user clicks the "Open Snippet" CodeLens
- **THEN** the corresponding snippet file SHALL open in the editor

#### Scenario: CodeLens clicked for controller

- **WHEN** a user clicks the "Open Controller" CodeLens
- **THEN** the corresponding snippet controller file SHALL open in the editor

#### Scenario: Snippet file not found

- **WHEN** a user clicks the CodeLens for a non-existent snippet
- **THEN** VS Code SHALL display an error notification: "Snippet file not found: snippets/{name}.php"

#### Scenario: Controller file not found

- **WHEN** a user clicks the CodeLens for a non-existent controller
- **THEN** VS Code SHALL display an error notification: "Snippet controller not found: snippets/{name}.controller.php"

### Requirement: Definition Provider

The extension SHALL provide Go-to-Definition support for `snippet()` calls to both snippet files and controller files.

#### Scenario: Ctrl+Click navigation to snippet

- **WHEN** a user Ctrl+Clicks (or Cmd+Clicks on macOS) on the snippet name in a `snippet()` call
- **THEN** the editor SHALL navigate to the corresponding snippet file

#### Scenario: F12 Go-to-Definition with multiple targets

- **WHEN** a user places the cursor on a snippet name and presses F12, and both snippet and controller files exist
- **THEN** VS Code SHALL display a "Go to Definition" menu with both the snippet file and controller file as options

#### Scenario: Peek Definition with controller

- **WHEN** a user places the cursor on a snippet name and invokes "Peek Definition", and a controller exists
- **THEN** VS Code SHALL display both the snippet file and controller file content in peek windows

### Requirement: Snippet File Resolution

The extension SHALL resolve snippet names to both snippet file paths and controller file paths in the Kirby project structure.

#### Scenario: Resolve snippet and controller

- **WHEN** a snippet call references 'header' and both `header.php` and `header.controller.php` exist
- **THEN** the extension SHALL resolve to both `site/snippets/header.php` and `site/snippets/header.controller.php`

#### Scenario: Resolve snippet only

- **WHEN** a snippet call references 'footer' and only `footer.php` exists
- **THEN** the extension SHALL resolve only to `site/snippets/footer.php`

#### Scenario: Nested snippet with controller

- **WHEN** a snippet call references 'partials/menu' and both files exist
- **THEN** the extension SHALL resolve to both `site/snippets/partials/menu.php` and `site/snippets/partials/menu.controller.php`

### Requirement: Workspace Detection

The extension SHALL detect Kirby project structure and Snippet Controller plugin presence in the workspace.

#### Scenario: Kirby project with Snippet Controller plugin

- **WHEN** the workspace contains a `site/snippets/` directory and the Snippet Controller plugin is detected
- **THEN** the extension SHALL activate all snippet navigation features including controller support

#### Scenario: Kirby project without Snippet Controller plugin

- **WHEN** the workspace contains a `site/snippets/` directory but the Snippet Controller plugin is not detected
- **THEN** the extension SHALL activate standard snippet navigation features without controller support

#### Scenario: Non-Kirby project

- **WHEN** the workspace does not contain a `site/` directory
- **THEN** the extension SHALL NOT provide snippet navigation features

### Requirement: Configuration

The extension SHALL allow users to configure snippet navigation behavior including controller features.

#### Scenario: Disable CodeLens

- **WHEN** a user sets `kirby.showSnippetCodeLens` to `false`
- **THEN** the extension SHALL NOT display CodeLens links for snippet calls or controllers

#### Scenario: Disable controller support

- **WHEN** a user sets `kirby.enableSnippetControllers` to `false`
- **THEN** the extension SHALL NOT provide controller-specific navigation features, even if the plugin is detected

#### Scenario: Enable only Definition Provider

- **WHEN** a user disables CodeLens but leaves Definition Provider enabled
- **THEN** Ctrl+Click and F12 navigation SHALL still work for both snippets and controllers without CodeLens visual indicators

## ADDED Requirements

### Requirement: Snippet Controller File Type Detection

The extension SHALL detect whether a PHP file is a snippet controller based on its location and naming pattern.

#### Scenario: File in snippets directory with controller suffix

- **WHEN** a PHP file is located at `site/snippets/**/*.controller.php`
- **THEN** the extension SHALL recognize it as a Kirby snippet controller

#### Scenario: Regular snippet file

- **WHEN** a PHP file is located at `site/snippets/**/*.php` but does not end with `.controller.php`
- **THEN** the extension SHALL recognize it as a regular snippet, not a controller

#### Scenario: Controller outside snippets directory

- **WHEN** a PHP file ends with `.controller.php` but is located outside `site/snippets/`
- **THEN** the extension SHALL NOT recognize it as a snippet controller
