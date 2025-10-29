# Implementation Tasks: Blueprint/Template Synchronization

## 1. Scaffolding Utilities Refactoring
- [ ] 1.1 Create `src/utils/scaffoldingTemplates.ts` module for reusable content generators
- [ ] 1.2 Extract `generateTemplateContent(pageTypeName: string)` function from pageTypeScaffolder.ts
- [ ] 1.3 Extract `generateBlueprintContent(pageTypeName: string)` function
- [ ] 1.4 Extract `generateControllerContent(pageTypeName: string)` function
- [ ] 1.5 Extract `generateModelContent(pageTypeName: string)` function
- [ ] 1.6 Update `src/commands/pageTypeScaffolder.ts` to use new utility functions
- [ ] 1.7 Add tests for scaffolding template generators

## 2. File Name Mapping Utilities
- [ ] 2.1 Add `getTemplateNameFromBlueprint(blueprintPath: string): string` function to kirbyProject.ts
- [ ] 2.2 Add `getBlueprintNameFromTemplate(templatePath: string): string` function to kirbyProject.ts
- [ ] 2.3 Implement logic to handle nested Blueprint paths (e.g., `blog/post.yml` → `blog.post.php`)
- [ ] 2.4 Add `findMatchingTemplate(blueprintUri: vscode.Uri): vscode.Uri | null` helper
- [ ] 2.5 Add `findMatchingBlueprint(templateUri: vscode.Uri): vscode.Uri | null` helper
- [ ] 2.6 Write unit tests for name mapping functions with various edge cases

## 3. File System Watcher Implementation
- [ ] 3.1 Create `src/providers/blueprintTemplateSyncWatcher.ts` module
- [ ] 3.2 Implement `BlueprintTemplateSyncWatcher` class with activation/deactivation lifecycle
- [ ] 3.3 Create FileSystemWatcher for `**/site/blueprints/pages/**/*.yml` pattern
- [ ] 3.4 Create FileSystemWatcher for `**/site/templates/**/*.php` pattern
- [ ] 3.5 Implement debounce mechanism (500ms) for file creation events
- [ ] 3.6 Implement `onBlueprintCreated(uri: vscode.Uri)` handler
- [ ] 3.7 Implement `onTemplateCreated(uri: vscode.Uri)` handler
- [ ] 3.8 Add logic to check if counterpart file exists using mapping utilities

