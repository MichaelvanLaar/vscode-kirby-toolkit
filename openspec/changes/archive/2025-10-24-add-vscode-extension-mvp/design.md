# Design: VS Code Extension MVP

## Context

This is a greenfield VS Code extension project targeting Kirby CMS developers. The extension must integrate with existing VS Code APIs and extensions (particularly the YAML extension for Blueprint support) while remaining maintainable by a small team or individual developer. The target audience ranges from beginners to professionals, requiring intuitive UX with minimal configuration.

### Constraints

- Must work with standard VS Code Extension API (no proprietary APIs)
- Should minimize external dependencies to reduce maintenance burden
- Must not interfere with other PHP or YAML extensions
- Should activate only in Kirby project workspaces to avoid performance impact

### Stakeholders

- **Primary**: Kirby CMS developers seeking productivity improvements
- **Secondary**: VS Code ecosystem (ensuring compatibility and best practices)

## Goals / Non-Goals

### Goals

- Deliver three high-impact features that immediately improve daily Kirby development workflows
- Establish a clean, extensible architecture for future feature additions
- Provide zero-configuration experience with sensible defaults
- Ensure fast activation time (<500ms) and minimal memory footprint

### Non-Goals

- **Not in MVP**: Bidirectional navigation (snippet → template), complex configuration UI, custom Kirby project scaffolding
- **Not in MVP**: Support for custom Kirby directory structures (rely on standard `site/` conventions)
- **Not in MVP**: Deep integration with Kirby's runtime (no PHP execution or Kirby API calls)

## Decisions

### Decision 1: Extension Structure and Language

**Choice**: TypeScript with standard VS Code Extension scaffold (`yo code`)

**Rationale**:
- TypeScript provides type safety and excellent VS Code API typing support
- Standard scaffolding includes build tooling (webpack/esbuild), testing setup, and best practices
- TypeScript compilation catches errors early and improves maintainability

**Alternatives considered**:
- **JavaScript**: Faster initial development but loses type safety benefits critical for complex API interactions
- **Custom build setup**: Unnecessary complexity when standard scaffold meets all needs

### Decision 2: Type-Hint Injection Implementation

**Choice**: Use `workspace.onDidCreateFiles` event + `TextEditor.edit()` API

**Rationale**:
- `onDidCreateFiles` provides reliable file creation detection without polling
- `TextEditor.edit()` ensures atomic, undoable edits that respect VS Code's edit history
- Separate command registration allows manual invocation for existing files

**Alternatives considered**:
- **File system watchers**: More complex, potential race conditions with editor state
- **Snippets/templates**: Cannot detect file creation context; requires manual user invocation every time

### Decision 3: Blueprint Schema Integration

**Choice**: Bundle JSON Schema + register via `package.json` `yamlValidation` contribution

**Rationale**:
- `yamlValidation` contribution is the recommended VS Code approach for YAML schema association
- Bundling schema ensures offline functionality and version consistency
- Declarative approach in `package.json` is simpler than programmatic registration

**Alternatives considered**:
- **Programmatic registration via `yaml.schemas` setting**: Requires modifying user/workspace settings, potential conflicts with user config
- **Dynamic schema download**: Introduces network dependency and versioning complexity for MVP
- **Custom YAML language server**: Massive scope increase, reinvents existing tooling

