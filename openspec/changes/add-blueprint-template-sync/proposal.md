# Add Blueprint/Template Synchronization

## Why

In Kirby CMS, Blueprints (YAML files defining content structure) and Templates (PHP files rendering content) are tightly coupled but created independently. Developers frequently create a Blueprint file for a new page type but forget to create the corresponding Template file, or vice versa, leading to runtime errors or missing content displays. The extension currently has no awareness of this relationship, requiring developers to manually track which files need to be created together.

## What Changes

This change introduces **Blueprint/Template Synchronization** by detecting when a developer creates a new Blueprint or Template file and prompting them to automatically create the corresponding counterpart. The implementation will:

- Monitor file creation events for Blueprint files in `site/blueprints/pages/*.yml`
- Monitor file creation events for Template files in `site/templates/*.php`
- Display an intelligent quick action or notification when a Blueprint is created without a matching Template (and vice versa)
- Offer to automatically scaffold the missing file with appropriate boilerplate content
- Support optional creation of Controller and Model files when scaffolding a Template
- Maintain tight integration with existing scaffolding features (Page Type Scaffolder)

This feature ensures developers maintain consistency between content definition (Blueprints) and presentation (Templates), reducing errors and speeding up development.

## Impact

- **Affected specs**: New capability `blueprint-template-synchronization`
- **Affected code**:
  - New module: `src/providers/blueprintTemplateSyncWatcher.ts` - File system watcher for Blueprint/Template creation
  - Modified: `src/extension.ts` - Register file system watcher on activation
  - Modified: `src/commands/pageTypeScaffolder.ts` - Extract reusable scaffolding logic
  - Modified: `src/utils/kirbyProject.ts` - Add helper methods for detecting matching files
  - Modified: `package.json` - Add new configuration settings
- **Configuration**: New settings for enabling/disabling synchronization prompts and default file creation behavior
- **Dependencies**: None (uses built-in VS Code FileSystemWatcher API)
- **Breaking changes**: None
- **Testing**: New test suite for file watcher, template detection, and synchronization prompts
