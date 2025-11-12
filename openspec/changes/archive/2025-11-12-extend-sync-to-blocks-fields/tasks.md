# Implementation Tasks

## 1. Configuration and Settings

- [ ] 1.1 Add new configuration properties to `package.json`:
  - `kirby.syncBlockSnippets` (boolean, default: true)
  - `kirby.syncFieldSnippets` (boolean, default: false)
  - `kirby.syncBlockNestingStrategy` (enum: "auto" | "flat" | "nested", default: "auto")
- [ ] 1.2 Add getter methods to `src/config/settings.ts`:
  - `getSyncBlockSnippets()`
  - `getSyncFieldSnippets()`
  - `getSyncBlockNestingStrategy()`
- [ ] 1.3 Update settings.ts JSDoc comments to document new settings

## 2. Utility Functions for Block and Field Detection

- [ ] 2.1 Add block detection functions to `src/utils/kirbyProject.ts`:
  - `isBlockBlueprintFile(filePath: string): boolean`
  - `isBlockSnippetFile(filePath: string): boolean`
- [ ] 2.2 Add field detection functions to `src/utils/kirbyProject.ts`:
  - `isFieldBlueprintFile(filePath: string): boolean`
  - `isFieldSnippetFile(filePath: string): boolean`
- [ ] 2.3 Add nesting strategy detection:
  - `detectBlockNestingStrategy(workspaceRoot: string): 'flat' | 'nested'`
  - Scan existing block snippets to infer structure
- [ ] 2.4 Add block/field name mapping functions:
  - `getBlockSnippetNameFromBlueprint(blueprintPath: string, strategy: string): string | null`
  - `getBlockBlueprintNameFromSnippet(snippetPath: string): string | null`
  - `getFieldSnippetNameFromBlueprint(blueprintPath: string, strategy: string): string | null`
- [ ] 2.5 Add block/field counterpart file search:
  - `findMatchingBlockSnippet(blueprintUri: vscode.Uri): string | null`
  - `findMatchingBlockBlueprint(snippetUri: vscode.Uri): string | null`
  - `findMatchingFieldSnippet(blueprintUri: vscode.Uri): string | null`
- [ ] 2.6 Add comprehensive unit tests for all new utility functions

## 3. Boilerplate Content Generators

- [ ] 3.1 Add `generateBlockSnippetContent(blockName: string): string` to `src/utils/scaffoldingTemplates.ts`:
  - Include PHP opening tag
  - Add HTML structure comment
  - Reference `$block` variable
  - Include example field access
- [ ] 3.2 Add `generateBlockBlueprintContent(blockName: string): string`:
  - Include `name`, `icon` fields
  - Add `fields` section with placeholder
- [ ] 3.3 Add `generateFieldSnippetContent(fieldName: string): string`:
  - Include PHP opening tag
  - Add HTML structure comment
  - Reference `$field` variable
  - Include example field value rendering
- [ ] 3.4 Add unit tests for all boilerplate generators

## 4. Extend BlueprintTemplateSyncWatcher Class

- [ ] 4.1 Add block file system watchers to `activate()` method:
  - `**/site/blueprints/blocks/**/*.yml`
  - `**/site/snippets/blocks/**/*.php`
  - Conditional activation based on `kirby.syncBlockSnippets` setting
- [ ] 4.2 Add field file system watchers to `activate()` method:
  - `**/site/blueprints/fields/**/*.yml`
  - Conditional activation based on `kirby.syncFieldSnippets` setting (no snippet watcher - blueprint-first only)
- [ ] 4.3 Extend `handleFileCreation()` to detect file type:
  - Add logic to differentiate between page, block, and field files
  - Route to appropriate handler methods
- [ ] 4.4 Add block-specific handler methods:
  - `onBlockBlueprintCreated(blueprintUri: vscode.Uri): Promise<void>`
  - `onBlockSnippetCreated(snippetUri: vscode.Uri): Promise<void>`
- [ ] 4.5 Add field-specific handler methods:
  - `onFieldBlueprintCreated(blueprintUri: vscode.Uri): Promise<void>`
- [ ] 4.6 Extend `showBlueprintSyncPrompt()` to handle blocks and fields:
  - Detect file type from URI
  - Customize notification messages per type
  - Use appropriate action buttons (no Controller/Model for blocks/fields)
- [ ] 4.7 Extend `showTemplateSyncPrompt()` to handle block snippets:
  - Support reverse sync (snippet → blueprint) for blocks