**Schema source**: Use community schema (https://github.com/johannschopplich/kirby-types-blueprint or equivalent) with attribution, or create minimal MVP schema covering core Blueprint features. License check required before bundling.

### Decision 4: Snippet Navigation Implementation

**Choice**: Implement both CodeLens Provider and Definition Provider

**Rationale**:
- CodeLens provides discoverable, visual navigation cues for less experienced users
- Definition Provider supports power-user workflows (Ctrl+Click, F12, Peek)
- Both use same underlying snippet resolution logic, minimal code duplication
- Users can disable CodeLens if they find it cluttering while retaining Definition Provider

**Alternatives considered**:
- **CodeLens only**: Ignores established VS Code navigation patterns (F12, Ctrl+Click)
- **Definition Provider only**: Less discoverable for users unfamiliar with these shortcuts
- **Hover Provider**: Not actionable for navigation; better suited for documentation display

### Decision 5: Kirby Project Detection

**Choice**: Check for `site/` directory existence in workspace root

**Rationale**:
- `site/` directory is universal across Kirby projects
- Simple, fast check during extension activation
- Prevents extension from activating in non-Kirby projects, improving performance

**Alternatives considered**:
- **Check for `composer.json` with Kirby dependency**: More accurate but requires file parsing; slower activation
- **Always activate**: Wastes resources in non-Kirby projects, potential false positives for PHP files

### Decision 6: Extension Activation Events

**Choice**: Activate on `onLanguage:php`, `onLanguage:yaml`, and `workspaceContains:site/`

**Rationale**:
- Lazy activation ensures extension only loads when relevant files are opened or Kirby project detected
- Multiple activation events cover different entry points (opening PHP file first vs. opening project)
- Minimizes resource usage in multi-language/multi-project workspaces

**Alternatives considered**:
- **Activate on `*` (always)**: Unnecessary resource consumption in non-Kirby projects
- **Manual activation command**: Poor UX, users expect auto-activation

### Decision 7: Blueprint JSON Schema Source

**Choice**: Use existing community schema (johannschopplich/kirby-types-blueprint) if license permits; otherwise create minimal MVP schema

**Rationale**:
- Community schemas are battle-tested and comprehensive
- Saves development time compared to creating from scratch
- Active maintenance means updates aligned with Kirby releases
- Minimal schema is faster to implement but requires ongoing maintenance

**Alternatives considered**:
- **Create comprehensive custom schema**: Unnecessary duplication of community work, high maintenance burden
- **Dynamic schema download**: Adds network dependency and complexity for MVP

**Implementation approach**:
- Evaluate johannschopplich/kirby-types-blueprint or similar community schemas
- Verify MIT or compatible license that allows bundling
- Check completeness for Kirby 4.x Blueprint features
- If suitable: bundle in extension with proper attribution
- If not suitable: create minimal schema covering core Blueprint features (fields, sections, basic validation)
- Document schema source and license in README.md

### Decision 8: Controller File Support for Type-Hints

**Choice**: No controller file support in MVP

**Rationale**:
- Templates and snippets are higher-frequency use cases (developers create/edit them more often)
- Controllers have different variable contexts requiring separate logic
- Keeping scope tight ensures faster MVP delivery
- Can add controller support in v0.2.0 based on user feedback

**Alternatives considered**:
- **Include controller support in MVP**: Increases complexity and scope, delays MVP release
- **Generic PHP file support**: Would inject incorrect type-hints in non-Kirby PHP files

**Future consideration**: Add controller support in future release if users request it (track in feature backlog)

### Decision 9: Snippet Navigation Error Handling

**Choice**: Show error notification when snippet file not found

**Rationale**:
- Clear, immediate feedback helps developers identify typos or missing files
- Simple to implement with VS Code's notification API
- Consistent with VS Code's "Go to Definition" behavior for missing files

**Alternatives considered**:
- **Offer to create snippet file**: Feature creep for MVP; adds complexity (file templates, directory creation, user prompts)
- **Silent indicator (grayed-out CodeLens)**: Less discoverable, users might not understand why navigation doesn't work
- **Show warning in Problems panel**: Less immediate feedback, users might miss it

**Error message format**: "Snippet file not found: site/snippets/{name}.php"

## Architecture

### Component Structure

```
src/
├── extension.ts              # Entry point, activation, command registration
├── providers/
│   ├── typeHintProvider.ts   # Type-hint injection logic
│   ├── snippetCodeLens.ts    # CodeLens provider for snippet navigation
│   └── snippetDefinition.ts  # Definition provider for snippet navigation
├── utils/
│   ├── kirbyProject.ts       # Project structure detection and path resolution
│   └── phpParser.ts          # Simple regex-based snippet() call parsing
├── config/
│   └── settings.ts           # Configuration access helpers
└── schemas/
    └── blueprint.schema.json # Bundled Kirby Blueprint JSON Schema
```

### Data Flow

**Type-Hint Injection**:
1. User creates file in `site/templates/` or `site/snippets/`
2. `workspace.onDidCreateFiles` event fires
3. `typeHintProvider.injectTypeHints()` checks file path and config
4. If enabled, inserts PHPDoc block at position 0 using `TextEditor.edit()`

**Blueprint Validation**:
1. User opens `.yml` file in `site/blueprints/`
2. VS Code YAML extension loads
3. `package.json` `yamlValidation` maps file pattern to bundled schema
4. YAML extension provides diagnostics and auto-completion

**Snippet Navigation**:
1. User opens PHP file in `site/templates/` or `site/snippets/`
2. `snippetCodeLens.provideCodeLenses()` scans for `snippet()` calls via regex
3. Returns CodeLens items with `command: kirby.openSnippet` and snippet name
4. User clicks CodeLens or triggers Definition Provider (F12, Ctrl+Click)
5. `kirbyProject.resolveSnippetPath()` converts snippet name to file path
6. VS Code opens target file

### Extension Lifecycle

1. **Activation**: Check workspace for `site/` directory, register providers and commands
2. **Runtime**: Providers respond to VS Code events (file creation, document open, CodeLens request)
3. **Deactivation**: Clean up disposables (standard VS Code pattern)

## Risks / Trade-offs

### Risk: YAML Extension Dependency

**Risk**: Blueprint validation requires the RedHat YAML extension to be installed.

**Mitigation**:
- Declare `redhat.vscode-yaml` as `extensionDependencies` in `package.json` (VS Code auto-installs)
- Gracefully degrade if YAML extension unavailable (skip Blueprint features, log warning)

### Risk: Regex-Based PHP Parsing

**Risk**: Simple regex for `snippet()` detection may produce false positives (e.g., inside comments, strings).

**Mitigation**:
- Accept some false positives for MVP simplicity
- Document limitation and improve with proper PHP AST parser in future releases if user feedback warrants
- Most false positives are harmless (CodeLens appears but target doesn't exist)

### Trade-off: Bundled vs. Dynamic Schema

**Trade-off**: Bundled schema is simpler but requires extension updates for Kirby Blueprint changes.

**Decision**: Bundle schema for MVP. Kirby Blueprint structure is relatively stable; occasional extension updates acceptable.

**Future enhancement**: Add optional dynamic schema update feature if user demand exists.

### Risk: Performance with Large Projects

**Risk**: Scanning many PHP files for `snippet()` calls could slow down editor on large projects.

**Mitigation**:
- CodeLens and Definition Providers are per-document, VS Code only calls them for visible/active files
- Limit regex scanning to files <500KB (configurable)
- Profile with realistic Kirby project sizes (most are <100 templates/snippets)

## Migration Plan

N/A - This is a greenfield project with no existing users or data to migrate.

## Implementation Notes

All architectural decisions have been documented above. During implementation, if new questions arise:

1. Add them to this design document as new decisions
2. Update the change proposal with `openspec validate add-vscode-extension-mvp --strict`
3. Consider whether the question affects the spec requirements (if so, update spec deltas)

For minor implementation details that don't affect architecture or behavior (e.g., variable naming, file organization within established structure), implementers can make decisions without updating this document.
