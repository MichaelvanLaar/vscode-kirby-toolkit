## ADDED Requirements

### Requirement: Snippet Controller Plugin Detection

The extension SHALL detect whether the Kirby Snippet Controller plugin is installed in the workspace.

#### Scenario: Plugin detected via composer.json

- **WHEN** the workspace contains a `composer.json` file with `lukaskleinschmidt/kirby-snippet-controller` in dependencies
- **THEN** the extension SHALL enable snippet controller features

#### Scenario: Plugin detected via site/plugins directory

- **WHEN** the workspace contains a `site/plugins/kirby-snippet-controller/` directory
- **THEN** the extension SHALL enable snippet controller features

#### Scenario: Plugin not installed

- **WHEN** the Snippet Controller plugin is not detected in the workspace
- **THEN** snippet controller features SHALL remain disabled, and standard snippet navigation SHALL continue to work normally

### Requirement: Snippet Controller File Detection

The extension SHALL detect snippet controller files based on the naming convention `{snippet-name}.controller.php`.

#### Scenario: Top-level snippet controller

- **WHEN** a file `site/snippets/header.controller.php` exists
- **THEN** the extension SHALL recognize it as a snippet controller for the `header` snippet

#### Scenario: Nested snippet controller

- **WHEN** a file `site/snippets/partials/menu.controller.php` exists
- **THEN** the extension SHALL recognize it as a snippet controller for the `partials/menu` snippet

#### Scenario: Controller without corresponding snippet

- **WHEN** a controller file exists without a matching snippet file
- **THEN** the extension SHALL still recognize it as a snippet controller file for type-hint and navigation features

### Requirement: Snippet Controller Path Resolution

The extension SHALL resolve snippet names to their controller file paths.

#### Scenario: Resolve controller for top-level snippet

- **WHEN** resolving the controller for snippet 'header'
- **THEN** the extension SHALL return the path `site/snippets/header.controller.php`

#### Scenario: Resolve controller for nested snippet

- **WHEN** resolving the controller for snippet 'partials/menu'
- **THEN** the extension SHALL return the path `site/snippets/partials/menu.controller.php`

#### Scenario: Check controller existence

- **WHEN** checking if a controller exists for a snippet
- **THEN** the extension SHALL verify the controller file exists on the filesystem and return true/false accordingly
