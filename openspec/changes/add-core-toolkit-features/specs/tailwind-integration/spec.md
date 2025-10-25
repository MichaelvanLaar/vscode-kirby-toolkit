## ADDED Requirements

### Requirement: Tailwind Detection

The extension SHALL automatically detect if Tailwind CSS is installed in the project.

#### Scenario: Tailwind in package.json dependencies

- **WHEN** the workspace root contains a `package.json` file with `tailwindcss` in `dependencies`
- **THEN** the extension SHALL detect Tailwind CSS as active

#### Scenario: Tailwind in package.json devDependencies

- **WHEN** the workspace root contains a `package.json` file with `tailwindcss` in `devDependencies`
- **THEN** the extension SHALL detect Tailwind CSS as active

#### Scenario: No package.json

- **WHEN** the workspace does not contain a `package.json` file
- **THEN** the extension SHALL NOT activate Tailwind integration

#### Scenario: Tailwind not in dependencies

- **WHEN** the workspace contains a `package.json` file without `tailwindcss` in dependencies or devDependencies
- **THEN** the extension SHALL NOT activate Tailwind integration

### Requirement: Automatic Configuration

The extension SHALL automatically configure VS Code settings for Tailwind IntelliSense in PHP files.

#### Scenario: First-time Tailwind detection

- **WHEN** Tailwind CSS is detected for the first time in a workspace
- **THEN** the extension SHALL prompt the user: "Tailwind CSS detected. Enable IntelliSense for PHP templates?"

#### Scenario: User accepts configuration

- **WHEN** user clicks "Yes" on the Tailwind configuration prompt
- **THEN** the extension SHALL update workspace settings with `"tailwindCSS.includeLanguages": { "php": "html" }`

#### Scenario: User declines configuration

- **WHEN** user clicks "No" or dismisses the Tailwind configuration prompt
- **THEN** the extension SHALL NOT modify workspace settings and SHALL NOT prompt again for this workspace

#### Scenario: Settings already configured

- **WHEN** workspace settings already contain `tailwindCSS.includeLanguages` with `"php"` entry
- **THEN** the extension SHALL NOT prompt the user or modify settings

### Requirement: Workspace Settings Management

The extension SHALL update workspace settings (not user settings) to avoid affecting other projects.

#### Scenario: Workspace settings file

- **WHEN** the extension configures Tailwind integration
- **THEN** it SHALL create or update `.vscode/settings.json` in the workspace root

#### Scenario: Preserve existing settings

- **WHEN** `.vscode/settings.json` already contains other settings
- **THEN** the extension SHALL only add the `tailwindCSS.includeLanguages` property without modifying other settings

#### Scenario: Settings file creation

- **WHEN** `.vscode/` directory or `settings.json` file does not exist
- **THEN** the extension SHALL create the directory and file before writing settings

### Requirement: Manual Override

The extension SHALL allow users to manually control Tailwind integration.

#### Scenario: Disable via settings

- **WHEN** user sets `kirby.enableTailwindIntegration` to `false`
- **THEN** the extension SHALL NOT detect or configure Tailwind CSS even if it's present in the project

#### Scenario: Re-enable after disabling

- **WHEN** user sets `kirby.enableTailwindIntegration` back to `true` after previously disabling
- **THEN** the extension SHALL resume Tailwind detection and prompt for configuration if needed

#### Scenario: Manual configuration command

- **WHEN** user executes "Kirby: Configure Tailwind IntelliSense" command
- **THEN** the extension SHALL force-apply the Tailwind settings regardless of current configuration state

### Requirement: Extension Dependency

The extension SHALL verify that the Tailwind CSS IntelliSense extension is installed before configuration.

#### Scenario: Tailwind extension installed

- **WHEN** the official Tailwind CSS IntelliSense extension (bradlc.vscode-tailwindcss) is installed
- **THEN** the extension SHALL proceed with Tailwind configuration

#### Scenario: Tailwind extension not installed

- **WHEN** the Tailwind CSS IntelliSense extension is not installed
- **THEN** the extension SHALL display a notification: "Install Tailwind CSS IntelliSense extension for PHP template support" with an "Install" button

#### Scenario: Install button clicked

- **WHEN** user clicks the "Install" button in the notification
- **THEN** VS Code SHALL open the extension marketplace page for bradlc.vscode-tailwindcss

### Requirement: Change Detection

The extension SHALL monitor package.json changes to detect Tailwind CSS installation/removal.

#### Scenario: Tailwind added to project

- **WHEN** user adds `tailwindcss` to package.json dependencies while workspace is open
- **THEN** the extension SHALL detect the change and prompt to configure integration

#### Scenario: Tailwind removed from project

- **WHEN** user removes `tailwindcss` from package.json dependencies
- **THEN** the extension SHALL detect the change and optionally prompt to remove the configuration

#### Scenario: File system watcher

- **WHEN** the extension activates in a Kirby workspace
- **THEN** it SHALL register a FileSystemWatcher for `package.json` changes

### Requirement: Configuration Persistence

The extension SHALL remember user choices to avoid repeated prompts.

#### Scenario: Remember "No" choice

- **WHEN** user declines Tailwind configuration for a workspace
- **THEN** the extension SHALL store this choice in workspace state and not prompt again

#### Scenario: Reset prompt state

- **WHEN** user executes "Kirby: Reset Tailwind Integration Prompt" command
- **THEN** the extension SHALL clear the stored choice and prompt again on next Tailwind detection

### Requirement: Error Handling

The extension SHALL handle configuration errors gracefully.

#### Scenario: Settings file write error

- **WHEN** the extension cannot write to `.vscode/settings.json` (e.g., permission error)
- **THEN** it SHALL display an error notification with the system error message and instructions to manually configure

#### Scenario: Invalid JSON in settings

- **WHEN** `.vscode/settings.json` contains invalid JSON
- **THEN** the extension SHALL display a warning: "Cannot update settings due to invalid JSON. Please fix .vscode/settings.json manually."

#### Scenario: Workspace not trusted

- **WHEN** the workspace is not trusted (VS Code Workspace Trust feature)
- **THEN** the extension SHALL NOT attempt to modify settings until the workspace is trusted
