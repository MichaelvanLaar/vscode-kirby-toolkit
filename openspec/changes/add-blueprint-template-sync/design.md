# Design: Blueprint/Template Synchronization

## Context

Kirby CMS requires both a Blueprint (content structure definition) and a Template (rendering logic) for each page type, but these files are created independently. Developers often create one without the other, leading to:
- **Runtime errors**: Template not found errors when content editors create pages
- **Incomplete features**: Blueprints without templates result in blank pages
- **Manual tracking overhead**: Developers must remember to create both files

The extension already has a "New Page Type" scaffolder that creates all files together, but this doesn't help when developers create files manually via VS Code's file explorer or external tools.

**Key constraints:**
- Must not interfere with existing workflows (opt-in or easily dismissible)
- Should work with files created via any method (VS Code UI, terminal, git operations, etc.)
- Cannot assume developers always want both files (some edge cases: reusing templates, testing, etc.)
- Must handle nested Blueprint structures (e.g., `site/blueprints/pages/blog/article.yml`)

**Stakeholders:**
- Extension users: Want faster setup without forgetting files
- Extension maintainers: Need a simple, reliable implementation that doesn't require complex state management

## Goals / Non-Goals

**Goals:**
- Detect when a Blueprint is created without a matching Template and prompt to create it
- Detect when a Template is created without a matching Blueprint and prompt to create it
- Offer to create optional Controller and Model files when creating a Template
- Support nested Blueprint structures (e.g., `blog/article.yml` → `blog.article.php` template)
- Allow users to dismiss prompts permanently (per workspace or globally)
- Integrate with existing scaffolding commands to reuse boilerplate generation logic

**Non-Goals:**
- Automatically creating files without user confirmation (too intrusive)
- Bidirectional synchronization of file renames/deletes (complex, error-prone)
- Enforcing Blueprint/Template parity (developers may intentionally have mismatches)
- Supporting custom file naming conventions beyond Kirby's standard patterns
- Real-time validation that Blueprint fields match Template usage

## Decisions

### Decision 1: Detection Mechanism - FileSystemWatcher

**What:** Use VS Code's `vscode.workspace.createFileSystemWatcher()` API to monitor file creation events in `site/blueprints/pages/` and `site/templates/` directories.

**Why:**
- Native VS Code API designed for this exact use case
- Automatically handles file creation via any method (UI, CLI, git, etc.)
- Minimal performance overhead (event-driven, not polling)
- Easy to set up and tear down with extension lifecycle

**Alternatives considered:**
1. **Polling directories periodically** - Check for new files every few seconds
   - *Rejected*: Inefficient, high CPU usage, delayed detection
2. **Intercept VS Code file creation commands** - Hook into `workbench.action.files.newFile`
   - *Rejected*: Only works for files created via VS Code UI, misses terminal/git operations
3. **Language Server Protocol file watching** - Use LSP's file watching capabilities
   - *Rejected*: Overkill for simple file creation detection, requires LSP implementation

### Decision 2: User Notification Mechanism - Quick Pick

**What:** Display a `vscode.window.showInformationMessage()` notification with action buttons when a mismatch is detected:

```
📄 Blueprint 'article.yml' created without a template. Create 'article.php'?
[Create Template] [Create Template + Controller] [Don't ask again] [Dismiss]
```

**Why:**
- Non-intrusive (notification appears in bottom-right corner)
- Allows quick action without interrupting workflow
- Multiple action buttons provide flexibility (Template-only, Template+Controller, etc.)
- "Don't ask again" respects user preference

**Alternatives considered:**
1. **CodeLens action** - Display "Create Template" link in Blueprint editor
   - *Rejected*: Requires opening the file, less discoverable for externally created files
2. **Modal dialog** - Use `vscode.window.showQuickPick()` with forced interaction
   - *Rejected*: Too intrusive, blocks workflow
3. **Status bar item** - Add persistent indicator in status bar
   - *Rejected*: Clutters UI, easy to miss

### Decision 3: File Name Mapping Rules

**What:** Implement deterministic mapping between Blueprint and Template names:

| Blueprint Path                          | Template Path                |
|-----------------------------------------|------------------------------|
| `site/blueprints/pages/article.yml`     | `site/templates/article.php` |
| `site/blueprints/pages/blog/post.yml`   | `site/templates/blog.post.php` |
| `site/blueprints/pages/home.yml`        | `site/templates/home.php`    |

**Why:**
- Follows Kirby's standard file naming conventions
- Predictable behavior for developers
- Handles nested Blueprints with dot notation

**Edge cases handled:**
- Blueprint with no matching template (prompt to create)
- Template with no matching Blueprint (prompt to create)
- Blueprint in non-standard location (skip detection for now, out of scope)

### Decision 4: Synchronization Timing

**What:** Trigger synchronization prompt immediately after file creation is detected (within 500ms debounce window).

**Why:**
- Fresh in developer's mind (just created the file)
- Allows inline correction before switching tasks
- Avoids accumulating multiple prompts (debounce handles rapid file creation)

**Implementation:**
```typescript
const debounceTimers = new Map<string, NodeJS.Timeout>();

function onFileCreated(uri: vscode.Uri) {
  const key = uri.fsPath;
  if (debounceTimers.has(key)) {
    clearTimeout(debounceTimers.get(key)!);
  }

  debounceTimers.set(key, setTimeout(() => {
    checkForMissingCounterpart(uri);
    debounceTimers.delete(key);
  }, 500));
}
```

**Alternatives considered:**
1. **Delayed batch processing** - Queue detections and process every 5 seconds
   - *Rejected*: Too slow, loses context
