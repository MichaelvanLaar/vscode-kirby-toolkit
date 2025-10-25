# Implementation Tasks

## 1. Setup and Dependencies

- [ ] 1.1 Install `js-yaml` package: `npm install js-yaml`
- [ ] 1.2 Install `@types/js-yaml` package: `npm install --save-dev @types/js-yaml`
- [ ] 1.3 Update package.json with new configuration properties
- [ ] 1.4 Verify all dependencies install correctly and build succeeds

## 2. Core Utilities

- [ ] 2.1 Create `src/utils/yamlParser.ts` for Blueprint YAML parsing
  - [ ] 2.1.1 Implement `parseBlueprint()` function using js-yaml
  - [ ] 2.1.2 Implement `extractFieldNames()` to get field list from parsed YAML
  - [ ] 2.1.3 Implement nested field extraction (tabs, sections)
  - [ ] 2.1.4 Add error handling for invalid YAML
  - [ ] 2.1.5 Write unit tests (minimum 6 tests)

- [ ] 2.2 Create `src/utils/tailwindDetector.ts` for Tailwind CSS detection
  - [ ] 2.2.1 Implement `detectTailwind()` to check package.json
  - [ ] 2.2.2 Implement `getTailwindVersion()` helper
  - [ ] 2.2.3 Add workspace folder resolution
  - [ ] 2.2.4 Write unit tests (minimum 4 tests)

- [ ] 2.3 Extend `src/utils/kirbyProject.ts` with new file resolution
  - [ ] 2.3.1 Add `resolveControllerPath()` function
  - [ ] 2.3.2 Add `resolveModelPath()` function
  - [ ] 2.3.3 Add `resolveBlueprintForTemplate()` function
  - [ ] 2.3.4 Add `validateFileName()` for scaffolding security
  - [ ] 2.3.5 Write unit tests (minimum 8 tests)

## 3. Page Type Scaffolding (FR-2.1)

- [ ] 3.1 Create `src/commands/pageTypeScaffolder.ts`
  - [ ] 3.1.1 Implement command registration function
  - [ ] 3.1.2 Implement `promptPageTypeName()` with validation
  - [ ] 3.1.3 Implement `promptFileSelection()` with multi-select
  - [ ] 3.1.4 Implement `generateBlueprint()` file creation
  - [ ] 3.1.5 Implement `generateTemplate()` file creation with type hints
  - [ ] 3.1.6 Implement `generateController()` optional file creation
  - [ ] 3.1.7 Implement `generateModel()` optional file creation with class naming
  - [ ] 3.1.8 Implement atomic operation error handling
  - [ ] 3.1.9 Add success notification with "Open Template" action

- [ ] 3.2 Write tests for page type scaffolding
  - [ ] 3.2.1 Test valid name input and file creation
  - [ ] 3.2.2 Test invalid name rejection (path traversal, empty)
  - [ ] 3.2.3 Test file selection prompt
  - [ ] 3.2.4 Test Blueprint content generation
  - [ ] 3.2.5 Test template content with type hints
  - [ ] 3.2.6 Test controller and model generation
  - [ ] 3.2.7 Test directory creation
  - [ ] 3.2.8 Test existing file warning
  - [ ] 3.2.9 Security tests (minimum 8 tests for path validation)

- [ ] 3.3 Register command in `src/extension.ts`
  - [ ] 3.3.1 Import pageTypeScaffolder
  - [ ] 3.3.2 Register "kirby.newPageType" command
  - [ ] 3.3.3 Add to package.json commands contribution

## 4. Snippet Extraction (FR-2.2)

- [ ] 4.1 Create `src/commands/snippetExtractor.ts`
  - [ ] 4.1.1 Implement command registration function
  - [ ] 4.1.2 Implement `validateSelection()` with bracket checking
  - [ ] 4.1.3 Implement `promptSnippetName()` with validation
  - [ ] 4.1.4 Implement `createSnippetFile()` with type hints
  - [ ] 4.1.5 Implement `replaceWithSnippetCall()` with indentation preservation
  - [ ] 4.1.6 Implement PHP context detection for tag handling
  - [ ] 4.1.7 Implement atomic operation using WorkspaceEdit
  - [ ] 4.1.8 Add existing file check and error handling
  - [ ] 4.1.9 Add success notification with "Open Snippet" action

- [ ] 4.2 Write tests for snippet extraction
  - [ ] 4.2.1 Test valid selection extraction
  - [ ] 4.2.2 Test empty selection rejection
  - [ ] 4.2.3 Test invalid snippet name rejection
  - [ ] 4.2.4 Test code replacement with correct snippet call
  - [ ] 4.2.5 Test indentation preservation
  - [ ] 4.2.6 Test PHP context detection
  - [ ] 4.2.7 Test nested snippet paths
  - [ ] 4.2.8 Test existing file error
  - [ ] 4.2.9 Security tests (minimum 8 tests)

- [ ] 4.3 Register command in `src/extension.ts`
  - [ ] 4.3.1 Import snippetExtractor
  - [ ] 4.3.2 Register "kirby.extractToSnippet" command
  - [ ] 4.3.3 Add to package.json commands and menus contributions

## 5. Tailwind CSS Integration (FR-2.3)

- [ ] 5.1 Create `src/integrations/tailwindIntegration.ts`
  - [ ] 5.1.1 Implement extension detection check
  - [ ] 5.1.2 Implement settings update function
  - [ ] 5.1.3 Implement user prompt for configuration
  - [ ] 5.1.4 Implement workspace state for "don't ask again"
  - [ ] 5.1.5 Implement FileSystemWatcher for package.json changes
  - [ ] 5.1.6 Add error handling for settings write failures
  - [ ] 5.1.7 Implement manual configuration command

