## MODIFIED Requirements

### Requirement: Automatic Type-Hint Injection on File Creation

The extension SHALL automatically inject PHPDoc type declarations for Kirby's global variables (`$page`, `$site`, `$kirby`) at the top of newly created template, snippet, and snippet controller files.

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

#### Scenario: New snippet controller file creation

- **WHEN** a user creates a new PHP file matching `site/snippets/**/*.controller.php`
- **THEN** the extension SHALL insert the PHPDoc block for Kirby global variables at position 0

#### Scenario: File already contains content

- **WHEN** a new template/snippet/controller file is created with initial content
- **THEN** the type-hint block SHALL be inserted before existing PHP code but after the opening `<?php` tag

### Requirement: Manual Type-Hint Injection Command

The extension SHALL provide a command to manually inject type-hints into existing files.

#### Scenario: Command invoked on template file

- **WHEN** a user executes the "Kirby: Add Type Hints" command in an open template or snippet file
- **THEN** the extension SHALL insert the type-hint block at the beginning of the file if not already present

#### Scenario: Command invoked on snippet controller file

- **WHEN** a user executes the "Kirby: Add Type Hints" command in an open snippet controller file
- **THEN** the extension SHALL insert the type-hint block at the beginning of the file if not already present

#### Scenario: Type-hints already exist

- **WHEN** the type-hint command is invoked on a file that already contains Kirby type-hints
- **THEN** the extension SHALL not duplicate the type-hints and SHOULD notify the user

### Requirement: File Type Detection

The extension SHALL detect whether a PHP file is a Kirby template, snippet, or snippet controller based on its location.

#### Scenario: File in templates directory

- **WHEN** a PHP file is located in `site/templates/**/*.php`
- **THEN** the extension SHALL recognize it as a Kirby template

#### Scenario: File in snippets directory

- **WHEN** a PHP file is located in `site/snippets/**/*.php`
- **THEN** the extension SHALL recognize it as a Kirby snippet

#### Scenario: Snippet controller file

- **WHEN** a PHP file is located at `site/snippets/**/*.controller.php`
- **THEN** the extension SHALL recognize it as a Kirby snippet controller

#### Scenario: File outside Kirby directories

- **WHEN** a PHP file is located outside `site/templates/` or `site/snippets/`
- **THEN** the extension SHALL NOT automatically inject type-hints

### Requirement: Configuration

The extension SHALL allow users to configure type-hint injection behavior.

#### Scenario: Disable automatic injection

- **WHEN** a user sets `kirby.autoInjectTypeHints` to `false` in VS Code settings
- **THEN** the extension SHALL NOT automatically inject type-hints on file creation

#### Scenario: Disable controller type-hints

- **WHEN** a user sets `kirby.enableSnippetControllers` to `false`
- **THEN** the extension SHALL NOT inject type-hints into snippet controller files

#### Scenario: Customize injected variables

- **WHEN** a user configures `kirby.typeHintVariables` in settings
- **THEN** the extension SHALL inject only the specified variables in the PHPDoc block

## ADDED Requirements

### Requirement: Snippet Controller Variable Detection

The extension SHALL recognize that snippet controllers may receive additional variables beyond the standard Kirby globals.

#### Scenario: Controller with snippet variables

- **WHEN** a snippet controller file is opened
- **THEN** the extension SHALL inject type-hints for `$page`, `$site`, `$kirby` by default

#### Scenario: Future enhancement note

- **WHEN** implementing future enhancements for variable detection
- **THEN** the extension SHOULD support detecting variables passed via the snippet's `data` parameter (out of scope for initial implementation)
