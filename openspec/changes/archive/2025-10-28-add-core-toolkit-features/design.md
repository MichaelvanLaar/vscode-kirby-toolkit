# Design: Core Toolkit Features

## Context

The extension currently provides three isolated features (type-hints, Blueprint validation, snippet navigation). This change adds five new capabilities that require file operations, YAML parsing, workspace configuration, and complex user interactions. The design must maintain security standards (path validation), performance (lazy loading), and user experience (zero-configuration defaults).

**Key constraints**:
- No Kirby runtime available - cannot execute PHP or call Kirby APIs
- Must work offline - all features bundled in extension
- Fast activation (<500ms) - use lazy loading for heavy operations
- Security-first - validate all file paths and user inputs
- Zero-config - sensible defaults, optional customization

## Goals / Non-Goals

**Goals**:
- Reduce scaffolding time from minutes to seconds (page types, snippets)
- Enable one-click refactoring from templates to snippets
- Automatic Tailwind CSS configuration without manual setup
- Provide contextual Blueprint field awareness in templates
- Seamless navigation across all related files (Template/Controller/Model)

**Non-Goals**:
- Full PHP AST parsing for dynamic method discovery (out of MVP scope)
- Custom Kirby directory structure support (assume standard `site/` layout)
- Kirby 2.x compatibility (focus on Kirby 3.x/4.x)
- Blueprint field type validation beyond schema (no runtime checks)
- Tailwind class auto-completion (delegated to official Tailwind extension)

## Decisions

### Decision 1: Command Pattern for File Operations

**Choice**: Implement scaffolding and refactoring as VS Code commands (not language providers)

**Why**:
- User-initiated file creation requires explicit commands (Command Palette)
- Commands provide natural UX for multi-step workflows (prompts, confirmations)
- Separation of concerns: Commands for mutations, Providers for navigation/hints

**Alternatives considered**:
- Code Actions: Not suitable for scaffolding (no trigger context)
- Quick Fixes: Inappropriate for creating new files

**Implementation**:
- `src/commands/pageTypeScaffolder.ts` - Page type generation
- `src/commands/snippetExtractor.ts` - Extract snippet refactoring
- Register with `vscode.commands.registerCommand()` in extension.ts

### Decision 2: YAML Parsing Library

**Choice**: Use `js-yaml` for Blueprint field extraction

**Why**:
- Industry standard, well-maintained (>20k GitHub stars)
- MIT licensed, compatible with extension licensing
- TypeScript types available (@types/js-yaml)
- Lightweight (<100KB), minimal performance impact

**Alternatives considered**:
- `yaml` package: Heavier weight, more complex API
- Manual regex parsing: Error-prone, cannot handle complex YAML
- VS Code YAML extension API: Not exposed for content parsing

**Implementation**:
- Add `js-yaml` and `@types/js-yaml` to dependencies
- Parse Blueprint YAML in `src/utils/yamlParser.ts`
- Extract fields from `fields:` sections for CodeLens display

### Decision 3: Tailwind Detection Strategy

**Choice**: Check `package.json` for `tailwindcss` dependency (based on user selection)

**Why**:
- Most reliable indicator of active Tailwind CSS usage
- Prevents false positives from leftover config files
- Aligns with standard Node.js project conventions

**Alternatives considered**:
- Config file detection: Less reliable (files may be present but unused)
- Manual settings only: Requires user configuration (breaks zero-config goal)

**Implementation**:
- `src/utils/tailwindDetector.ts` - Read package.json, check dependencies
- On detection, update workspace settings via `vscode.workspace.getConfiguration()`
- Set `tailwindCSS.includeLanguages: { "php": "html" }` programmatically

### Decision 4: Blueprint Field Display via CodeLens

**Choice**: Use CodeLens provider to show available fields above template code (based on user selection)

**Why**:
- Consistent with existing snippet navigation UX
- Non-intrusive, can be disabled via settings
- Works without complex PHP parsing (read Blueprint YAML only)

**Alternatives considered**:
- IntelliSense: Requires PHP AST parsing, complex implementation
- Hover tooltip: Less discoverable, harder to scan multiple fields
- Side panel: Breaks VS Code conventions, adds UI complexity

**Implementation**:
- `src/providers/blueprintFieldCodeLens.ts` - CodeLensProvider implementation
- Match template name to Blueprint name (e.g., `project.php` → `site/blueprints/project.yml`)
- Parse Blueprint YAML, extract field names from `fields:` sections
- Display CodeLens: "Blueprint Fields: title, description, gallery" at top of template

### Decision 5: File Navigation Architecture

**Choice**: Create unified DefinitionProvider for Template/Controller/Model navigation

**Why**:
- Extends existing snippet navigation pattern
- DefinitionProvider enables Ctrl+Click, F12, Peek Definition
- Single provider handles all file types (DRY principle)

**Implementation**:
- `src/providers/fileNavigationProvider.ts` - Unified navigation logic
- Detect file type (Template/Controller/Model) from path
- Resolve related files using Kirby naming conventions:
  - `project.php` template → `project.controller.php`, `project.model.php`
- Provide multi-target definitions when multiple related files exist

## Risks / Trade-offs

### Risk 1: YAML Parsing Performance

**Concern**: Parsing Blueprint YAML on every template edit could slow down editor

**Mitigation**:
- Cache parsed Blueprint results per file, invalidate on YAML file changes
- Use VS Code's FileSystemWatcher for change detection
- Limit parsing to files <500KB (same as existing constraints)
- Lazy load YAML parser (defer `require('js-yaml')` until first use)

### Risk 2: Snippet Extraction Edge Cases

**Concern**: Extracting complex PHP code may break variable scope or dependencies

**Mitigation**:
- Document limitation: User responsible for ensuring extracted code is self-contained
- Show warning if selection contains unbalanced brackets or quotes
- Allow undo via VS Code's built-in undo stack (use WorkspaceEdit API)

**Trade-off**: Prioritize simplicity over perfect detection. Advanced refactoring requires PHP AST analysis (out of scope).

### Risk 3: Tailwind Settings Conflicts

**Concern**: Auto-configuring Tailwind settings may conflict with user's existing configuration

**Mitigation**:
- Only update settings if not already configured (check existing value)
- Prompt user before making changes: "Enable Tailwind IntelliSense for PHP files?"
- Provide `kirby.enableTailwindIntegration` setting to disable feature entirely
- Update workspace settings (not user settings) to limit scope

### Risk 4: File Creation Security

**Concern**: Scaffolding commands create files based on user input (path traversal risk)

**Mitigation**:
- Reuse existing `resolveSnippetPath()` security validation pattern
- Validate all file names: reject `../`, absolute paths, special characters
- Verify parent directories exist before creation
- Add comprehensive security tests (minimum 8 tests per file operation)

## Migration Plan

**Steps**:
1. Add new dependencies (`js-yaml`, `@types/js-yaml`) via npm install
2. Implement features incrementally (one capability per PR):
   - PR 1: Page Type Scaffolding
   - PR 2: Snippet Extraction
   - PR 3: Tailwind Integration
   - PR 4: Blueprint Field CodeLens
   - PR 5: Extended File Navigation
3. Each PR must include tests and pass existing test suite (36+ tests)
4. Update README.md with new features and configuration options
5. Update extension version following semantic versioning (0.3.0)

**Rollback**:
- Each feature has dedicated settings to disable individually
- No breaking changes to existing APIs or configurations
- Uninstalling extension removes all workspace setting changes

## Open Questions

None - all ambiguities resolved during user clarification phase.