- [ ] 5.2 Write tests for Tailwind integration
  - [ ] 5.2.1 Test Tailwind detection from package.json
  - [ ] 5.2.2 Test settings update logic
  - [ ] 5.2.3 Test existing settings preservation
  - [ ] 5.2.4 Test user prompt flow
  - [ ] 5.2.5 Test package.json watcher
  - [ ] 5.2.6 Test extension dependency check

- [ ] 5.3 Register integration in `src/extension.ts`
  - [ ] 5.3.1 Import tailwindIntegration
  - [ ] 5.3.2 Call integration on activation
  - [ ] 5.3.3 Register manual configuration command
  - [ ] 5.3.4 Add configuration properties to package.json

## 6. Blueprint Field CodeLens (FR-2.4)

- [ ] 6.1 Create `src/providers/blueprintFieldCodeLens.ts`
  - [ ] 6.1.1 Implement CodeLensProvider interface
  - [ ] 6.1.2 Implement template-to-blueprint resolution
  - [ ] 6.1.3 Implement Blueprint parsing with yamlParser utility
  - [ ] 6.1.4 Implement field extraction and formatting
  - [ ] 6.1.5 Implement field truncation logic ("... (+N more)")
  - [ ] 6.1.6 Implement caching with Map<string, FieldData>
  - [ ] 6.1.7 Implement cache invalidation via FileSystemWatcher
  - [ ] 6.1.8 Add field type display based on settings
  - [ ] 6.1.9 Implement click handler to open Blueprint

- [ ] 6.2 Write tests for Blueprint field CodeLens
  - [ ] 6.2.1 Test Blueprint resolution for templates
  - [ ] 6.2.2 Test field extraction from YAML
  - [ ] 6.2.3 Test nested fields (tabs, sections)
  - [ ] 6.2.4 Test CodeLens display and formatting
  - [ ] 6.2.5 Test field truncation
  - [ ] 6.2.6 Test caching behavior
  - [ ] 6.2.7 Test invalid YAML handling

- [ ] 6.3 Register provider in `src/extension.ts`
  - [ ] 6.3.1 Import BlueprintFieldCodeLensProvider
  - [ ] 6.3.2 Register CodeLens provider for PHP files
  - [ ] 6.3.3 Add configuration properties to package.json

## 7. Extended File Navigation (FR-2.5)

- [ ] 7.1 Create `src/providers/fileNavigationProvider.ts`
  - [ ] 7.1.1 Implement unified DefinitionProvider
  - [ ] 7.1.2 Implement file type detection (template/controller/model)
  - [ ] 7.1.3 Implement template-to-controller navigation
  - [ ] 7.1.4 Implement template-to-model navigation
  - [ ] 7.1.5 Implement controller-to-template navigation
  - [ ] 7.1.6 Implement model-to-template navigation
  - [ ] 7.1.7 Implement multi-target definition support
  - [ ] 7.1.8 Add file existence checks

- [ ] 7.2 Create `src/providers/fileNavigationCodeLens.ts`
  - [ ] 7.2.1 Implement CodeLensProvider for templates
  - [ ] 7.2.2 Implement "Open Controller" CodeLens
  - [ ] 7.2.3 Implement "Open Model" CodeLens
  - [ ] 7.2.4 Implement bidirectional CodeLens for controllers/models
  - [ ] 7.2.5 Add configuration checks

- [ ] 7.3 Write tests for extended navigation
  - [ ] 7.3.1 Test template-to-controller navigation
  - [ ] 7.3.2 Test template-to-model navigation
  - [ ] 7.3.3 Test bidirectional navigation
  - [ ] 7.3.4 Test multi-target definitions
  - [ ] 7.3.5 Test file not found scenarios
  - [ ] 7.3.6 Test CodeLens display

- [ ] 7.4 Register providers in `src/extension.ts`
  - [ ] 7.4.1 Import navigation providers
  - [ ] 7.4.2 Register DefinitionProvider for PHP files
  - [ ] 7.4.3 Register CodeLensProvider for PHP files
  - [ ] 7.4.4 Add configuration properties to package.json

## 8. Integration and Testing

- [ ] 8.1 Run all tests and ensure 100% pass rate
- [ ] 8.2 Test all features in realistic Kirby project
- [ ] 8.3 Verify no regressions in existing features (type-hints, Blueprint validation, snippet navigation)
- [ ] 8.4 Test extension activation performance (<500ms)
- [ ] 8.5 Run security audit: `npm audit`
- [ ] 8.6 Run linter: `npm run lint`
- [ ] 8.7 Test with large Kirby projects (performance validation)

## 9. Documentation

- [ ] 9.1 Update README.md with new features
  - [ ] 9.1.1 Add Page Type Scaffolding section with screenshots
  - [ ] 9.1.2 Add Snippet Extraction section
  - [ ] 9.1.3 Add Tailwind Integration section
  - [ ] 9.1.4 Add Blueprint Field CodeLens section
  - [ ] 9.1.5 Add Extended Navigation section
  - [ ] 9.1.6 Update configuration reference

- [ ] 9.2 Update CHANGELOG.md with version 0.3.0 entry
- [ ] 9.3 Update package.json version to 0.3.0
- [ ] 9.4 Add JSDoc comments to all new public APIs
- [ ] 9.5 Create user guide in docs/ folder (optional)

## 10. Pre-Release Validation

- [ ] 10.1 Test packaging: `vsce package`
- [ ] 10.2 Install .vsix locally and test all features
- [ ] 10.3 Verify extension metadata (displayName, description, keywords)
- [ ] 10.4 Test on Windows, macOS, and Linux (if possible)
- [ ] 10.5 Verify all security tests pass
- [ ] 10.6 Review all added code for security issues
- [ ] 10.7 Final validation: `openspec validate add-core-toolkit-features --strict`
