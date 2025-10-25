## ADDED Requirements

### Requirement: Command Registration

The extension SHALL register a "Kirby: Extract to Snippet" command accessible via the Command Palette and context menu.

#### Scenario: Command in Command Palette

- **WHEN** a user opens the Command Palette in a PHP template or snippet file
- **THEN** the command "Kirby: Extract to Snippet" SHALL be available

#### Scenario: Command in editor context menu

- **WHEN** a user right-clicks on selected code in a PHP template or snippet file
- **THEN** the context menu SHALL include "Kirby: Extract to Snippet" option

#### Scenario: No selection

- **WHEN** user executes the command without any text selected
- **THEN** the extension SHALL display an error: "Please select code to extract into a snippet"

### Requirement: Selection Validation

The extension SHALL validate the selected code before extraction.

#### Scenario: Valid PHP/HTML selection

- **WHEN** user selects valid PHP or HTML code
- **THEN** the extension SHALL proceed to snippet name input

#### Scenario: Empty selection

- **WHEN** user has zero characters selected
- **THEN** the extension SHALL abort and display an error message

#### Scenario: Selection length limit

- **WHEN** user selects more than 100KB of code
- **THEN** the extension SHALL display a warning: "Selection is very large (>100KB). Are you sure you want to extract this to a snippet?"

#### Scenario: Unbalanced brackets warning

- **WHEN** user selects code with unbalanced `{`, `}`, `(`, `)`, `[`, or `]` characters
- **THEN** the extension SHALL display a warning: "Selection may contain unbalanced brackets. The extracted snippet may not work correctly."

### Requirement: Snippet Name Input

The extension SHALL prompt the user for a snippet name and validate the input.

#### Scenario: Valid snippet name

- **WHEN** user enters "header" as the snippet name
- **THEN** the extension SHALL accept the name and proceed to file creation

#### Scenario: Invalid characters in name

- **WHEN** user enters a name containing `..`, `/`, `\`, or special characters
- **THEN** the extension SHALL display an error: "Invalid snippet name. Use only letters, numbers, hyphens, and underscores."

#### Scenario: Empty name input

- **WHEN** user submits an empty name or cancels the prompt
- **THEN** the extension SHALL abort the extraction without modifying files

#### Scenario: Nested snippet path

- **WHEN** user enters "partials/header" as the snippet name
- **THEN** the extension SHALL accept the name and create `site/snippets/partials/header.php`

### Requirement: Snippet File Creation

The extension SHALL create a new snippet file with the extracted code.

#### Scenario: Basic snippet extraction

- **WHEN** extracting code to a snippet named "header"
- **THEN** the extension SHALL create `site/snippets/header.php` containing the selected code

#### Scenario: Nested directory creation

- **WHEN** extracting code to a snippet named "partials/menu"
- **THEN** the extension SHALL create the `site/snippets/partials/` directory if it doesn't exist before writing the file

#### Scenario: Existing snippet file

- **WHEN** a snippet file with the given name already exists
- **THEN** the extension SHALL display an error: "Snippet 'header' already exists. Please choose a different name." and abort the operation

#### Scenario: Type hints in snippet

- **WHEN** the user setting `kirby.autoInjectTypeHints` is `true` and the extracted code doesn't already include type hints
- **THEN** the extension SHALL prepend PHPDoc type hints to the snippet file

### Requirement: Original Code Replacement

The extension SHALL replace the selected code with a `snippet()` call in the original file.

#### Scenario: Simple replacement

- **WHEN** extracting selected code to a snippet named "header"
- **THEN** the extension SHALL replace the selection with `<?php snippet('header') ?>`

#### Scenario: Nested snippet replacement

- **WHEN** extracting code to a snippet named "partials/menu"
- **THEN** the extension SHALL replace the selection with `<?php snippet('partials/menu') ?>`

#### Scenario: Preserve indentation

- **WHEN** the selected code has leading whitespace indentation
- **THEN** the replacement `snippet()` call SHALL maintain the same indentation level

#### Scenario: PHP context detection

- **WHEN** the selection is already within a `<?php ... ?>` block
- **THEN** the replacement SHALL use `snippet('name')` without additional PHP tags

### Requirement: Atomic Operation

The extension SHALL ensure both file creation and code replacement succeed or both fail.

#### Scenario: Successful extraction

- **WHEN** both snippet file creation and code replacement succeed
- **THEN** the extension SHALL display a success notification: "Extracted to snippet 'header'"

#### Scenario: File creation failure

- **WHEN** snippet file creation fails (e.g., permission error)
- **THEN** the extension SHALL NOT modify the original file and SHALL display an error message

#### Scenario: Undo support

- **WHEN** user performs an extraction operation
- **THEN** the user SHALL be able to undo both file creation and code replacement with a single Undo action (Ctrl+Z)

### Requirement: Success Notification

The extension SHALL provide feedback on successful extraction.

#### Scenario: Basic notification

- **WHEN** extraction completes successfully
- **THEN** the extension SHALL display a notification: "Extracted to snippet 'header'"

#### Scenario: Notification action

- **WHEN** the success notification is displayed
- **THEN** it SHALL include an "Open Snippet" button that opens the newly created snippet file

### Requirement: Security Validation

The extension SHALL validate all file paths to prevent security vulnerabilities.

#### Scenario: Path traversal attempt

- **WHEN** user enters a snippet name containing `../` or `..\`
- **THEN** the extension SHALL reject the input using the existing `resolveSnippetPath()` validation

#### Scenario: Absolute path attempt

- **WHEN** user enters an absolute path as the snippet name
- **THEN** the extension SHALL reject the input and display an error message

#### Scenario: Directory boundary validation

- **WHEN** creating the snippet file
- **THEN** the extension SHALL ensure the resolved path is within `site/snippets/` directory

### Requirement: Configuration

The extension SHALL allow users to configure snippet extraction behavior.

#### Scenario: Disable auto type hints

- **WHEN** user sets `kirby.autoInjectTypeHints` to `false`
- **THEN** extracted snippets SHALL NOT include PHPDoc type hints

#### Scenario: Default snippet directory

- **WHEN** user configures `kirby.defaultSnippetDirectory` to "components"
- **THEN** extracted snippets SHALL be created in `site/snippets/components/` by default unless user specifies a different path
