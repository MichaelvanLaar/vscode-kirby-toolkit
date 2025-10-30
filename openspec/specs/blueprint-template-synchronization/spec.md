# blueprint-template-synchronization Specification

## Purpose
TBD - created by archiving change add-blueprint-template-sync. Update Purpose after archive.
## Requirements
### Requirement: Blueprint to Template Name Mapping
The extension SHALL implement deterministic mapping between Blueprint file paths and corresponding Template file names following Kirby CMS conventions.

#### Scenario: Flat Blueprint structure
- **WHEN** a Blueprint file `site/blueprints/pages/article.yml` is created
- **THEN** the corresponding Template SHALL be mapped to `site/templates/article.php`

#### Scenario: Nested Blueprint structure
- **WHEN** a Blueprint file `site/blueprints/pages/blog/post.yml` is created
- **THEN** the corresponding Template SHALL be mapped to `site/templates/blog.post.php` (dot notation)

#### Scenario: Template to Blueprint reverse mapping
- **WHEN** a Template file `site/templates/product.php` is created
- **THEN** the corresponding Blueprint SHALL be mapped to `site/blueprints/pages/product.yml`

#### Scenario: Nested Template reverse mapping
- **WHEN** a Template file `site/templates/shop.product.php` is created
- **THEN** the corresponding Blueprint SHALL be mapped to `site/blueprints/pages/shop/product.yml` (nested directory)

### Requirement: File Creation Detection
The extension SHALL monitor file creation events in Blueprint and Template directories using VS Code's FileSystemWatcher API.

#### Scenario: Blueprint file created
- **WHEN** a new YAML file is created in `**/site/blueprints/pages/` (or subdirectories)
- **THEN** the extension SHALL detect the creation event within 500ms

#### Scenario: Template file created
- **WHEN** a new PHP file is created in `**/site/templates/`
- **THEN** the extension SHALL detect the creation event within 500ms

#### Scenario: File created via git operation
- **WHEN** files are created via `git checkout` or `git merge` commands
- **THEN** the extension SHALL detect these creation events
- **AND** apply debounce logic to avoid multiple simultaneous prompts

#### Scenario: File created in ignored folder
- **WHEN** a Blueprint/Template is created in a folder listed in `kirby.syncIgnoreFolders` setting
- **THEN** the extension SHALL NOT trigger synchronization detection

### Requirement: Counterpart File Detection
The extension SHALL check whether a corresponding Blueprint or Template file exists when a new file is created.

#### Scenario: Blueprint created without matching Template
- **WHEN** a Blueprint `article.yml` is created
- **AND** no corresponding Template `article.php` exists in `site/templates/`
- **THEN** the extension SHALL identify this as a synchronization opportunity

#### Scenario: Template created without matching Blueprint
- **WHEN** a Template `product.php` is created
- **AND** no corresponding Blueprint `product.yml` exists in `site/blueprints/pages/`
- **THEN** the extension SHALL identify this as a synchronization opportunity

#### Scenario: Both files already exist
- **WHEN** a Blueprint is created and a matching Template already exists
- **THEN** the extension SHALL NOT trigger any synchronization prompts

### Requirement: Synchronization Prompt Display
The extension SHALL display an information notification with action buttons when a file mismatch is detected.

