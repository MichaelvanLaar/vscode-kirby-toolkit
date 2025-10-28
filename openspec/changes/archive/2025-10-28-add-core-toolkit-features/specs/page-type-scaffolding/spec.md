## ADDED Requirements

### Requirement: Command Registration

The extension SHALL register a "Kirby: New Page Type" command accessible via the Command Palette.

#### Scenario: Command appears in palette

- **WHEN** a user opens the Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
- **THEN** the command "Kirby: New Page Type" SHALL be available in the command list

#### Scenario: Command activated in Kirby project

- **WHEN** the workspace contains a `site/` directory and user executes the command
- **THEN** the page type scaffolding workflow SHALL start

#### Scenario: Command in non-Kirby project

- **WHEN** the workspace does not contain a `site/` directory and user executes the command
- **THEN** the extension SHALL display an error: "Not a Kirby project. Please open a Kirby workspace."

### Requirement: Interactive Name Input

The extension SHALL prompt the user for a page type name and validate the input.

#### Scenario: Valid page type name

- **WHEN** user enters "project" as the page type name
- **THEN** the extension SHALL accept the name and proceed to file selection

#### Scenario: Empty name input

- **WHEN** user submits an empty name or cancels the prompt
- **THEN** the extension SHALL abort the scaffolding operation without creating files

#### Scenario: Invalid characters in name

- **WHEN** user enters a name containing `..`, `/`, `\`, or other path traversal characters
- **THEN** the extension SHALL display an error: "Invalid name. Use only letters, numbers, hyphens, and underscores."

#### Scenario: Existing page type

- **WHEN** user enters a name that matches an existing Blueprint file (e.g., `site/blueprints/project.yml` already exists)
- **THEN** the extension SHALL display a warning: "A page type named 'project' already exists. Overwrite?" and require confirmation

### Requirement: File Selection

The extension SHALL allow users to choose which files to generate for the page type.

#### Scenario: File selection prompt

- **WHEN** user has entered a valid page type name
- **THEN** the extension SHALL display a multi-select quick pick with options: "Blueprint (Required)", "Template (Required)", "Controller (Optional)", "Model (Optional)"

#### Scenario: Required files pre-selected

- **WHEN** the file selection prompt is displayed
- **THEN** "Blueprint" and "Template" options SHALL be pre-selected and non-deselectable

#### Scenario: User selects all files

- **WHEN** user confirms selection with all four options checked
- **THEN** the extension SHALL generate Blueprint, Template, Controller, and Model files

#### Scenario: User selects only required files

- **WHEN** user confirms selection with only Blueprint and Template checked
- **THEN** the extension SHALL generate only Blueprint and Template files

### Requirement: Blueprint File Generation

The extension SHALL create a Blueprint YAML file with minimal default fields.

#### Scenario: Basic Blueprint creation

- **WHEN** scaffolding a page type named "project"
- **THEN** the extension SHALL create `site/blueprints/pages/project.yml` with content:
  ```yaml
  title: Project

  fields:
    title:
      type: text
      label: Title
    text:
      type: textarea
      label: Text
  ```

#### Scenario: Blueprint directory creation

- **WHEN** the `site/blueprints/pages/` directory does not exist
- **THEN** the extension SHALL create the directory before writing the Blueprint file

#### Scenario: Blueprint file opened

- **WHEN** the Blueprint file is successfully created
- **THEN** the extension SHALL open the file in the editor with cursor positioned at the first field

### Requirement: Template File Generation

The extension SHALL create a PHP template file with basic structural boilerplate.

#### Scenario: Basic template creation

- **WHEN** scaffolding a page type named "project"
- **THEN** the extension SHALL create `site/templates/project.php` with content:
  ```php
  <?php
  /**
   * @var \Kirby\Cms\Page $page
   * @var \Kirby\Cms\Site $site
   * @var \Kirby\Cms\App $kirby
   */
  ?>
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $page->title() ?></title>
  </head>
  <body>
    <h1><?= $page->title() ?></h1>
    <div><?= $page->text()->kirbytext() ?></div>
  </body>
  </html>
  ```

#### Scenario: Template with type hints

- **WHEN** the user setting `kirby.autoInjectTypeHints` is `true` (default)
- **THEN** the generated template SHALL include PHPDoc type hints for `$page`, `$site`, and `$kirby`

#### Scenario: Template directory creation

- **WHEN** the `site/templates/` directory does not exist
- **THEN** the extension SHALL create the directory before writing the template file

### Requirement: Controller File Generation

The extension SHALL create an empty PHP controller file when selected by the user.

#### Scenario: Basic controller creation

- **WHEN** scaffolding a page type named "project" with Controller option selected
- **THEN** the extension SHALL create `site/controllers/project.php` with content:
  ```php
  <?php

  return function ($page, $site, $kirby) {
    return [];
  };
  ```

#### Scenario: Controller directory creation

- **WHEN** the `site/controllers/` directory does not exist
- **THEN** the extension SHALL create the directory before writing the controller file

### Requirement: Model File Generation

The extension SHALL create an empty PHP model class file when selected by the user.

#### Scenario: Basic model creation

- **WHEN** scaffolding a page type named "project" with Model option selected
- **THEN** the extension SHALL create `site/models/project.php` with content:
  ```php
  <?php

  use Kirby\Cms\Page;

  class ProjectPage extends Page
  {
    // Add custom page methods here
  }
  ```

#### Scenario: Model class naming

- **WHEN** scaffolding a page type named "my-project"
- **THEN** the model class SHALL be named `MyProjectPage` (PascalCase with "Page" suffix)

#### Scenario: Model directory creation

- **WHEN** the `site/models/` directory does not exist
- **THEN** the extension SHALL create the directory before writing the model file

### Requirement: Success Notification

The extension SHALL provide feedback on successful scaffolding operations.

#### Scenario: Single file created

- **WHEN** scaffolding completes with only Blueprint and Template generated
- **THEN** the extension SHALL display a notification: "Created page type 'project' (2 files)"

#### Scenario: Multiple files created

- **WHEN** scaffolding completes with all four files generated
- **THEN** the extension SHALL display a notification: "Created page type 'project' (4 files)"

#### Scenario: Notification action

- **WHEN** the success notification is displayed
- **THEN** it SHALL include a "Open Template" button that opens the generated template file

### Requirement: Error Handling

The extension SHALL handle file creation errors gracefully.

#### Scenario: File write permission error

- **WHEN** the extension lacks write permissions for the target directory
- **THEN** the extension SHALL display an error notification with the system error message and abort the operation

#### Scenario: Partial failure recovery

- **WHEN** Blueprint creation succeeds but Template creation fails
- **THEN** the extension SHALL not delete the successfully created Blueprint file and SHALL report which files were created

### Requirement: Security Validation

The extension SHALL validate all file paths to prevent security vulnerabilities.

#### Scenario: Path traversal attempt in name

- **WHEN** user enters a name containing `../` or `..\`
- **THEN** the extension SHALL reject the input and display an error message

#### Scenario: Absolute path attempt

- **WHEN** user enters an absolute path (e.g., `/etc/passwd`)
- **THEN** the extension SHALL reject the input and display an error message

#### Scenario: Directory boundary validation

- **WHEN** validating the generated file path
- **THEN** the extension SHALL ensure all paths are within the workspace `site/` directory
