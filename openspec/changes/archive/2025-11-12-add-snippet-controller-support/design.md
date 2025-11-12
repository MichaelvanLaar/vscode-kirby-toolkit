# Design Document: Snippet Controller Support

## Context

The Kirby Snippet Controller plugin by Lukas Kleinschmidt is a popular community plugin that enables developers to separate logic from presentation in snippets by creating controller files alongside snippet templates. These controllers follow the naming convention `{snippet-name}.controller.php` and are placed in the `site/snippets/` directory.

**Key characteristics of Snippet Controllers:**
- Naming: `header.controller.php` for `header.php` snippet
- Location: Same directory as snippet (supports nested snippets)
- Purpose: Prepare data and control flow before snippet rendering
- API: Can return arrays, closures, or use file-based approach
- Integration: Works seamlessly with Kirby's snippet system

**Current VS Code Extension Capabilities:**
- Snippet navigation via CodeLens and Definition providers
- Type-hint injection for templates and snippets
- File navigation between templates/controllers/models
- No current awareness of snippet controllers

## Goals / Non-Goals

### Goals
1. Enable snippet-controller navigation similar to existing template-controller navigation
2. Provide type-hint injection for snippet controller files
3. Extend snippet navigation to show both snippet and controller options
4. Detect plugin presence and gracefully degrade when not installed
5. Maintain backward compatibility with existing snippet features
6. Follow established patterns from template/controller navigation

### Non-Goals
1. Parsing controller return values to detect custom variables (future enhancement)
2. Supporting custom controller naming patterns (only default `.controller.php` pattern)
3. Analyzing controller logic or providing controller-specific IntelliSense
4. Supporting controllers in custom snippet directories (only default `site/snippets/`)
5. Generating controller files from snippets (out of scope for this change)

## Decisions

### Decision 1: Plugin Detection Strategy

**Decision:** Detect Snippet Controller plugin via two methods:
1. Check `composer.json` for `lukaskleinschmidt/kirby-snippet-controller` dependency
2. Check for `site/plugins/kirby-snippet-controller/` directory (manual installation)

**Rationale:**
- Composer is the standard installation method → check composer.json first
- Some users install plugins manually → also check site/plugins/
- Both checks are fast filesystem operations
- Cache detection result to avoid repeated checks

**Alternatives considered:**
- Only check composer.json → Misses manual installations
- Only check site/plugins/ → Misses composer-installed plugins in vendor/
- Check Kirby's plugin registry at runtime → Requires PHP execution (not possible in VS Code extension)

**Implementation:**
```typescript
// Cache the detection result for performance
let snippetControllerPluginDetected: boolean | undefined;

export function isSnippetControllerPluginInstalled(): boolean {
  if (snippetControllerPluginDetected !== undefined) {
    return snippetControllerPluginDetected;
  }

  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    snippetControllerPluginDetected = false;
    return false;
  }

  // Check composer.json
  const composerPath = path.join(workspaceRoot, 'composer.json');
  if (fs.existsSync(composerPath)) {
    const composerContent = fs.readFileSync(composerPath, 'utf8');
    if (composerContent.includes('lukaskleinschmidt/kirby-snippet-controller')) {
      snippetControllerPluginDetected = true;
      return true;
    }
  }

  // Check site/plugins directory
  const pluginPath = path.join(workspaceRoot, 'site/plugins/kirby-snippet-controller');
  if (fs.existsSync(pluginPath)) {
    snippetControllerPluginDetected = true;
    return true;
  }

  snippetControllerPluginDetected = false;
  return false;
}
```

### Decision 2: Controller File Naming Pattern

**Decision:** Only support the default `.controller.php` naming pattern, matching the plugin's default behavior.

**Rationale:**
- The plugin's default naming resolver uses `{snippet-name}.controller.php`
- While the plugin allows custom naming resolvers, these are rare in practice
- Supporting custom patterns would require parsing Kirby config.php (complex and unreliable)
- Can be extended later if user demand justifies the complexity

**Alternatives considered:**
- Support custom naming patterns via extension settings → Adds configuration complexity without clear benefit
- Parse config.php to detect custom resolvers → Too complex, requires PHP parsing
- Ask users to configure controller pattern → Violates zero-configuration principle

