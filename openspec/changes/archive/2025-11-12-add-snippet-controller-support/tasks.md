# Implementation Tasks

## 1. Core Infrastructure

- [ ] 1.1 Add snippet controller plugin detection functions to `src/utils/kirbyProject.ts`
  - [ ] 1.1.1 Implement `isSnippetControllerPluginInstalled()` to check composer.json and site/plugins/
  - [ ] 1.1.2 Cache plugin detection result for performance
- [x] 1.2 Add snippet controller file detection and path resolution functions
  - [x] 1.2.1 Implement `isSnippetControllerFile(filePath)` to detect `.controller.php` files in snippets directory
  - [ ] 1.2.2 Implement `resolveSnippetControllerPath(snippetName)` to resolve controller file paths
  - [ ] 1.2.3 Implement `snippetControllerExists(snippetName)` to check controller file existence
  - [ ] 1.2.4 Implement `resolveSnippetFromController(controllerPath)` for reverse resolution
- [x] 1.3 Write comprehensive unit tests for new utility functions
  - [ ] 1.3.1 Test plugin detection with composer.json
  - [ ] 1.3.2 Test plugin detection with site/plugins directory
  - [x] 1.3.3 Test controller file detection (top-level and nested)
  - [ ] 1.3.4 Test path resolution (both directions)
  - [ ] 1.3.5 Test path traversal protection for controller paths
  - [ ] 1.3.6 Test graceful degradation when plugin not installed

## 2. Type-Hint Injection Enhancement

- [x] 2.1 Update `src/providers/typeHintProvider.ts` to recognize snippet controller files
  - [x] 2.1.1 Modify file creation handler to detect `.controller.php` files
  - [x] 2.1.2 Inject type-hints for snippet controller files
  - [x] 2.1.3 Respect `kirby.enableSnippetControllers` configuration
- [x] 2.2 Update tests for type-hint injection
  - [x] 2.2.1 Test automatic injection on snippet controller creation
  - [x] 2.2.2 Test manual command on snippet controller files
  - [x] 2.2.3 Test configuration flag for disabling controller support

## 3. Snippet Navigation Enhancement

- [ ] 3.1 Update `src/providers/snippetCodeLens.ts` to support controller navigation
  - [ ] 3.1.1 Add "Open Controller" CodeLens when controller exists
  - [ ] 3.1.2 Add command handler for opening controller files
  - [ ] 3.1.3 Show both "Open Snippet" and "Open Controller" CodeLens for snippet() calls with controllers
  - [ ] 3.1.4 Respect plugin detection and configuration settings
- [ ] 3.2 Update `src/providers/snippetDefinition.ts` to include controller files
  - [ ] 3.2.1 Return both snippet and controller as Definition targets when both exist
  - [ ] 3.2.2 Handle case when only snippet exists (current behavior)
  - [ ] 3.2.3 Handle case when only controller exists
- [ ] 3.3 Update tests for snippet navigation
  - [ ] 3.3.1 Test CodeLens displays for controllers
  - [ ] 3.3.2 Test Definition Provider with multiple targets
  - [ ] 3.3.3 Test navigation from snippet() calls to controllers
  - [ ] 3.3.4 Test graceful behavior when plugin not installed

## 4. File Navigation - Snippet-Controller Bidirectional Navigation

- [ ] 4.1 Update `src/providers/fileNavigationProvider.ts` to support snippet-controller navigation
  - [ ] 4.1.1 Add snippet-to-controller navigation logic
  - [ ] 4.1.2 Add controller-to-snippet navigation logic
  - [ ] 4.1.3 Handle nested snippets correctly
  - [ ] 4.1.4 Respect plugin detection and configuration
- [ ] 4.2 Update `src/providers/fileNavigationCodeLens.ts` for snippet-controller CodeLens
  - [ ] 4.2.1 Add "Open Controller" CodeLens in snippet files
  - [ ] 4.2.2 Add "Open Snippet" CodeLens in controller files
  - [ ] 4.2.3 Handle missing files gracefully
  - [ ] 4.2.4 Respect configuration settings
