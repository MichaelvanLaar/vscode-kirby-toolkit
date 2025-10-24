# Implementation Tasks

## 1. Project Setup

- [x] 1.1 Initialize VS Code extension project using `yo code` generator (TypeScript)
- [x] 1.2 Configure `package.json` with extension metadata (name, publisher, description, keywords)
- [x] 1.3 Set up extension activation events: `onLanguage:php`, `onLanguage:yaml`, `workspaceContains:site/`
- [x] 1.4 Add `redhat.vscode-yaml` to `extensionDependencies` in `package.json`
- [x] 1.5 Configure TypeScript compiler options and build tooling (webpack/esbuild)
- [x] 1.6 Set up test framework (VS Code Extension Test Runner)

## 2. Core Utilities

- [x] 2.1 Create `src/utils/kirbyProject.ts` with `detectKirbyProject()` function (checks for `site/` directory)
- [x] 2.2 Implement `resolveSnippetPath(snippetName: string): string` in `kirbyProject.ts`
- [x] 2.3 Implement `isTemplateFile(filePath: string): boolean` helper
- [x] 2.4 Implement `isSnippetFile(filePath: string): boolean` helper
- [x] 2.5 Create `src/config/settings.ts` with configuration access helpers
- [x] 2.6 Write unit tests for path resolution and detection utilities

## 3. Type-Hint Injection (FR-1.1)

- [x] 3.1 Create `src/providers/typeHintProvider.ts`
- [x] 3.2 Implement `generateTypeHintBlock()` to create PHPDoc comment string
- [x] 3.3 Register `workspace.onDidCreateFiles` event listener in `extension.ts`
- [x] 3.4 Implement automatic injection on file creation (check path, config, insert at position 0)
- [x] 3.5 Register command `kirby.addTypeHints` for manual invocation
- [x] 3.6 Implement duplicate detection (check if type-hints already exist)
- [x] 3.7 Add configuration settings: `kirby.autoInjectTypeHints` (boolean), `kirby.typeHintVariables` (array)
- [x] 3.8 Write integration tests for automatic and manual injection
- [x] 3.9 Handle edge cases: empty files, files with existing PHP opening tag

## 4. Blueprint Schema Support (FR-1.2)

- [x] 4.1 Research and select Blueprint JSON Schema (community or create minimal MVP version)
- [x] 4.2 Verify schema license compatibility for bundling
- [x] 4.3 Add schema file to `src/schemas/blueprint.schema.json`
- [x] 4.4 Register schema in `package.json` via `yamlValidation` contribution point
- [x] 4.5 Configure file pattern matching: `site/blueprints/**/*.yml`
- [x] 4.6 Add configuration setting: `kirby.enableBlueprintValidation` (boolean)
- [x] 4.7 Add configuration setting: `kirby.blueprintSchemaPath` (string, optional custom path)
- [x] 4.8 Implement programmatic schema registration if custom path configured
- [x] 4.9 Test schema validation with sample blueprint files (valid and invalid cases)
- [x] 4.10 Document schema source and attribution in README

## 5. Snippet Navigation (FR-1.3)

### 5.1 CodeLens Provider

- [x] 5.1.1 Create `src/providers/snippetCodeLens.ts` implementing `CodeLensProvider`
- [x] 5.1.2 Implement `provideCodeLenses()` to scan document for `snippet()` calls using regex
- [x] 5.1.3 Parse snippet names from single-quoted and double-quoted strings
- [x] 5.1.4 Return `CodeLens` objects with "Open Snippet" title and `kirby.openSnippet` command
- [x] 5.1.5 Register CodeLens provider for `php` language selector in `extension.ts`
- [x] 5.1.6 Handle nested snippet paths (e.g., `partials/menu`)
- [x] 5.1.7 Add configuration setting: `kirby.showSnippetCodeLens` (boolean)

### 5.2 Definition Provider

- [x] 5.2.1 Create `src/providers/snippetDefinition.ts` implementing `DefinitionProvider`
- [x] 5.2.2 Implement `provideDefinition()` to detect cursor position on snippet name
- [x] 5.2.3 Extract snippet name from `snippet()` call at cursor position
- [x] 5.2.4 Return `Location` object pointing to resolved snippet file
- [x] 5.2.5 Register Definition provider for `php` language selector in `extension.ts`

