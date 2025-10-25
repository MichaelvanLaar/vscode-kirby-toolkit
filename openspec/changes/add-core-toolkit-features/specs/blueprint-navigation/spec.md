## ADDED Requirements

### Requirement: Blueprint File Resolution

The extension SHALL resolve Blueprint files corresponding to template files based on naming conventions.

#### Scenario: Simple template to blueprint

- **WHEN** a template file `site/templates/project.php` is open
- **THEN** the extension SHALL resolve to `site/blueprints/pages/project.yml`

#### Scenario: Pages subdirectory blueprint

- **WHEN** a template file `site/templates/article.php` is open and `site/blueprints/pages/article.yml` exists
- **THEN** the extension SHALL resolve to the `pages/` subdirectory blueprint

#### Scenario: Root-level blueprint fallback

- **WHEN** a template file `site/templates/home.php` is open and `site/blueprints/pages/home.yml` does not exist
- **THEN** the extension SHALL check for `site/blueprints/home.yml` as fallback

#### Scenario: No corresponding blueprint

- **WHEN** a template file has no matching Blueprint in any location
- **THEN** the extension SHALL NOT display Blueprint field CodeLens

### Requirement: YAML Parsing

The extension SHALL parse Blueprint YAML files to extract custom field definitions.

#### Scenario: Simple fields section

- **WHEN** a Blueprint contains:
  ```yaml
  fields:
    title:
      type: text
    description:
      type: textarea
  ```
- **THEN** the extension SHALL extract field names: "title", "description"

#### Scenario: Nested tabs and sections

- **WHEN** a Blueprint contains fields nested under tabs and sections:
  ```yaml
  tabs:
    content:
      sections:
        main:
          type: fields
          fields:
            headline:
              type: text
  ```
- **THEN** the extension SHALL extract field names from all nested structures

#### Scenario: Invalid YAML

- **WHEN** a Blueprint file contains syntax errors (invalid YAML)
- **THEN** the extension SHALL log an error and not display CodeLens for that template

#### Scenario: Empty Blueprint

- **WHEN** a Blueprint file contains no `fields:` sections
- **THEN** the extension SHALL not display field CodeLens

### Requirement: CodeLens Provider

The extension SHALL display Blueprint fields as CodeLens above template code.

#### Scenario: CodeLens at file top

- **WHEN** a template file has a corresponding Blueprint with fields
- **THEN** the extension SHALL display a CodeLens on line 1: "Blueprint Fields: title, description, gallery"

#### Scenario: Field count in CodeLens

- **WHEN** a Blueprint contains more than 5 fields
- **THEN** the CodeLens SHALL display the first 5 fields followed by "... (+N more)"

#### Scenario: No CodeLens for non-templates

- **WHEN** a PHP file in `site/snippets/` or `site/controllers/` is open
- **THEN** the extension SHALL NOT display Blueprint field CodeLens

#### Scenario: CodeLens clicked

- **WHEN** user clicks the Blueprint field CodeLens
- **THEN** the corresponding Blueprint file SHALL open in the editor

### Requirement: Field Type Display

The extension SHALL optionally include field types in the CodeLens display.

#### Scenario: Show field types

- **WHEN** user setting `kirby.showBlueprintFieldTypes` is `true`
- **THEN** the CodeLens SHALL display: "Blueprint Fields: title (text), description (textarea), gallery (files)"

#### Scenario: Hide field types

- **WHEN** user setting `kirby.showBlueprintFieldTypes` is `false` (default)
- **THEN** the CodeLens SHALL display only field names: "Blueprint Fields: title, description, gallery"

### Requirement: Caching and Performance

The extension SHALL cache parsed Blueprint data to improve performance.

#### Scenario: Blueprint parsed once

- **WHEN** a template file is opened multiple times
- **THEN** the extension SHALL parse the corresponding Blueprint only on first access

#### Scenario: Cache invalidation on change

- **WHEN** a Blueprint file is modified
- **THEN** the extension SHALL invalidate the cache for that Blueprint and re-parse on next access

#### Scenario: File system watcher

- **WHEN** the extension activates in a Kirby workspace
- **THEN** it SHALL register a FileSystemWatcher for changes to `site/blueprints/**/*.yml`

#### Scenario: Large Blueprint handling

- **WHEN** a Blueprint file is larger than 500KB
- **THEN** the extension SHALL skip parsing and log a warning

### Requirement: Configuration

The extension SHALL allow users to configure Blueprint field CodeLens behavior.

#### Scenario: Disable Blueprint CodeLens

- **WHEN** user sets `kirby.showBlueprintFieldCodeLens` to `false`
- **THEN** the extension SHALL NOT display Blueprint field CodeLens

#### Scenario: Customize field limit

- **WHEN** user sets `kirby.blueprintFieldDisplayLimit` to `10`
- **THEN** the CodeLens SHALL display up to 10 fields before truncating with "... (+N more)"

### Requirement: Error Handling

The extension SHALL handle YAML parsing errors gracefully.

#### Scenario: YAML syntax error

- **WHEN** a Blueprint contains invalid YAML syntax
- **THEN** the extension SHALL log the error to the Output panel and not crash

#### Scenario: Missing Blueprint file

- **WHEN** a template references a non-existent Blueprint (file was deleted)
- **THEN** the extension SHALL not display CodeLens and not show error notifications

#### Scenario: Permission error

- **WHEN** the extension cannot read a Blueprint file due to permissions
- **THEN** it SHALL log a warning and skip CodeLens display for that template