- [ ] 4.3 Register new commands in `src/extension.ts`
  - [ ] 4.3.1 Add `kirby.openSnippetController` command
  - [ ] 4.3.2 Add `kirby.openSnippetFromController` command
  - [ ] 4.3.3 Register commands conditionally based on plugin detection
- [ ] 4.4 Write comprehensive tests for file navigation
  - [ ] 4.4.1 Test navigation from snippet to controller
  - [ ] 4.4.2 Test navigation from controller to snippet
  - [ ] 4.4.3 Test CodeLens display and click behavior
  - [ ] 4.4.4 Test nested snippet navigation
  - [ ] 4.4.5 Test graceful handling of missing files

## 5. Configuration

- [x] 5.1 Add new configuration options to `package.json`
  - [x] 5.1.1 Add `kirby.enableSnippetControllers` (boolean, default: true) - Master switch for controller features
  - [ ] 5.1.2 Update existing settings descriptions to mention controller support
- [x] 5.2 Update `src/config/settings.ts` with new configuration getters
  - [x] 5.2.1 Add `isSnippetControllerSupportEnabled()` function
  - [x] 5.2.2 Integrate with existing configuration functions

## 6. Documentation

- [ ] 6.1 Update README.md with snippet controller feature documentation
  - [ ] 6.1.1 Add description of snippet controller support
  - [ ] 6.1.2 Add screenshots/examples of controller navigation
  - [ ] 6.1.3 Document configuration options
  - [ ] 6.1.4 Add note about Snippet Controller plugin requirement
- [ ] 6.2 Update CHANGELOG.md with new features
- [ ] 6.3 Update package.json description to mention snippet controller support

## 7. Integration Testing

- [ ] 7.1 Create test workspace with Snippet Controller plugin
  - [ ] 7.1.1 Create sample snippets with controllers
  - [ ] 7.1.2 Create nested snippet examples
  - [ ] 7.1.3 Create test cases with missing snippets/controllers
- [ ] 7.2 Manual testing of all features
  - [ ] 7.2.1 Test type-hint injection in controller files
  - [ ] 7.2.2 Test CodeLens navigation between snippets and controllers
  - [ ] 7.2.3 Test Go-to-Definition with multiple targets
  - [ ] 7.2.4 Test with plugin not installed (graceful degradation)
  - [ ] 7.2.5 Test configuration options
- [ ] 7.3 Performance testing
  - [ ] 7.3.1 Verify plugin detection doesn't slow down activation
  - [ ] 7.3.2 Verify controller resolution is performant
  - [ ] 7.3.3 Test with large numbers of snippets/controllers

## 8. Quality Assurance

- [ ] 8.1 Run full test suite (`npm test`) and ensure all tests pass
- [ ] 8.2 Run linter (`npm run lint`) and fix any issues
- [ ] 8.3 Test security measures
  - [ ] 8.3.1 Verify path traversal protection for controller paths
  - [ ] 8.3.2 Verify input validation for controller file names
- [ ] 8.4 Verify NFR compliance
  - [ ] 8.4.1 Performance: Activation time still <500ms
  - [ ] 8.4.2 Compatibility: No conflicts with existing features
  - [ ] 8.4.3 User Experience: Clear feedback for all operations
  - [ ] 8.4.4 Test coverage: >80% for new code

## Dependencies and Sequencing

- Tasks 1.1-1.3 must be completed before all other tasks (core infrastructure)
- Tasks 2.x, 3.x, and 4.x can be completed in parallel after 1.x
- Task 5.x can be completed in parallel with 2.x-4.x
- Tasks 6.x should be completed after all implementation tasks
- Tasks 7.x and 8.x should be completed last (integration and quality checks)