## 4. Synchronization Prompt UI
- [ ] 4.1 Implement `showBlueprintSyncPrompt(blueprintUri: vscode.Uri)` function
- [ ] 4.2 Create notification with action buttons: [Create Template] [Create Template + Controller + Model] [Don't ask again] [Dismiss]
- [ ] 4.3 Implement `showTemplateSyncPrompt(templateUri: vscode.Uri)` function
- [ ] 4.4 Create notification with action buttons: [Create Blueprint] [Don't ask again] [Dismiss]
- [ ] 4.5 Handle "Don't ask again" action by storing workspace state
- [ ] 4.6 Implement queue mechanism to prevent multiple concurrent notifications (max 1 active)

## 5. File Creation Logic
- [ ] 5.1 Implement `createTemplateFromBlueprint(blueprintUri: vscode.Uri, includeController: boolean, includeModel: boolean)` function
- [ ] 5.2 Use scaffolding utilities to generate template content with proper boilerplate
- [ ] 5.3 Implement `createBlueprintFromTemplate(templateUri: vscode.Uri)` function
- [ ] 5.4 Use scaffolding utilities to generate Blueprint content with basic structure
- [ ] 5.5 Handle file creation errors gracefully (permissions, disk space, etc.)
- [ ] 5.6 Display success notification after file creation with "Open File" action
- [ ] 5.7 Add option to automatically open newly created files in editor

## 6. Configuration Settings
- [ ] 6.1 Add `kirby.enableBlueprintTemplateSync` boolean setting to package.json (default: true)
- [ ] 6.2 Add `kirby.syncPromptBehavior` enum setting to package.json (options: "ask", "never", "always"; default: "ask")
- [ ] 6.3 Add `kirby.syncCreateController` boolean setting to package.json (default: false)
- [ ] 6.4 Add `kirby.syncCreateModel` boolean setting to package.json (default: false)
- [ ] 6.5 Add `kirby.syncIgnoreFolders` array setting to package.json (default: [])
- [ ] 6.6 Implement configuration validation in watcher to respect user preferences
- [ ] 6.7 Add configuration change listener to restart watchers when settings change

## 7. Workspace State Management
- [ ] 7.1 Implement workspace state storage for "Don't ask again" preferences
- [ ] 7.2 Store dismissed Blueprint/Template pairs using workspace state API
- [ ] 7.3 Implement `isDismissedForFile(fileUri: vscode.Uri): boolean` check
- [ ] 7.4 Add command to reset dismissed prompts: `kirby.resetSyncPrompts`
- [ ] 7.5 Implement command handler in `src/commands/resetSyncPrompts.ts`

## 8. Extension Lifecycle Integration
- [ ] 8.1 Update `src/extension.ts` activate() function to initialize BlueprintTemplateSyncWatcher
- [ ] 8.2 Add conditional logic to skip watcher initialization if `kirby.enableBlueprintTemplateSync` is false
- [ ] 8.3 Register watcher disposal in context.subscriptions for cleanup
- [ ] 8.4 Update deactivate() function to properly dispose of file watchers
- [ ] 8.5 Add "Kirby: Reset Sync Prompts" command to package.json and command palette

## 9. Testing
- [ ] 9.1 Create `src/test/blueprintTemplateSync.test.ts` test suite
- [ ] 9.2 Write test for Blueprint name to Template name mapping (flat structure)
- [ ] 9.3 Write test for nested Blueprint name mapping (e.g., `blog/post.yml` → `blog.post.php`)
- [ ] 9.4 Write test for Template name to Blueprint name reverse mapping
- [ ] 9.5 Write test for file watcher triggering on Blueprint creation
- [ ] 9.6 Write test for file watcher triggering on Template creation
- [ ] 9.7 Write test for debounce mechanism (multiple rapid file creations)
- [ ] 9.8 Write test for notification display and action button handling
- [ ] 9.9 Write test for "Don't ask again" workspace state persistence
- [ ] 9.10 Write test for file creation logic (Template generation)
- [ ] 9.11 Write test for file creation logic (Blueprint generation)
- [ ] 9.12 Write test for configuration setting behavior (`syncPromptBehavior: "never"`)
- [ ] 9.13 Write test for ignored folders configuration

## 10. Documentation
- [ ] 10.1 Update main README.md with Blueprint/Template Sync feature description
- [ ] 10.2 Add animated GIF/screenshot showing synchronization prompt in action
- [ ] 10.3 Document configuration settings with examples and use cases
- [ ] 10.4 Add FAQ section addressing common questions (disabling prompts, custom folders, etc.)
- [ ] 10.5 Update CHANGELOG.md with v0.4.0 release notes (or v0.5.0 if following API IntelliSense)

## 11. Validation and Release
- [ ] 11.1 Run full test suite (`npm test`) and ensure all tests pass
- [ ] 11.2 Manually test in real Kirby project: create Blueprint and verify prompt
- [ ] 11.3 Manually test creating Template and verify Blueprint prompt
- [ ] 11.4 Test "Don't ask again" functionality and workspace state persistence
- [ ] 11.5 Test with bulk file operations (git checkout) to verify debounce behavior
- [ ] 11.6 Test with `syncPromptBehavior: "always"` to verify auto-creation
- [ ] 11.7 Validate OpenSpec change with `openspec validate add-blueprint-template-sync --strict`
- [ ] 11.8 Create pull request and request code review
- [ ] 11.9 After merge, archive OpenSpec change with `openspec archive add-blueprint-template-sync`