- [ ] 4.8 Add block snippet creation method:
  - `createBlockSnippetFromBlueprint(blueprintUri: vscode.Uri): Promise<void>`
  - Implement nesting strategy logic (auto-detect or use setting)
  - Use `generateBlockSnippetContent()` for boilerplate
- [ ] 4.9 Add block blueprint creation method:
  - `createBlockBlueprintFromSnippet(snippetUri: vscode.Uri): Promise<void>`
  - Support both flat and nested structures
  - Use `generateBlockBlueprintContent()` for boilerplate
- [ ] 4.10 Add field snippet creation method:
  - `createFieldSnippetFromBlueprint(blueprintUri: vscode.Uri): Promise<void>`
  - Use `generateFieldSnippetContent()` for boilerplate
- [ ] 4.11 Update `deactivate()` to dispose of all new watchers

## 5. Testing

- [ ] 5.1 Extend `src/test/blueprintTemplateSync.test.ts` with block tests:
  - Test flat block structure mapping
  - Test nested block structure mapping
  - Test block blueprint creation detection
  - Test block snippet creation detection
  - Test bidirectional block synchronization
  - Test nesting strategy auto-detection
  - Test block synchronization with setting disabled
  - Test block files in ignored folders
- [ ] 5.2 Add field synchronization tests:
  - Test field blueprint creation detection
  - Test field snippet creation (blueprint-first only)
  - Test field synchronization with setting disabled (default)
  - Test field synchronization with setting enabled
- [ ] 5.3 Add nesting strategy tests:
  - Test "auto" mode with flat existing files
  - Test "auto" mode with nested existing files
  - Test "auto" mode with no existing files (fallback to nested)
  - Test "flat" mode override
  - Test "nested" mode override
- [ ] 5.4 Add integration tests for configuration changes:
  - Test enabling/disabling block sync via settings
  - Test enabling/disabling field sync via settings
  - Test changing nesting strategy via settings
- [ ] 5.5 Add boilerplate content tests:
  - Verify block snippet boilerplate structure
  - Verify block blueprint boilerplate structure
  - Verify field snippet boilerplate structure
- [ ] 5.6 Add user preference persistence tests:
  - Test "Don't ask again" for blocks
  - Test "Don't ask again" for fields
  - Test reset command includes blocks and fields
- [ ] 5.7 Ensure all new tests pass and maintain >80% code coverage

## 6. Documentation

- [ ] 6.1 Update README.md with new synchronization capabilities:
  - Document block synchronization feature
  - Document field synchronization feature (opt-in)
  - Explain nesting strategy behavior
  - Add configuration settings documentation
- [ ] 6.2 Update CHANGELOG.md with feature additions
- [ ] 6.3 Add JSDoc comments to all new functions and methods
- [ ] 6.4 Update extension description in package.json if needed

## 7. Manual Testing and Validation

- [ ] 7.1 Test block synchronization in real Kirby project:
  - Create block blueprint, verify snippet prompt
  - Create block snippet, verify blueprint prompt
  - Test both flat and nested structures
  - Verify auto-detection works correctly
- [ ] 7.2 Test field synchronization in real Kirby project:
  - Enable field sync setting
  - Create field blueprint, verify snippet prompt
  - Create field snippet, verify no prompt (blueprint-first only)
- [ ] 7.3 Test configuration settings:
  - Disable block sync, verify no prompts
  - Enable field sync, verify prompts appear
  - Change nesting strategy, verify mapping changes
- [ ] 7.4 Test edge cases:
  - Create files in ignored folders
  - Create files during git operations
  - Test with existing counterpart files
  - Test "Don't ask again" and reset functionality
- [ ] 7.5 Verify backward compatibility:
  - Ensure page template synchronization still works
  - Verify existing settings and preferences are preserved
  - Test with existing projects (no breaking changes)

## 8. Pre-Release Checklist

- [ ] 8.1 Run full test suite: `npm test`
- [ ] 8.2 Run linter: `npm run lint`
- [ ] 8.3 Build extension: `npm run compile`
- [ ] 8.4 Test in clean VS Code environment
- [ ] 8.5 Verify no security vulnerabilities: `npm audit`
- [ ] 8.6 Update version number in package.json (following semver)
- [ ] 8.7 Create git commit with conventional commit message
- [ ] 8.8 Tag release and update GitHub release notes
