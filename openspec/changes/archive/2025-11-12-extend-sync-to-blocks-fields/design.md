# Design: Extend Blueprint/Template Synchronization to Blocks and Fields

## Context

The existing `BlueprintTemplateSyncWatcher` class monitors `site/blueprints/pages/` and `site/templates/` for file creation events and prompts users to create counterpart files. This proposal extends the same pattern to blocks and fields, which follow similar blueprint ↔ snippet relationships but with different directory structures and use cases.

**Constraints:**
- Must maintain backward compatibility with existing page template synchronization
- Should reuse existing patterns (file watchers, debouncing, notification UI, user preferences)
- Block snippets are typically required (high adoption expected), while field snippets are optional (opt-in recommended)
- Kirby supports both flat (dot notation) and nested directory structures for organizing blocks and fields

**Stakeholders:**
- Kirby CMS developers using blocks in layout fields (high value)
- Developers creating custom reusable field groups (moderate value, niche use case)

## Goals / Non-Goals

**Goals:**
- Extend synchronization to block blueprints and snippets with bidirectional support
- Provide opt-in field synchronization for users who create custom field snippets
- Support multiple directory organization strategies (flat vs nested)
- Reuse existing code paths for consistency and maintainability
- Maintain <500ms detection time and debounce behavior

**Non-Goals:**
- Automatic migration of existing block/field files (out of scope - only applies to new file creation)
- Support for custom blueprint/snippet directory structures (MVP assumes standard Kirby conventions)
- Synchronization of block/field metadata or content (only file creation)
- Integration with Kirby's block/field registration APIs (extension runs in VS Code, not Kirby runtime)

## Decisions

### Decision 1: Extend existing BlueprintTemplateSyncWatcher vs create separate watchers

**Choice:** Extend the existing `BlueprintTemplateSyncWatcher` class to handle blocks and fields.

**Rationale:**
- Blocks and fields follow the same synchronization pattern as templates: blueprint → snippet, with optional reverse
- Code reuse: debouncing, rate limiting, notification UI, user preferences, and file creation logic are identical
- Simpler testing: single test suite covers all file types with parameterized tests
- Easier maintenance: changes to synchronization behavior apply consistently across all file types

**Alternatives considered:**
- **Separate `BlockSyncWatcher` and `FieldSyncWatcher` classes**: Rejected due to code duplication and inconsistent behavior risk
- **Generic `FileSyncWatcher` with configuration**: Over-engineered for current needs; YAGNI principle

**Implementation:**
- Add new file system watcher globs: `**/site/blueprints/blocks/**/*.yml`, `**/site/snippets/blocks/**/*.php`
- Add conditional watchers for fields based on `kirby.syncFieldSnippets` setting
- Extend handler methods to detect file type (page, block, or field) and route to appropriate logic

### Decision 2: Block synchronization enabled by default, field synchronization opt-in

**Choice:** Default `kirby.syncBlockSnippets = true`, default `kirby.syncFieldSnippets = false`.

**Rationale:**
- Blocks are always rendered on the frontend, so block snippets are typically required (high adoption expected)
- Field blueprints are often used for Panel-only reusable field groups without frontend rendering (lower adoption, opt-in appropriate)
- Zero-configuration UX goal favors sensible defaults based on common use cases

**Alternatives considered:**
- **Both enabled by default**: Rejected - would create noise for users who don't use field snippets
- **Both opt-in**: Rejected - block synchronization provides high value and should be automatic like templates

### Decision 3: Support both flat and nested directory structures

**Choice:** Implement auto-detection with fallback to user preference via `kirby.syncBlockNestingStrategy` setting.

**Rationale:**
- Kirby supports both organizational patterns in the wild:
  - Flat: `/site/blueprints/blocks/gallery.image.yml` → `/site/snippets/blocks/gallery.image.php`
  - Nested: `/site/blueprints/blocks/gallery/image.yml` → `/site/snippets/blocks/gallery/image.php`
- Auto-detection provides zero-configuration UX: analyze existing files in project to infer preferred strategy
- Setting override allows explicit control for edge cases or new projects

**Detection algorithm:**
1. When a block blueprint is created, scan existing block snippets directory
2. If nested directories exist with PHP files, prefer nested structure
3. If only flat files with dot notation exist, prefer flat structure
4. If no existing files, use `kirby.syncBlockNestingStrategy` setting (default: `"nested"` to match modern Kirby convention)

**Alternatives considered:**
- **Flat only (dot notation)**: Rejected - nested directories are increasingly common in Kirby projects
- **Nested only**: Rejected - would break workflow for projects using flat structure
- **Always respect setting, no auto-detection**: Rejected - requires configuration, violates zero-config goal

### Decision 4: Bidirectional sync for blocks, blueprint-first for fields

**Choice:**
- Blocks: Bidirectional (blueprint → snippet OR snippet → blueprint)
- Fields: Blueprint-first only (blueprint → snippet, no reverse)

**Rationale:**
- Blocks are often designed iteratively: developers may create snippets first for prototyping, then formalize with blueprints
- Fields are typically defined in blueprints first (Panel-driven workflow), and snippets are added later if frontend rendering is needed
- Simplifies field synchronization logic (fewer edge cases, lower maintenance burden)

**Alternatives considered:**
- **Bidirectional for both**: Rejected for fields - rare use case, adds complexity without clear value
- **Blueprint-first for both**: Rejected for blocks - snippet-first workflow is common during rapid prototyping

## Risks / Trade-offs

### Risk: Auto-detection fails in projects with mixed nesting strategies

**Mitigation:**
- Provide clear error messages if detection is ambiguous
- Allow setting override to force specific strategy
- Document recommended project organization in extension README

**Trade-off:** Adds detection complexity, but eliminates configuration burden for 90% of users.

### Risk: Performance impact from additional file watchers

**Mitigation:**
- Reuse debounce logic to prevent excessive event processing
- Watchers only activate if features are enabled (field sync opt-in by default)
- VS Code's FileSystemWatcher is efficient for directory monitoring

**Trade-off:** Minimal - additional watchers have negligible overhead compared to existing page template watchers.

### Risk: User confusion from multiple synchronization prompts

**Mitigation:**
- Reuse existing active notification flag to prevent concurrent prompts
- Queue notifications and display one at a time
- Consistent message format across all file types: "📄 Block '{name}.yml' created without a snippet. Create '{name}.php'?"

**Trade-off:** None - improves UX consistency.

## Migration Plan

**Phase 1: Implementation (this change)**
1. Extend `BlueprintTemplateSyncWatcher` with block and field watchers
2. Add mapping utilities to `kirbyProject.ts`: `findMatchingBlockSnippet()`, `findMatchingFieldSnippet()`, etc.
3. Add boilerplate generators to `scaffoldingTemplates.ts`: `generateBlockSnippetContent()`, `generateFieldSnippetContent()`
4. Add configuration settings to `package.json` and `settings.ts`
5. Extend test coverage with parameterized tests for blocks and fields

**Phase 2: Rollout**
- Block synchronization activates automatically for all users (backward compatible)
- Field synchronization requires opt-in via settings
- No migration of existing files required

**Phase 3: Future enhancements (out of scope)**
- Support for custom directory structures via advanced settings
- Integration with Kirby's block/field libraries (e.g., Kirby Builder plugins)
- Bulk synchronization command to create missing counterpart files for existing projects

**Rollback plan:**
- If issues arise, users can disable features via settings: `kirby.syncBlockSnippets = false`, `kirby.syncFieldSnippets = false`
- No data loss risk - feature only creates new files, never modifies or deletes existing files

## Open Questions

None - all clarifications resolved through user questions at proposal stage.