### 5.3 Shared Logic

- [x] 5.3.1 Create `src/utils/phpParser.ts` with `findSnippetCalls(documentText: string)` function
- [x] 5.3.2 Implement regex pattern to match `snippet('name')` and `snippet("name")` with optional data parameter
- [x] 5.3.3 Implement `openSnippet` command handler in `extension.ts`
- [x] 5.3.4 Show error notification if snippet file not found
- [x] 5.3.5 Write unit tests for snippet call parsing (various formats, edge cases)
- [x] 5.3.6 Write integration tests for CodeLens display and Definition navigation

## 6. Extension Activation and Lifecycle

- [x] 6.1 Implement `activate()` function in `extension.ts`
- [x] 6.2 Run Kirby project detection at activation
- [x] 6.3 Conditionally register providers based on project detection
- [x] 6.4 Register all commands (`kirby.addTypeHints`, `kirby.openSnippet`)
- [x] 6.5 Implement `deactivate()` for cleanup
- [x] 6.6 Store disposables in `ExtensionContext.subscriptions` for automatic cleanup

## 7. Documentation

- [x] 7.1 Write `README.md` with feature descriptions, screenshots, and usage instructions
- [x] 7.2 Document configuration settings in README
- [x] 7.3 Create `CHANGELOG.md` for version 0.1.0 (MVP)
- [x] 7.4 Add license information (MIT recommended for open source)
- [x] 7.5 Document Blueprint schema source and license attribution
- [x] 7.6 Add contributing guidelines (`CONTRIBUTING.md`) if open-sourcing

## 8. Testing and QA

- [x] 8.1 Create test Kirby project structure in `test-fixtures/` directory
- [x] 8.2 Add sample templates, snippets, and blueprints for manual testing
- [x] 8.3 Run unit tests and ensure >80% code coverage
- [x] 8.4 Run integration tests in VS Code Extension Test environment
- [x] 8.5 Manual testing: Type-hint injection on new file creation
- [x] 8.6 Manual testing: Type-hint command on existing files
- [x] 8.7 Manual testing: Blueprint validation errors and auto-completion
- [x] 8.8 Manual testing: Snippet CodeLens display and click navigation
- [x] 8.9 Manual testing: Snippet Definition Provider (F12, Ctrl+Click, Peek)
- [x] 8.10 Manual testing: Configuration settings (disable features, custom variables)
- [x] 8.11 Test extension in non-Kirby workspace (ensure no activation or errors)

## 9. Packaging and Release

- [x] 9.1 Configure extension icon and gallery banner in `package.json`
- [x] 9.2 Set version to `0.1.0` in `package.json`
- [x] 9.3 Add repository URL and issue tracker links
- [x] 9.4 Package extension using `vsce package`
- [x] 9.5 Test `.vsix` installation in clean VS Code instance
- [x] 9.6 Publish to VS Code Marketplace (or distribute `.vsix` for private testing)
- [x] 9.7 Tag repository with `v0.1.0` release

## Dependencies Between Tasks

- **Sequential**: 1 → 2 → 6 (setup must complete before core utilities and activation logic)
- **Sequential**: 2.1-2.4 → 3 (file detection utilities required for type-hint injection)
- **Sequential**: 2.2 → 5.3.4 (snippet path resolution required for navigation command)
- **Sequential**: 2 → 5.3.1 (PHP parser depends on utilities)
- **Parallel**: 3, 4, 5 can be developed concurrently after section 2 completes
- **Sequential**: 3, 4, 5 → 8 (features must be implemented before testing)
- **Sequential**: 8 → 9 (testing must pass before packaging)

## Notes

- Tasks 3, 4, and 5 are independent features and can be developed in parallel by multiple contributors or tackled sequentially
- Each provider implementation (sections 3, 4, 5) should be committed separately for easier review
- Configuration settings should be added incrementally with each feature
- Documentation (section 7) can be written incrementally alongside feature development
