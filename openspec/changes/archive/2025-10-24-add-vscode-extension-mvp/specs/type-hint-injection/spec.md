# Type-Hint Injection

## ADDED Requirements

### Requirement: Automatic Type-Hint Injection on File Creation

The extension SHALL automatically inject PHPDoc type declarations for Kirby's global variables (`$page`, `$site`, `$kirby`) at the top of newly created template and snippet files.

#### Scenario: New template file creation

- **WHEN** a user creates a new PHP file in `site/templates/` or `site/snippets/`
- **THEN** the extension SHALL insert the following PHPDoc block at position 0:
  ```php
  <?php
  /**
   * @var \Kirby\Cms\Page $page
   * @var \Kirby\Cms\Site $site
   * @var \Kirby\Cms\App $kirby
   */
  ```

#### Scenario: File already contains content

- **WHEN** a new template/snippet file is created with initial content
- **THEN** the type-hint block SHALL be inserted before existing PHP code but after the opening `<?php` tag

### Requirement: Manual Type-Hint Injection Command

The extension SHALL provide a command to manually inject type-hints into existing files.

#### Scenario: Command invoked on template file

- **WHEN** a user executes the "Kirby: Add Type Hints" command in an open template or snippet file
- **THEN** the extension SHALL insert the type-hint block at the beginning of the file if not already present

#### Scenario: Type-hints already exist

- **WHEN** the type-hint command is invoked on a file that already contains Kirby type-hints
- **THEN** the extension SHALL not duplicate the type-hints and SHOULD notify the user

### Requirement: File Type Detection

The extension SHALL detect whether a PHP file is a Kirby template or snippet based on its location.

#### Scenario: File in templates directory

- **WHEN** a PHP file is located in `site/templates/**/*.php`
- **THEN** the extension SHALL recognize it as a Kirby template

#### Scenario: File in snippets directory

- **WHEN** a PHP file is located in `site/snippets/**/*.php`
- **THEN** the extension SHALL recognize it as a Kirby snippet

#### Scenario: File outside Kirby directories

- **WHEN** a PHP file is located outside `site/templates/` or `site/snippets/`
- **THEN** the extension SHALL NOT automatically inject type-hints

### Requirement: Configuration

The extension SHALL allow users to configure type-hint injection behavior.

#### Scenario: Disable automatic injection

- **WHEN** a user sets `kirby.autoInjectTypeHints` to `false` in VS Code settings
- **THEN** the extension SHALL NOT automatically inject type-hints on file creation

#### Scenario: Customize injected variables

- **WHEN** a user configures `kirby.typeHintVariables` in settings
- **THEN** the extension SHALL inject only the specified variables in the PHPDoc block