### Decision 3: Navigation Behavior for snippet() Calls

**Decision:** When a snippet has both `.php` and `.controller.php` files, show both as navigation targets via Definition Provider and separate CodeLens links.

**Rationale:**
- Users often need to navigate to either file depending on task
- VS Code's Definition Provider naturally supports multiple targets
- CodeLens can show both "Open Snippet" and "Open Controller" links
- Matches existing template navigation behavior (templates can navigate to controllers/models)

**Implementation:**
- `snippetDefinition.ts`: Return array of Locations when both files exist
- `snippetCodeLens.ts`: Show two CodeLens items when controller exists
- F12 (Go-to-Definition): Shows picker when multiple targets
- Ctrl+Click: Opens first target (snippet.php) or shows picker

**Example CodeLens display:**
```php
// When both header.php and header.controller.php exist:
// CodeLens: [Open Snippet] [Open Controller]
snippet('header');
```

### Decision 4: File Navigation Pattern

**Decision:** Implement bidirectional navigation between snippets and controllers using the same pattern as template/controller navigation.

**Rationale:**
- Consistent user experience with existing template/controller navigation
- CodeLens at top of file for quick access
- Definition Provider (F12) for keyboard-driven workflow
- Leverages existing `FileNavigationProvider` and `FileNavigationCodeLens` infrastructure

**Implementation:**
```typescript
// In FileNavigationDefinitionProvider
if (isSnippetFile(filePath)) {
  const controllerPath = resolveSnippetControllerPath(getSnippetName(filePath));
  if (controllerPath && snippetControllerExists(getSnippetName(filePath))) {
    locations.push(new vscode.Location(Uri.file(controllerPath), new Position(0, 0)));
  }
}

if (isSnippetControllerFile(filePath)) {
  const snippetPath = resolveSnippetFromController(filePath);
  if (snippetPath && snippetExists(getSnippetName(filePath))) {
    locations.push(new vscode.Location(Uri.file(snippetPath), new Position(0, 0)));
  }
}
```

### Decision 5: Type-Hint Injection for Controllers

**Decision:** Inject the same standard Kirby type-hints (`$page`, `$site`, `$kirby`) for snippet controllers as we do for templates and snippets.

**Rationale:**
- Snippet controllers have access to the same global Kirby variables
- Controllers may receive additional variables via the snippet's `data` parameter, but detecting these requires runtime analysis
- Standard type-hints provide immediate value
- Advanced variable detection can be added as future enhancement

**Future Enhancement Opportunity:**
- Parse snippet() call sites to detect data parameter variables
- Inject additional type-hints based on detected variables
- Requires cross-file analysis and is complex to implement reliably

### Decision 6: Configuration Strategy

**Decision:** Add single master switch `kirby.enableSnippetControllers` (default: true) to control all controller features.

**Rationale:**
- Simple mental model: one setting controls all controller features
- Existing CodeLens settings apply to controller CodeLens as well
- Users who don't use Snippet Controller plugin can disable all features
- Minimal configuration overhead

**Configuration hierarchy:**
```
kirby.enableSnippetControllers = false → All controller features disabled
kirby.enableSnippetControllers = true:
  ├─ kirby.showSnippetCodeLens = false → No CodeLens for snippets or controllers
  ├─ kirby.showFileNavigationCodeLens = false → No CodeLens for file navigation
  ├─ kirby.autoInjectTypeHints = false → No type-hints for any files
  └─ All enabled → Full controller support
```

### Decision 7: Security Considerations

**Decision:** Apply the same path traversal protection to controller paths as existing snippet path handling.

**Rationale:**
- Controllers are resolved using snippet names (same input vector)
- Must prevent malicious snippet names from accessing files outside snippets directory
- Reuse existing `sanitizeSnippetName()` and validation logic

**Security Measures:**
- All snippet names sanitized before controller path resolution
- No absolute paths allowed
- No parent directory references (`../`) allowed
- Directory boundary validation ensures paths stay within `site/snippets/`
- Comprehensive security tests for controller paths

