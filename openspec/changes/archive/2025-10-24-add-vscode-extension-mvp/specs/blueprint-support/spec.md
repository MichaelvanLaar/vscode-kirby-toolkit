# Blueprint Support

## ADDED Requirements

### Requirement: JSON Schema Integration

The extension SHALL integrate Kirby Blueprint JSON Schema with VS Code's YAML language support to enable validation and auto-completion.

#### Scenario: Blueprint file opened

- **WHEN** a user opens a YAML file in `site/blueprints/**/*.yml`
- **THEN** VS Code SHALL apply the Kirby Blueprint JSON Schema for validation and auto-completion

#### Scenario: Invalid blueprint key

- **WHEN** a blueprint file contains an invalid or misspelled key
- **THEN** VS Code SHALL display a diagnostic error with the schema validation message

#### Scenario: Auto-completion for valid keys

- **WHEN** a user triggers auto-completion (Ctrl+Space) in a blueprint file
- **THEN** VS Code SHALL suggest valid Kirby Blueprint keys and field types based on the schema

### Requirement: Schema Source Management

The extension SHALL provide or reference a Kirby Blueprint JSON Schema.

#### Scenario: Bundled schema

- **WHEN** the extension is installed
- **THEN** it SHALL include a JSON Schema file for Kirby Blueprints in the extension package

#### Scenario: Schema updates

- **WHEN** Kirby releases a new version with Blueprint changes
- **THEN** the extension SHOULD support updating the schema through extension updates

### Requirement: Schema Registration

The extension SHALL register the JSON Schema with VS Code's YAML extension.

#### Scenario: Extension activation

- **WHEN** the extension activates in a workspace containing `site/blueprints/` directory
- **THEN** it SHALL programmatically register the schema mapping via `yaml.schemas` configuration

#### Scenario: Package.json contribution

- **WHEN** the extension is installed
- **THEN** it SHALL declare the schema association in `package.json` using `yamlValidation` contribution point

### Requirement: Blueprint File Detection

The extension SHALL detect Kirby Blueprint files based on their location.

#### Scenario: File in blueprints directory

- **WHEN** a YAML file is located in `site/blueprints/**/*.yml`
- **THEN** the extension SHALL recognize it as a Kirby Blueprint

#### Scenario: Non-blueprint YAML file

- **WHEN** a YAML file is outside the `site/blueprints/` directory
- **THEN** the extension SHALL NOT apply Kirby Blueprint schema validation

### Requirement: Configuration

The extension SHALL allow users to configure Blueprint schema behavior.

#### Scenario: Disable schema validation

- **WHEN** a user sets `kirby.enableBlueprintValidation` to `false`
- **THEN** the extension SHALL NOT register the Blueprint schema

#### Scenario: Custom schema path

- **WHEN** a user configures `kirby.blueprintSchemaPath` to a custom JSON Schema file
- **THEN** the extension SHALL use the specified schema instead of the bundled one
