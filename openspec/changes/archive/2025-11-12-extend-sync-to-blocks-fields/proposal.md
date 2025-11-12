# Extend Blueprint/Template Synchronization to Blocks and Fields

## Why

The current Blueprint/Template Synchronization feature only supports page templates and their blueprints (`site/blueprints/pages/` ↔ `site/templates/`). However, Kirby CMS developers also work extensively with:

1. **Blocks**: Used in the `blocks` and `layout` fields, each block has a blueprint (`site/blueprints/blocks/{name}.yml`) and a corresponding snippet (`site/snippets/blocks/{name}.php`) for frontend rendering.
2. **Fields**: Reusable field groups with blueprints (`site/blueprints/fields/{name}.yml`) and optional frontend snippets (`site/snippets/fields/{name}.php`).

Currently, developers must manually create these paired files, leading to the same workflow inefficiencies that the synchronization feature was designed to solve for page templates. Extending the feature to blocks and fields will provide a consistent, automated workflow across all Kirby file types.

## What Changes

- Extend file system watchers to monitor `site/blueprints/blocks/` and `site/snippets/blocks/` directories
- Add bidirectional synchronization for block blueprints ↔ block snippets (matching page template behavior)
- Optionally extend watchers to monitor `site/blueprints/fields/` and `site/snippets/fields/` directories (controlled by new setting)
- Support both flat (dot notation) and nested directory structures for block/field organization
- Implement deterministic mapping between block/field blueprints and their snippets
- Add new configuration settings:
  - `kirby.syncBlockSnippets` (default: `true`) - Enable block synchronization
  - `kirby.syncFieldSnippets` (default: `false`) - Enable field synchronization (opt-in, since not all fields need snippets)
  - `kirby.syncBlockNestingStrategy` (default: `"auto"`) - Control mapping strategy: `"flat"` (dot notation), `"nested"` (directories), or `"auto"` (detect from existing structure)
- Reuse existing scaffolding utilities for consistent boilerplate generation
- Extend existing debounce, rate limiting, and user preference persistence logic
- Update "Don't ask again" and reset functionality to include blocks and fields

## Impact

**Affected specs:**
- `blueprint-template-synchronization` - Core synchronization requirements extended to new file types

**Affected code:**
- `src/providers/blueprintTemplateSyncWatcher.ts` - Add watchers for blocks and fields, extend mapping logic
- `src/utils/kirbyProject.ts` - Add utility functions for block/field detection and path mapping
- `src/utils/scaffoldingTemplates.ts` - Add boilerplate generators for block and field snippets
- `src/config/settings.ts` - Add new configuration settings
- `src/test/blueprintTemplateSync.test.ts` - Extend test coverage for blocks and fields
- `package.json` - Add new configuration contributions

**Migration:**
- Fully backward compatible - existing page template synchronization behavior unchanged
- New watchers activate automatically for block synchronization (if enabled)
- Field synchronization is opt-in via settings (default: disabled)
- No breaking changes to existing workflows

**User experience:**
- Developers creating block blueprints will see prompts to create matching snippets (similar to template creation)
- Developers creating block snippets can optionally create matching blueprints
- Field synchronization available for users who frequently create custom field snippets
- Consistent notification messages and action buttons across all file types
- Settings provide fine-grained control over which synchronization features are active