## Risks / Trade-offs

### Risk 1: Plugin Detection False Negatives
**Risk:** Plugin installed but not detected (e.g., installed via symlink, non-standard structure)

**Mitigation:**
- Provide `kirby.enableSnippetControllers` setting to manually enable features
- Document detection mechanism in README
- Log detection attempts for debugging

**Trade-off:** Accepting some false negatives to avoid complex detection heuristics

### Risk 2: Performance Impact
**Risk:** Plugin detection and controller resolution adds overhead to extension activation and file operations

**Mitigation:**
- Cache plugin detection result (single check per session)
- Lazy controller path resolution (only when needed)
- Performance tests to verify <500ms activation time maintained

**Trade-off:** Slight increase in initial detection time acceptable for improved functionality

### Risk 3: Custom Naming Patterns Not Supported
**Risk:** Users with custom controller naming resolvers won't get full support

**Mitigation:**
- Document limitation in README
- Provide escape hatch: users can still use standard file navigation
- Can be extended later if demand exists

**Trade-off:** Simplicity and zero-configuration vs. edge case support

### Risk 4: Breaking Changes to Template/Controller Navigation
**Risk:** Adding snippet-controller navigation might interfere with existing template/controller navigation

**Mitigation:**
- Use clear file type detection (template vs snippet vs controller)
- Separate code paths for different file types
- Comprehensive regression tests for existing features

**Trade-off:** None - careful implementation prevents breaking changes

## Migration Plan

### Rollout Strategy
1. **Phase 1: Core Infrastructure** (tasks 1.x)
   - Add detection and path resolution functions
   - Full test coverage before proceeding

2. **Phase 2: Feature Integration** (tasks 2.x-4.x)
   - Integrate with existing providers
   - Parallel development possible

3. **Phase 3: Documentation & QA** (tasks 6.x-8.x)
   - Update documentation
   - Integration testing
   - Performance validation

### Backward Compatibility
- All existing features continue to work unchanged
- New features only activate when plugin detected or manually enabled
- No configuration changes required for existing users
- Graceful degradation when plugin not installed

### Testing Strategy
- Unit tests for all new utility functions
- Integration tests for each provider modification
- Security tests for controller path handling
- Performance tests to verify activation time
- Manual testing with real Kirby projects (with and without plugin)

### Rollback Plan
If critical issues discovered:
1. Disable feature via configuration: `kirby.enableSnippetControllers = false`
2. Hotfix release reverting problematic code
3. Plugin detection failure fails safe (no controller features)

## Open Questions

### Q1: Should we support snippet controllers in custom snippet directories?
**Status:** Deferred to future enhancement

**Discussion:** The Snippet Controller plugin supports custom snippet directories configured in config.php. Supporting this would require:
- Parsing Kirby config.php (complex)
- Detecting custom 'snippets' path configuration
- May not be widely used in practice

**Decision:** Not in scope for initial implementation. Can be added later if user feedback indicates demand.

### Q2: Should we analyze controller return values to inject additional type-hints?
**Status:** Deferred to future enhancement

**Discussion:** Controllers can return arrays or closures that define additional variables available to snippets. Detecting these would provide more accurate type-hints.

**Challenges:**
- Requires PHP AST parsing or runtime analysis
- Controllers can use complex logic, callbacks, Kirby API calls
- Return values may be conditional
- Significant implementation complexity

**Decision:** Start with standard Kirby global type-hints. Add advanced variable detection in future version if demand exists.

### Q3: Should we provide snippets for creating controller files?
**Status:** Out of scope

**Discussion:** Could add VS Code snippet templates for common controller patterns (array return, callback, etc.)

**Decision:** Not directly related to navigation/type-hints. Could be separate enhancement or user can create own snippets.

### Q4: How to handle controllers without corresponding snippets?
**Status:** Resolved - treat as valid controller files

**Discussion:** Controllers can exist without snippets (controller might prevent rendering via `snippet_prevent()`).

**Decision:** Recognize as valid controller file, inject type-hints, but don't show CodeLens for "Open Snippet" if snippet doesn't exist.
