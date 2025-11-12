## ADDED Requirements

### Requirement: Snippet-Controller Navigation

The extension SHALL provide bidirectional navigation between snippet files and their controller files.

#### Scenario: Navigate from snippet to controller via Definition Provider

- **WHEN** a user opens a snippet file `site/snippets/header.php` and invokes Go-to-Definition (F12)
- **THEN** the extension SHALL navigate to `site/snippets/header.controller.php` if it exists

#### Scenario: Navigate from controller to snippet via Definition Provider

- **WHEN** a user opens a controller file `site/snippets/header.controller.php` and invokes Go-to-Definition (F12)
- **THEN** the extension SHALL navigate to `site/snippets/header.php` if it exists

#### Scenario: Multiple navigation targets

- **WHEN** a user invokes Go-to-Definition from a snippet file that has a controller
- **THEN** VS Code SHALL display the controller file as a navigation target

#### Scenario: No controller exists

- **WHEN** a user invokes Go-to-Definition from a snippet file without a controller
- **THEN** the extension SHALL not provide any navigation targets (standard VS Code behavior)

### Requirement: Snippet-Controller CodeLens

The extension SHALL provide CodeLens links for navigating between snippet files and their controllers.

#### Scenario: CodeLens in snippet file

- **WHEN** a snippet file is opened and a corresponding controller file exists
- **THEN** a CodeLens link labeled "Open Controller" SHALL appear at the top of the snippet file

#### Scenario: CodeLens in controller file

- **WHEN** a controller file is opened and a corresponding snippet file exists
- **THEN** a CodeLens link labeled "Open Snippet" SHALL appear at the top of the controller file

#### Scenario: Click CodeLens to open controller

- **WHEN** a user clicks the "Open Controller" CodeLens in a snippet file
- **THEN** the corresponding controller file SHALL open in the editor

#### Scenario: Click CodeLens to open snippet

- **WHEN** a user clicks the "Open Snippet" CodeLens in a controller file
- **THEN** the corresponding snippet file SHALL open in the editor

#### Scenario: Nested snippet navigation

- **WHEN** a nested snippet file `site/snippets/partials/menu.php` is opened
- **THEN** the CodeLens SHALL navigate to `site/snippets/partials/menu.controller.php` if it exists

#### Scenario: No CodeLens when controller missing

- **WHEN** a snippet file is opened without a corresponding controller
- **THEN** no "Open Controller" CodeLens SHALL be displayed

#### Scenario: No CodeLens when snippet missing

- **WHEN** a controller file is opened without a corresponding snippet
- **THEN** no "Open Snippet" CodeLens SHALL be displayed

### Requirement: File Path Resolution for Navigation

The extension SHALL correctly resolve paths between snippet files and their controllers.

#### Scenario: Resolve controller from snippet

- **WHEN** given a snippet path `site/snippets/header.php`
- **THEN** the extension SHALL resolve the controller path to `site/snippets/header.controller.php`

#### Scenario: Resolve snippet from controller

- **WHEN** given a controller path `site/snippets/header.controller.php`
- **THEN** the extension SHALL resolve the snippet path to `site/snippets/header.php`

#### Scenario: Nested file resolution

- **WHEN** given a nested snippet path `site/snippets/partials/menu.php`
- **THEN** the extension SHALL resolve the controller path to `site/snippets/partials/menu.controller.php`

### Requirement: Configuration for Snippet-Controller Navigation

The extension SHALL allow users to configure snippet-controller navigation behavior.

#### Scenario: Disable snippet-controller CodeLens

- **WHEN** a user sets `kirby.showFileNavigationCodeLens` to `false`
- **THEN** the extension SHALL NOT display CodeLens links for snippet-controller navigation

#### Scenario: Disable all controller features

- **WHEN** a user sets `kirby.enableSnippetControllers` to `false`
- **THEN** the extension SHALL NOT provide any snippet-controller navigation features

#### Scenario: Definition Provider remains enabled

- **WHEN** CodeLens is disabled but `kirby.enableSnippetControllers` is `true`
- **THEN** Go-to-Definition (F12) SHALL still work for snippet-controller navigation
