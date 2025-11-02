## ADDED Requirements

### Requirement: Block Blueprint to Snippet Name Mapping
The extension SHALL implement deterministic mapping between Block Blueprint file paths and corresponding Block Snippet file names following Kirby CMS conventions.

#### Scenario: Flat block structure with dot notation
- **WHEN** a Block Blueprint file `site/blueprints/blocks/gallery.image.yml` is created
- **THEN** the corresponding Block Snippet SHALL be mapped to `site/snippets/blocks/gallery.image.php`

#### Scenario: Nested block structure with directories
- **WHEN** a Block Blueprint file `site/blueprints/blocks/gallery/image.yml` is created
- **THEN** the corresponding Block Snippet SHALL be mapped to `site/snippets/blocks/gallery/image.php`

#### Scenario: Auto-detect nesting strategy from existing files
- **WHEN** a Block Blueprint is created and existing block snippets use nested directories
- **THEN** the extension SHALL prefer nested directory mapping
- **AND** create the snippet in the nested structure

#### Scenario: Fallback to setting when no existing files
- **WHEN** a Block Blueprint is created in a project with no existing block snippets
- **THEN** the extension SHALL use `kirby.syncBlockNestingStrategy` setting to determine mapping
- **AND** default to "nested" structure if setting is "auto"

#### Scenario: Block snippet to blueprint reverse mapping (flat)
- **WHEN** a Block Snippet file `site/snippets/blocks/card.php` is created
- **THEN** the corresponding Block Blueprint SHALL be mapped to `site/blueprints/blocks/card.yml`

#### Scenario: Block snippet to blueprint reverse mapping (nested)
- **WHEN** a Block Snippet file `site/snippets/blocks/hero/banner.php` is created
- **THEN** the corresponding Block Blueprint SHALL be mapped to `site/blueprints/blocks/hero/banner.yml`

### Requirement: Field Blueprint to Snippet Name Mapping
The extension SHALL implement deterministic mapping between Field Blueprint file paths and corresponding Field Snippet file names following Kirby CMS conventions.

#### Scenario: Flat field structure
- **WHEN** a Field Blueprint file `site/blueprints/fields/meta.yml` is created
- **THEN** the corresponding Field Snippet SHALL be mapped to `site/snippets/fields/meta.php`

#### Scenario: Nested field structure
- **WHEN** a Field Blueprint file `site/blueprints/fields/seo/metadata.yml` is created
- **THEN** the corresponding Field Snippet SHALL be mapped to `site/snippets/fields/seo/metadata.php`

#### Scenario: Field blueprint to snippet mapping respects nesting strategy
- **WHEN** a Field Blueprint is created
- **THEN** the extension SHALL use the same auto-detection logic as blocks to determine flat vs nested mapping

### Requirement: Block File Creation Detection
The extension SHALL monitor file creation events in Block Blueprint and Block Snippet directories using VS Code's FileSystemWatcher API.

#### Scenario: Block blueprint file created
- **WHEN** a new YAML file is created in `**/site/blueprints/blocks/` (or subdirectories)
- **AND** `kirby.syncBlockSnippets` is set to true (default)
- **THEN** the extension SHALL detect the creation event within 500ms

#### Scenario: Block snippet file created
- **WHEN** a new PHP file is created in `**/site/snippets/blocks/` (or subdirectories)
- **AND** `kirby.syncBlockSnippets` is set to true
- **THEN** the extension SHALL detect the creation event within 500ms

#### Scenario: Block sync disabled
- **WHEN** `kirby.syncBlockSnippets` is set to false
- **THEN** the extension SHALL NOT initialize file system watchers for blocks
- **AND** NOT detect or prompt for block synchronization

#### Scenario: Block file created in ignored folder
- **WHEN** a Block Blueprint is created in a folder listed in `kirby.syncIgnoreFolders` setting
- **THEN** the extension SHALL NOT trigger synchronization detection

### Requirement: Field File Creation Detection
The extension SHALL monitor file creation events in Field Blueprint and Field Snippet directories when field synchronization is enabled.

#### Scenario: Field blueprint file created with sync enabled
- **WHEN** a new YAML file is created in `**/site/blueprints/fields/` (or subdirectories)
- **AND** `kirby.syncFieldSnippets` is set to true
- **THEN** the extension SHALL detect the creation event within 500ms