#### Scenario: Prompt for missing Template
- **WHEN** a Blueprint is created without a matching Template
- **AND** `kirby.syncPromptBehavior` is set to "ask" (default)
- **THEN** the extension SHALL display a notification:
  - Message: "📄 Blueprint '{name}.yml' created without a template. Create '{name}.php'?"
  - Action buttons: [Create Template] [Create Template + Controller + Model] [Don't ask again] [Dismiss]

#### Scenario: Prompt for missing Blueprint
- **WHEN** a Template is created without a matching Blueprint
- **AND** `kirby.syncPromptBehavior` is set to "ask"
- **THEN** the extension SHALL display a notification:
  - Message: "📄 Template '{name}.php' created without a blueprint. Create '{name}.yml'?"
  - Action buttons: [Create Blueprint] [Don't ask again] [Dismiss]

#### Scenario: Never prompt behavior
- **WHEN** `kirby.syncPromptBehavior` is set to "never"
- **THEN** the extension SHALL NOT display any synchronization prompts

#### Scenario: Always create behavior
- **WHEN** `kirby.syncPromptBehavior` is set to "always"
- **THEN** the extension SHALL automatically create the missing file without prompting
- **AND** display a success notification

### Requirement: Template File Creation from Blueprint
The extension SHALL generate a new Template file with appropriate boilerplate content when requested by the user.

#### Scenario: Create Template only
- **WHEN** user clicks [Create Template] button in the synchronization prompt
- **THEN** the extension SHALL create a new PHP file at the mapped Template path
- **AND** populate it with boilerplate content including type-hint injection block
- **AND** display a success notification with "Open File" action

#### Scenario: Create Template with Controller and Model
- **WHEN** user clicks [Create Template + Controller + Model] button
- **THEN** the extension SHALL create:
  - Template file at `site/templates/{name}.php`
  - Controller file at `site/controllers/{name}.php`
  - Model file at `site/models/{PageClass}Page.php` (PascalCase)
- **AND** populate each file with appropriate boilerplate content
- **AND** display a success notification listing all created files

#### Scenario: File already exists
- **WHEN** Template creation is triggered and the file already exists
- **THEN** the extension SHALL NOT overwrite the existing file
- **AND** display an error notification: "Template already exists"

#### Scenario: File creation failure
- **WHEN** Template creation fails due to permissions or disk errors
- **THEN** the extension SHALL display an error notification with the failure reason
- **AND** log detailed error information to the output channel

### Requirement: Blueprint File Creation from Template
The extension SHALL generate a new Blueprint file with basic YAML structure when requested by the user.

#### Scenario: Create Blueprint from Template
- **WHEN** user clicks [Create Blueprint] button in the synchronization prompt
- **THEN** the extension SHALL create a new YAML file at the mapped Blueprint path
- **AND** populate it with basic Blueprint structure:
  ```yaml
  title: {PageTypeName}

  fields:
    content:
      type: fields
      fields:
        # Add your fields here
  ```
- **AND** display a success notification with "Open File" action

#### Scenario: Nested Blueprint creation
- **WHEN** creating a Blueprint for `blog.post.php` template
- **THEN** the extension SHALL create nested directory structure `site/blueprints/pages/blog/`
- **AND** create `post.yml` inside the `blog/` directory

### Requirement: Debounce and Rate Limiting
The extension SHALL implement debouncing to prevent notification spam during bulk file operations.

#### Scenario: Multiple rapid file creations
- **WHEN** multiple Blueprint/Template files are created within 500ms (e.g., git checkout)
- **THEN** the extension SHALL debounce detection events
- **AND** process only the final event after the 500ms quiet period

#### Scenario: Concurrent notifications
- **WHEN** multiple synchronization prompts would be triggered simultaneously
- **THEN** the extension SHALL queue prompts and display only one active notification at a time
- **AND** show subsequent prompts after the first is dismissed or acted upon

### Requirement: User Preference Persistence
The extension SHALL remember user preferences for dismissing synchronization prompts using VS Code's workspace state API.

#### Scenario: Don't ask again for specific file
- **WHEN** user clicks [Don't ask again] button for a Blueprint/Template pair
- **THEN** the extension SHALL store this preference in workspace state
- **AND** NOT display synchronization prompts for this file pair in the future
- **AND** persist the preference across VS Code restarts

#### Scenario: Reset dismissed prompts
- **WHEN** user executes "Kirby: Reset Sync Prompts" command
- **THEN** the extension SHALL clear all "Don't ask again" preferences from workspace state
- **AND** display a confirmation message
- **AND** resume showing synchronization prompts for all files

#### Scenario: Dismiss once
- **WHEN** user clicks [Dismiss] button (without "Don't ask again")
- **THEN** the extension SHALL close the notification
- **AND** NOT store any persistent state
- **AND** may show the prompt again on next activation if file still has no counterpart

### Requirement: Configuration Settings
The extension SHALL provide configuration settings to control synchronization behavior.

#### Scenario: Disable synchronization feature
- **WHEN** user sets `kirby.enableBlueprintTemplateSync` to false
- **THEN** the extension SHALL NOT initialize file system watchers
- **AND** NOT detect or prompt for file synchronization

#### Scenario: Auto-create without prompting
- **WHEN** user sets `kirby.syncPromptBehavior` to "always"
- **THEN** the extension SHALL automatically create missing counterpart files
- **AND** use default settings for Controller/Model creation (from `kirby.syncCreateController` and `kirby.syncCreateModel`)

#### Scenario: Default Controller creation
- **WHEN** user sets `kirby.syncCreateController` to true
- **AND** Template synchronization is triggered
- **THEN** the extension SHALL include Controller creation in the default action

#### Scenario: Default Model creation
- **WHEN** user sets `kirby.syncCreateModel` to true
- **AND** Template synchronization is triggered
- **THEN** the extension SHALL include Model creation in the default action

#### Scenario: Ignore specific folders
- **WHEN** user sets `kirby.syncIgnoreFolders` to `["test/", "archive/"]`
- **AND** a Blueprint is created in `site/blueprints/pages/test/example.yml`
- **THEN** the extension SHALL NOT trigger synchronization detection

### Requirement: Integration with Scaffolding Utilities
The extension SHALL reuse existing scaffolding logic from the Page Type Scaffolder for consistent boilerplate generation.

#### Scenario: Reuse template content generator
- **WHEN** creating a Template file via synchronization prompt
- **THEN** the extension SHALL use the same `generateTemplateContent()` function used by the Page Type Scaffolder
- **AND** produce identical boilerplate content with type hints

#### Scenario: Reuse Blueprint content generator
- **WHEN** creating a Blueprint file via synchronization prompt
- **THEN** the extension SHALL use the same `generateBlueprintContent()` function
- **AND** produce consistent YAML structure

#### Scenario: Reuse Controller/Model generators
- **WHEN** creating Controller or Model files via synchronization prompt
- **THEN** the extension SHALL use the same utility functions as the Page Type Scaffolder
- **AND** ensure consistency across all scaffolding features