2. **Immediate processing (no debounce)** - Trigger on every file event
   - *Rejected*: Multiple prompts if files are copied in bulk (e.g., git checkout)

### Decision 5: Configuration Settings

**What:** Add settings to control synchronization behavior:

```json
{
  "kirby.enableBlueprintTemplateSync": true,  // Master toggle
  "kirby.syncPromptBehavior": "ask",          // "ask" | "never" | "always" (auto-create)
  "kirby.syncCreateController": false,        // Also create controller by default
  "kirby.syncCreateModel": false,             // Also create model by default
  "kirby.syncIgnoreFolders": []               // Exclude specific folders from sync detection
}
```

**Why:**
- `enableBlueprintTemplateSync`: Allows complete opt-out
- `syncPromptBehavior`:
  - `"ask"` (default): Show notification with action buttons
  - `"never"`: Disable prompts (useful if users find them annoying)
  - `"always"`: Auto-create files without prompting (power user mode)
- `syncCreateController/Model`: Default behavior for additional files
- `syncIgnoreFolders`: Exclude specific patterns (e.g., `["test/", "archive/"]`)

### Decision 6: Integration with Page Type Scaffolder

**What:** Refactor `pageTypeScaffolder.ts` to extract reusable file generation logic into utility functions, then reuse these in the synchronization watcher.

**Why:**
- Avoid code duplication (DRY principle)
- Consistent boilerplate generation across features
- Easier maintenance (single source of truth for templates)

**Refactoring plan:**
1. Extract `generateTemplateContent()` function to `src/utils/scaffoldingTemplates.ts`
2. Extract `generateBlueprintContent()` function
3. Extract `generateControllerContent()` and `generateModelContent()`
4. Update `pageTypeScaffolder.ts` to use these utilities
5. Use same utilities in `blueprintTemplateSyncWatcher.ts`

## Risks / Trade-offs

### Risk 1: Notification Fatigue
**Risk:** Users may find frequent prompts annoying, especially when creating multiple files or experimenting.

**Mitigation:**
- Debounce file creation events (500ms) to avoid multiple prompts during bulk operations
- Provide "Don't ask again" option that persists per workspace
- Make feature easily disableable via `kirby.enableBlueprintTemplateSync` setting
- Consider adding a workspace state flag: "dismissed for this file" to avoid re-prompting on extension reload

### Risk 2: False Positives
**Risk:** Detecting mismatches when developers intentionally create only one file type (e.g., reusing existing template).

**Mitigation:**
- Use "Dismiss" button for one-time dismissals (no permanent state change)
- Don't enforce parity (prompts are suggestions, not requirements)
- Add `syncIgnoreFolders` setting for excluding specific directories
- Consider a "Kirby template intentionally not used" comment pattern in Blueprint to skip detection

### Risk 3: Bulk File Operations
**Risk:** Git operations (checkout, merge) may trigger multiple prompts simultaneously.

**Mitigation:**
- Debounce file creation events (500ms window)
- Queue multiple detections and show a single "Multiple files detected" notification:
  ```
  📄 3 Blueprints created without templates. Review sync suggestions?
  [Open Sync Panel] [Dismiss All]
  ```
- Limit concurrent notifications to 1 active prompt at a time

### Risk 4: Custom Kirby Configurations
**Risk:** Projects with custom `site/` directory names or non-standard Blueprint locations won't be detected.

**Mitigation:**
- Initial implementation (v0.4.0) supports standard Kirby structure only
- Document limitation in README
- Future enhancement: Read Kirby config files to detect custom paths (Phase 2)

## Migration Plan

**Phase 1: Initial Implementation (v0.4.0)**
1. Implement file system watchers for standard Kirby directories
2. Add name mapping logic for Blueprints ↔ Templates
3. Display notification prompts with action buttons
4. Create missing files using refactored scaffolding utilities
5. Add configuration settings for enabling/disabling feature
6. Write comprehensive tests for detection and file creation logic

**Phase 2: Enhanced Features (v0.5.0)**
1. Support bulk file detection with "Sync Panel" UI
2. Add support for custom Kirby directory configurations
3. Implement "Review sync suggestions" command for manual checking
4. Add telemetry to understand feature usage and optimize UX

**Phase 3: Bidirectional Sync (v0.6.0)**
1. Detect file renames and offer to rename counterpart
2. Detect file deletions and warn about orphaned files
3. Add "Sync All" command to audit entire project

**Rollback Plan:**
- If feature causes critical issues, provide hotfix that sets `kirby.enableBlueprintTemplateSync` to false by default
- Users can manually disable via settings
- No data loss risk (feature only creates new files, never modifies/deletes existing ones)

## Open Questions

1. **Notification Persistence:** Should dismissed notifications be remembered across VS Code restarts?
   - *Proposed answer*: Yes, use workspace state API to persist "Don't ask again" choices per workspace

2. **Template Reuse Detection:** How to handle cases where multiple Blueprints intentionally share one Template?
   - *Proposed answer*: Phase 1 doesn't detect this; Phase 2 could parse Blueprint YAML for `template: other-template` field

3. **Multi-Root Workspaces:** How should feature behave in VS Code multi-root workspaces with multiple Kirby projects?
   - *Proposed answer*: Each workspace folder is monitored independently; notifications are scoped to the relevant folder

4. **Performance with Large Projects:** What happens in projects with hundreds of Blueprints?
   - *Proposed answer*: FileSystemWatcher is efficient; debouncing prevents spam; test with large sample projects during development
