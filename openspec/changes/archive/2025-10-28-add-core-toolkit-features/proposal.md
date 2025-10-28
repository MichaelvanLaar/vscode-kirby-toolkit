# Add Core Toolkit Features

## Why

The current extension provides foundational features (type-hint injection, Blueprint validation, snippet navigation) but lacks comprehensive productivity tools that would make it a true "Toolkit" for Kirby CMS development. Developers still need to manually scaffold new page types, extract code into snippets, configure Tailwind CSS integration, and navigate between related files (Templates/Controllers/Models). These repetitive tasks slow down development and increase the barrier to entry for Kirby projects.

This proposal adds five core capabilities that transform the extension from a collection of helpers into a comprehensive development toolkit, significantly improving developer experience for scaffolding, refactoring, and navigation workflows.

## What Changes

- **Page Type Scaffolding**: Add command to generate new page types (Blueprint + Template + optional Controller/Model) with interactive prompts
- **Snippet Extraction**: Add refactoring command to extract selected code into new snippet file with automatic replacement
- **Tailwind CSS Auto-Configuration**: Detect Tailwind CSS and automatically configure VS Code settings for IntelliSense in PHP templates
- **Blueprint Field Navigation**: Add CodeLens showing available custom fields from Blueprint in corresponding template files
- **Extended File Navigation**: Enhance existing snippet navigation to support bidirectional navigation between Templates, Controllers, and Models

## Impact

- **Affected specs**:
  - `page-type-scaffolding` (NEW capability)
  - `snippet-refactoring` (NEW capability)
  - `tailwind-integration` (NEW capability)
  - `blueprint-navigation` (NEW capability)
  - `snippet-navigation` (MODIFIED - extend bidirectional navigation)

- **Affected code**:
  - `src/extension.ts` - Register new commands and providers
  - `src/commands/` (NEW) - Command implementations for scaffolding and refactoring
  - `src/providers/blueprintFieldCodeLens.ts` (NEW) - Blueprint field display
  - `src/providers/fileNavigationProvider.ts` (NEW) - Template/Controller/Model navigation
  - `src/utils/kirbyProject.ts` - Add file resolution for Controllers/Models
  - `src/utils/yamlParser.ts` (NEW) - Parse Blueprint YAML for field extraction
  - `src/utils/tailwindDetector.ts` (NEW) - Detect Tailwind CSS in project
  - `package.json` - Add new commands and configuration options

- **New dependencies**:
  - `js-yaml` - YAML parsing for Blueprint field extraction
  - `@types/js-yaml` - TypeScript types for js-yaml

- **Testing**:
  - ~25 new tests covering all new features
  - Integration tests for multi-file operations (scaffolding, snippet extraction)
  - Security tests for file creation and path validation
