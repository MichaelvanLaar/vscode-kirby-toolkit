## ADDED Requirements

### Requirement: Template to Controller Navigation

The extension SHALL provide navigation from template files to corresponding controller files.

#### Scenario: Controller file exists

- **WHEN** a template file `site/templates/project.php` is open and `site/controllers/project.php` exists
- **THEN** the extension SHALL provide a "Go to Definition" action that navigates to the controller file

#### Scenario: Controller not found

- **WHEN** a template file has no corresponding controller file
- **THEN** the extension SHALL not provide controller navigation for that template

#### Scenario: CodeLens for controller

- **WHEN** a template file has a corresponding controller
- **THEN** the extension SHALL display a CodeLens on line 1: "Open Controller"

### Requirement: Template to Model Navigation

The extension SHALL provide navigation from template files to corresponding model files.

#### Scenario: Model file exists

- **WHEN** a template file `site/templates/project.php` is open and `site/models/project.php` exists
- **THEN** the extension SHALL provide a "Go to Definition" action that navigates to the model file

#### Scenario: Model not found

- **WHEN** a template file has no corresponding model file
- **THEN** the extension SHALL not provide model navigation for that template

#### Scenario: CodeLens for model

- **WHEN** a template file has a corresponding model
- **THEN** the extension SHALL display a CodeLens on line 1: "Open Model"

### Requirement: Controller to Template Navigation

The extension SHALL provide bidirectional navigation from controller files back to templates.

#### Scenario: Navigate from controller to template

- **WHEN** a controller file `site/controllers/project.php` is open
- **THEN** the extension SHALL provide a CodeLens: "Open Template" that navigates to `site/templates/project.php`

#### Scenario: Template not found

- **WHEN** a controller file has no corresponding template file (orphaned controller)
- **THEN** the extension SHALL display a warning CodeLens: "Template not found"

### Requirement: Model to Template Navigation

The extension SHALL provide bidirectional navigation from model files back to templates.

#### Scenario: Navigate from model to template

- **WHEN** a model file `site/models/article.php` is open
- **THEN** the extension SHALL provide a CodeLens: "Open Template" that navigates to `site/templates/article.php`

#### Scenario: Template not found

- **WHEN** a model file has no corresponding template file (orphaned model)
- **THEN** the extension SHALL display a warning CodeLens: "Template not found"

### Requirement: Multi-Target Navigation

The extension SHALL support navigation to multiple related files from a single source.

#### Scenario: Template with controller and model

- **WHEN** a template file has both controller and model files
- **THEN** the extension SHALL display two CodeLens links: "Open Controller" and "Open Model"

#### Scenario: Go to Definition with multiple targets

- **WHEN** user triggers "Go to Definition" (F12) on a template file name with multiple related files
- **THEN** VS Code SHALL display a peek window with all available navigation targets (controller, model)

### Requirement: File Name Resolution

The extension SHALL correctly resolve related files following Kirby naming conventions.

#### Scenario: Standard naming convention

- **WHEN** a template is named `project.php`
- **THEN** the extension SHALL look for `project.php` in controllers and models directories

#### Scenario: Hyphenated names

- **WHEN** a template is named `blog-post.php`
- **THEN** the extension SHALL look for `blog-post.php` in controllers and models directories

#### Scenario: Model class name detection

- **WHEN** a model file contains a class with custom naming (not following standard convention)
- **THEN** the extension SHALL still resolve based on file name, not class name

### Requirement: Configuration

The extension SHALL allow users to configure extended navigation behavior.

#### Scenario: Disable controller navigation

- **WHEN** user sets `kirby.showControllerNavigation` to `false`
- **THEN** the extension SHALL NOT display CodeLens or provide navigation to controller files

#### Scenario: Disable model navigation

- **WHEN** user sets `kirby.showModelNavigation` to `false`
- **THEN** the extension SHALL NOT display CodeLens or provide navigation to model files

#### Scenario: Unified CodeLens setting

- **WHEN** user sets `kirby.showSnippetCodeLens` to `false`
- **THEN** all CodeLens features (snippets, controllers, models) SHALL be disabled

## MODIFIED Requirements

### Requirement: CodeLens Provider

The extension SHALL provide clickable CodeLens links above `snippet()` calls and related files for navigation.

#### Scenario: CodeLens displayed

- **WHEN** a template or snippet file contains a `snippet()` call
- **THEN** a CodeLens link labeled "Open Snippet" SHALL appear above the function call

#### Scenario: CodeLens for related files

- **WHEN** a template file has related controller or model files
- **THEN** CodeLens links labeled "Open Controller" and/or "Open Model" SHALL appear on line 1

#### Scenario: CodeLens clicked

- **WHEN** a user clicks any navigation CodeLens
- **THEN** the corresponding file SHALL open in the editor

#### Scenario: Snippet file not found

- **WHEN** a user clicks the CodeLens for a non-existent snippet
- **THEN** VS Code SHALL display an error notification: "Snippet file not found: snippets/{name}.php"

#### Scenario: Controller/Model file not found

- **WHEN** a user clicks a CodeLens for a non-existent controller or model
- **THEN** VS Code SHALL display an error notification: "Controller/Model file not found: controllers/{name}.php"