#### Scenario: Field sync disabled by default
- **WHEN** `kirby.syncFieldSnippets` is set to false (default)
- **THEN** the extension SHALL NOT initialize file system watchers for fields
- **AND** NOT detect or prompt for field synchronization

#### Scenario: Field file created in ignored folder
- **WHEN** a Field Blueprint is created in a folder listed in `kirby.syncIgnoreFolders` setting
- **THEN** the extension SHALL NOT trigger synchronization detection

### Requirement: Block Counterpart File Detection
The extension SHALL check whether a corresponding Block Snippet or Block Blueprint exists when a new block file is created.

#### Scenario: Block blueprint created without matching snippet
- **WHEN** a Block Blueprint `gallery.yml` is created
- **AND** no corresponding Block Snippet `gallery.php` exists in `site/snippets/blocks/`
- **THEN** the extension SHALL identify this as a synchronization opportunity

#### Scenario: Block snippet created without matching blueprint
- **WHEN** a Block Snippet `card.php` is created
- **AND** no corresponding Block Blueprint `card.yml` exists in `site/blueprints/blocks/`
- **THEN** the extension SHALL identify this as a synchronization opportunity

#### Scenario: Both block files already exist
- **WHEN** a Block Blueprint is created and a matching Block Snippet already exists
- **THEN** the extension SHALL NOT trigger any synchronization prompts

### Requirement: Field Counterpart File Detection
The extension SHALL check whether a corresponding Field Snippet exists when a new Field Blueprint is created (blueprint-first only).

#### Scenario: Field blueprint created without matching snippet
- **WHEN** a Field Blueprint `meta.yml` is created
- **AND** `kirby.syncFieldSnippets` is set to true
- **AND** no corresponding Field Snippet `meta.php` exists in `site/snippets/fields/`
- **THEN** the extension SHALL identify this as a synchronization opportunity

#### Scenario: Field snippet created without matching blueprint
- **WHEN** a Field Snippet `custom.php` is created
- **THEN** the extension SHALL NOT trigger synchronization prompts (blueprint-first only)

#### Scenario: Both field files already exist
- **WHEN** a Field Blueprint is created and a matching Field Snippet already exists
- **THEN** the extension SHALL NOT trigger any synchronization prompts

### Requirement: Block Synchronization Prompt Display
The extension SHALL display an information notification with action buttons when a block file mismatch is detected.

