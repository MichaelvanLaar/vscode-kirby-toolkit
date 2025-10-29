# Implementation Tasks: Kirby API IntelliSense

## 1. Initial Setup and Infrastructure
- [ ] 1.1 Create `src/stubs/kirby-api/` directory structure matching Kirby's namespace organization
- [ ] 1.2 Research Kirby 4.0 API documentation and identify core classes to stub (Page, Site, File, User, Kirby, Field types)
- [ ] 1.3 Create README.md in `src/stubs/` documenting stub generation process and maintenance guidelines
- [ ] 1.4 Update `.gitignore` to exclude generated stub directories (`.vscode/kirby-stubs/`)

## 2. PHP Stub Generation
- [ ] 2.1 Generate `src/stubs/kirby-api/Cms/Page.php` with Page class methods (title(), children(), parent(), etc.) and PHPDoc
- [ ] 2.2 Generate `src/stubs/kirby-api/Cms/Site.php` with Site class methods (children(), find(), pages(), etc.)
- [ ] 2.3 Generate `src/stubs/kirby-api/Cms/File.php` with File class methods (url(), filename(), type(), etc.)
- [ ] 2.4 Generate `src/stubs/kirby-api/Cms/User.php` with User class methods (email(), role(), permissions(), etc.)
- [ ] 2.5 Generate `src/stubs/kirby-api/Cms/Kirby.php` with Kirby class methods (users(), site(), option(), etc.)
- [ ] 2.6 Generate Field type stubs (TextField, EmailField, etc.) with common field methods (value(), isEmpty(), etc.)
- [ ] 2.7 Create namespace and autoloader stub file `src/stubs/kirby-api/kirby-core.php`

## 3. Intelephense Integration Module
- [ ] 3.1 Create `src/integrations/intelephenseIntegration.ts` with IntelephenseIntegration class
- [ ] 3.2 Implement `detectIntelephense()` method to check if Intelephense extension is installed
- [ ] 3.3 Implement `initializeStubs()` method to copy stubs from `src/stubs/` to `.vscode/kirby-stubs/`
- [ ] 3.4 Implement `configureIntelephense()` method to update workspace settings with stub path
- [ ] 3.5 Implement `cleanupStubs()` method to remove `.vscode/kirby-stubs/` directory (for future cleanup command)
- [ ] 3.6 Add error handling for file system operations and permission issues
- [ ] 3.7 Implement gitignore update logic to automatically add `.vscode/kirby-stubs/` to project's `.gitignore`

## 4. Configuration and Settings
- [ ] 4.1 Add `kirby.enableApiIntelliSense` boolean setting to `package.json` (default: true)
- [ ] 4.2 Add `kirby.kirbyVersion` string setting to `package.json` (default: "4.0")
- [ ] 4.3 Add `kirby.customStubsPath` string setting to `package.json` (default: "")
- [ ] 4.4 Create `src/config/intelephenseSettings.ts` helper for managing IntelliSense-related configuration
- [ ] 4.5 Add configuration change listener to reinitialize stubs when settings change

## 5. Extension Lifecycle Integration
- [ ] 5.1 Update `src/extension.ts` activate() function to initialize IntelephenseIntegration
- [ ] 5.2 Add conditional logic to skip stub initialization if `kirby.enableApiIntelliSense` is false
- [ ] 5.3 Implement graceful degradation message when Intelephense is not installed (one-time informational notification)
- [ ] 5.4 Add Intelephense to `extensionDependencies` in `package.json` as optional dependency
- [ ] 5.5 Update deactivate() function to optionally clean up stubs (based on user setting)

## 6. Commands
- [ ] 6.1 Add `kirby.removeApiStubs` command to `package.json` for manual stub cleanup
- [ ] 6.2 Implement command handler in `src/commands/removeApiStubs.ts`
- [ ] 6.3 Add `kirby.reinstallApiStubs` command to force stub regeneration
- [ ] 6.4 Implement command handler in `src/commands/reinstallApiStubs.ts`

## 7. Testing
- [ ] 7.1 Create `src/test/intelephenseIntegration.test.ts` test suite
- [ ] 7.2 Write test for Intelephense extension detection logic
- [ ] 7.3 Write test for stub file copying to workspace directory
- [ ] 7.4 Write test for workspace settings.json update with stub path
- [ ] 7.5 Write test for graceful degradation when Intelephense is not installed
- [ ] 7.6 Write test for gitignore update logic
- [ ] 7.7 Write test for cleanup command execution
- [ ] 7.8 Write integration test verifying stubs are indexed by Intelephense (if possible in test environment)

## 8. Documentation
- [ ] 8.1 Update main README.md with new feature description and Intelephense setup instructions
- [ ] 8.2 Add troubleshooting section for common issues (Intelephense not detecting stubs, conflicts, etc.)
- [ ] 8.3 Create animated GIF/screenshot showing API IntelliSense in action for README
- [ ] 8.4 Document configuration settings in README with examples
- [ ] 8.5 Update CHANGELOG.md with v0.4.0 release notes

## 9. Build and Packaging
- [ ] 9.1 Update `package.json` scripts to copy stub files to `out/stubs/` during compilation
- [ ] 9.2 Modify `copy-schemas` script to also copy stubs: `npm run copy-stubs`
- [ ] 9.3 Update `vscode:prepublish` script to include stub copying
- [ ] 9.4 Verify packaged .vsix file includes stub files in correct location

## 10. Validation and Release
- [ ] 10.1 Run full test suite (`npm test`) and ensure all 179+ tests pass
- [ ] 10.2 Manually test in real Kirby project: verify stub copying, Intelephense integration, autocompletion
- [ ] 10.3 Test with Intelephense disabled to verify graceful degradation
- [ ] 10.4 Test cleanup commands and verify stubs are removed correctly
- [ ] 10.5 Validate OpenSpec change with `openspec validate add-kirby-api-intellisense --strict`
- [ ] 10.6 Create pull request and request code review
- [ ] 10.7 After merge, archive OpenSpec change with `openspec archive add-kirby-api-intellisense`