#### Scenario: Prompt for missing block snippet
- **WHEN** a Block Blueprint is created without a matching Block Snippet
- **AND** `kirby.syncPromptBehavior` is set to "ask" (default)
- **THEN** the extension SHALL display a notification:
  - Message: "📄 Block '{name}.yml' created without a snippet. Create '{name}.php'?"
  - Action buttons: [Create Snippet] [Don't ask again] [Dismiss]

#### Scenario: Prompt for missing block blueprint
- **WHEN** a Block Snippet is created without a matching Block Blueprint
- **AND** `kirby.syncPromptBehavior` is set to "ask"
- **THEN** the extension SHALL display a notification:
  - Message: "📄 Block snippet '{name}.php' created without a blueprint. Create '{name}.yml'?"
  - Action buttons: [Create Blueprint] [Don't ask again] [Dismiss]

#### Scenario: Auto-create block snippet without prompting
- **WHEN** `kirby.syncPromptBehavior` is set to "always"
- **AND** a Block Blueprint is created without a matching snippet
- **THEN** the extension SHALL automatically create the missing Block Snippet
- **AND** display a success notification

### Requirement: Field Synchronization Prompt Display
The extension SHALL display an information notification when a Field Blueprint is created without a matching snippet (if field sync is enabled).

#### Scenario: Prompt for missing field snippet
- **WHEN** a Field Blueprint is created without a matching Field Snippet
- **AND** `kirby.syncFieldSnippets` is set to true
- **AND** `kirby.syncPromptBehavior` is set to "ask"
- **THEN** the extension SHALL display a notification:
  - Message: "📄 Field '{name}.yml' created without a snippet. Create '{name}.php'?"
  - Action buttons: [Create Snippet] [Don't ask again] [Dismiss]

#### Scenario: Auto-create field snippet without prompting
- **WHEN** `kirby.syncPromptBehavior` is set to "always"
- **AND** `kirby.syncFieldSnippets` is set to true
- **AND** a Field Blueprint is created without a matching snippet
- **THEN** the extension SHALL automatically create the missing Field Snippet
- **AND** display a success notification

### Requirement: Block Snippet File Creation from Blueprint
The extension SHALL generate a new Block Snippet file with appropriate boilerplate content when requested by the user.

#### Scenario: Create block snippet with flat structure
- **WHEN** user clicks [Create Snippet] button for a block blueprint
- **AND** nesting strategy is "flat" or auto-detected as flat
- **THEN** the extension SHALL create a new PHP file at `site/snippets/blocks/{name}.php`
- **AND** populate it with basic block snippet boilerplate
- **AND** display a success notification with "Open File" action

#### Scenario: Create block snippet with nested structure
- **WHEN** user clicks [Create Snippet] button for a block blueprint `gallery/image.yml`
- **AND** nesting strategy is "nested" or auto-detected as nested
- **THEN** the extension SHALL create directory `site/snippets/blocks/gallery/` if needed
- **AND** create `image.php` inside the `gallery/` directory
- **AND** populate it with basic block snippet boilerplate

#### Scenario: Block snippet already exists
- **WHEN** Block Snippet creation is triggered and the file already exists
- **THEN** the extension SHALL NOT overwrite the existing file
- **AND** display an error notification: "Block snippet already exists"

#### Scenario: Block snippet creation failure
- **WHEN** Block Snippet creation fails due to permissions or disk errors
- **THEN** the extension SHALL display an error notification with the failure reason
- **AND** log detailed error information to the output channel

### Requirement: Block Blueprint File Creation from Snippet
The extension SHALL generate a new Block Blueprint file with basic YAML structure when requested by the user.

#### Scenario: Create block blueprint from snippet
- **WHEN** user clicks [Create Blueprint] button for a block snippet
- **THEN** the extension SHALL create a new YAML file at the mapped blueprint path
- **AND** populate it with basic block blueprint structure:
  ```yaml
  name: {BlockName}
  icon: block

  fields:
    # Add your fields here
  ```
- **AND** display a success notification with "Open File" action

#### Scenario: Nested block blueprint creation
- **WHEN** creating a Block Blueprint for `gallery/image.php` snippet
- **AND** nesting strategy is "nested"
- **THEN** the extension SHALL create nested directory structure `site/blueprints/blocks/gallery/`
- **AND** create `image.yml` inside the `gallery/` directory

#### Scenario: Block blueprint already exists
- **WHEN** Block Blueprint creation is triggered and the file already exists
- **THEN** the extension SHALL NOT overwrite the existing file
- **AND** display an error notification: "Block blueprint already exists"

### Requirement: Field Snippet File Creation from Blueprint
The extension SHALL generate a new Field Snippet file with appropriate boilerplate content when requested by the user (if field sync is enabled).

#### Scenario: Create field snippet from blueprint
- **WHEN** user clicks [Create Snippet] button for a field blueprint
- **AND** `kirby.syncFieldSnippets` is set to true
- **THEN** the extension SHALL create a new PHP file at the mapped snippet path
- **AND** populate it with basic field snippet boilerplate
- **AND** display a success notification with "Open File" action

#### Scenario: Nested field snippet creation
- **WHEN** creating a Field Snippet for `seo/metadata.yml` blueprint
- **AND** nesting strategy is "nested"
- **THEN** the extension SHALL create nested directory structure `site/snippets/fields/seo/`
- **AND** create `metadata.php` inside the `seo/` directory

#### Scenario: Field snippet already exists
- **WHEN** Field Snippet creation is triggered and the file already exists
- **THEN** the extension SHALL NOT overwrite the existing file
- **AND** display an error notification: "Field snippet already exists"

### Requirement: Block and Field Synchronization Settings
The extension SHALL provide configuration settings to control block and field synchronization behavior independently.

#### Scenario: Enable block synchronization
- **WHEN** user sets `kirby.syncBlockSnippets` to true (default)
- **THEN** the extension SHALL initialize file system watchers for block blueprints and snippets
- **AND** detect and prompt for block file synchronization

#### Scenario: Disable block synchronization
- **WHEN** user sets `kirby.syncBlockSnippets` to false
- **THEN** the extension SHALL NOT initialize file system watchers for blocks
- **AND** NOT detect or prompt for block synchronization

#### Scenario: Enable field synchronization (opt-in)
- **WHEN** user sets `kirby.syncFieldSnippets` to true
- **THEN** the extension SHALL initialize file system watchers for field blueprints
- **AND** detect and prompt for field snippet creation (blueprint-first only)

#### Scenario: Field synchronization disabled by default
- **WHEN** user has not explicitly configured `kirby.syncFieldSnippets`
- **THEN** the setting SHALL default to false
- **AND** field synchronization SHALL be inactive

#### Scenario: Configure nesting strategy
- **WHEN** user sets `kirby.syncBlockNestingStrategy` to "flat"
- **THEN** the extension SHALL always use dot notation for block/field mapping
- **AND** create snippets as `name.php` in flat structure

#### Scenario: Configure nested strategy
- **WHEN** user sets `kirby.syncBlockNestingStrategy` to "nested"
- **THEN** the extension SHALL always use directory nesting for block/field mapping
- **AND** create snippets in subdirectories matching blueprint structure

#### Scenario: Auto-detect nesting strategy
- **WHEN** user sets `kirby.syncBlockNestingStrategy` to "auto" (default)
- **THEN** the extension SHALL analyze existing block/field files to infer preferred structure
- **AND** fallback to "nested" if no existing files are found

### Requirement: Block and Field Integration with Existing Debounce Logic
The extension SHALL apply the same debouncing and rate limiting logic to block and field file creation events as page templates.

#### Scenario: Multiple rapid block creations
- **WHEN** multiple Block Blueprint files are created within 500ms
- **THEN** the extension SHALL debounce detection events
- **AND** process only the final event after the 500ms quiet period

#### Scenario: Concurrent block and template notifications
- **WHEN** a Block Blueprint and a Page Blueprint are created simultaneously
- **THEN** the extension SHALL queue prompts
- **AND** display only one active notification at a time

#### Scenario: Block file created during git operation
- **WHEN** block files are created via `git checkout` or `git merge` commands
- **THEN** the extension SHALL detect these creation events
- **AND** apply debounce logic to avoid multiple simultaneous prompts

### Requirement: Block and Field User Preference Persistence
The extension SHALL remember user preferences for dismissing block and field synchronization prompts using the same workspace state mechanism as page templates.

#### Scenario: Don't ask again for specific block
- **WHEN** user clicks [Don't ask again] button for a Block Blueprint/Snippet pair
- **THEN** the extension SHALL store this preference in workspace state
- **AND** NOT display synchronization prompts for this block file pair in the future

#### Scenario: Don't ask again for specific field
- **WHEN** user clicks [Don't ask again] button for a Field Blueprint/Snippet pair
- **THEN** the extension SHALL store this preference in workspace state
- **AND** NOT display synchronization prompts for this field file pair in the future

#### Scenario: Reset dismissed prompts includes blocks and fields
- **WHEN** user executes "Kirby: Reset Sync Prompts" command
- **THEN** the extension SHALL clear all "Don't ask again" preferences for pages, blocks, AND fields
- **AND** resume showing synchronization prompts for all file types

### Requirement: Block and Field Boilerplate Generation
The extension SHALL generate appropriate boilerplate content for block and field snippets that follows Kirby CMS conventions.

#### Scenario: Block snippet boilerplate content
- **WHEN** a Block Snippet is created via synchronization prompt
- **THEN** the generated snippet SHALL include:
  - PHP opening tag
  - Basic HTML structure comment
  - Access to `$block` variable
  - Example content retrieval from block fields

#### Scenario: Field snippet boilerplate content
- **WHEN** a Field Snippet is created via synchronization prompt
- **THEN** the generated snippet SHALL include:
  - PHP opening tag
  - Basic HTML structure comment
  - Access to `$field` variable
  - Example field value rendering

#### Scenario: Block blueprint boilerplate content
- **WHEN** a Block Blueprint is created via synchronization prompt
- **THEN** the generated blueprint SHALL include:
  - `name` field with block name
  - `icon` field with default icon
  - `fields` section with placeholder comment

#### Scenario: Consistent boilerplate across features
- **WHEN** creating files via Page Type Scaffolder, Snippet Extraction, or Blueprint/Template Sync
- **THEN** the extension SHALL use the same boilerplate generation utilities
- **AND** produce consistent code formatting and structure
