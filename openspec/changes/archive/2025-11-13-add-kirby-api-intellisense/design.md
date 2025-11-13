# Design: Kirby API IntelliSense

## Context

The Kirby CMS Developer Toolkit currently provides basic type-hint injection for global variables but doesn't extend intelligent autocompletion to the broader Kirby API. Developers using Kirby classes like `Page`, `File`, `User`, and their methods lack contextual IntelliSense, forcing them to reference external documentation frequently.

**Key constraints:**
- Cannot build a full Language Server Protocol (LSP) implementation due to maintenance complexity
- Must leverage existing PHP language server (Intelephense) to avoid reinventing core PHP parsing
- Should work gracefully when Intelephense is not installed (degrade to basic functionality)
- Must support Kirby's fluid API patterns with method chaining
- Should be maintainable as Kirby API evolves across versions

**Stakeholders:**
- Extension users: Need fast, accurate autocompletion for Kirby APIs
- Extension maintainers: Need a solution that doesn't require deep LSP/PHP parser expertise
- Kirby community: Benefits from better VS Code support without requiring Kirby CMS changes

## Goals / Non-Goals

**Goals:**
- Provide intelligent autocompletion for Kirby core classes (`Page`, `File`, `Site`, `Kirby`, `User`, `Field` types)
- Display inline documentation (hover tooltips) extracted from Kirby's API docs
- Support method chaining with correct return type inference (e.g., `$page->children()->first()->title()`)
- Integrate seamlessly with Intelephense without breaking existing PHP IntelliSense
- Allow users to disable the feature if it conflicts with their workflow
- Support Kirby 4.x API (current stable version)

**Non-Goals:**
- Building a full PHP Language Server Protocol implementation from scratch
- Parsing arbitrary PHP code or project-specific custom classes beyond Kirby's core API
- Supporting Kirby 3.x or older versions (focus on current stable release)
- Providing refactoring tools or advanced code actions (beyond autocompletion)
- Real-time synchronization with Kirby Panel or database state
- Supporting plugins' custom classes in initial implementation (future enhancement)

## Decisions

### Decision 1: Integration Approach - PHP Stub Files

**What:** Generate PHP stub files containing Kirby API class/method signatures and use Intelephense's built-in stub loading mechanism.

**Why:**
- Intelephense automatically indexes PHP files in the workspace and provides IntelliSense based on them
- Stub files are a standard PHP ecosystem pattern (used by Laravel IDE Helper, WordPress stubs, etc.)
- No custom Intelephense extension API required - works with any version of Intelephense
- Easy to update when Kirby API changes (regenerate stubs from documentation)
- Can be versioned and bundled with the extension for offline use

**Alternatives considered:**
1. **Intelephense Extension API** - Investigate if Intelephense exposes an API for third-party extensions to inject completions
   - *Rejected*: Intelephense is closed-source and doesn't expose public extension APIs
2. **Custom LSP Proxy** - Build a middleware layer that intercepts LSP requests and augments responses
   - *Rejected*: Overly complex, fragile, and hard to maintain across VS Code/Intelephense updates
3. **Manual CompletionProvider** - Implement VS Code's CompletionProvider to overlay Kirby completions
   - *Rejected*: Conflicts with Intelephense's existing PHP completions, duplicates work, poor return type inference

### Decision 2: API Metadata Source

**What:** Bundle pre-generated PHP stub files based on Kirby's official API documentation, stored in `src/stubs/kirby-api/`.

**Why:**
- Kirby's API is well-documented at https://getkirby.com/docs/reference
- API changes are infrequent and tied to major/minor version releases
- Bundling stubs ensures offline functionality and eliminates runtime dependencies
- Stubs can be manually curated to improve quality and add missing docblocks

**Alternatives considered:**
1. **Parse Kirby source code at runtime** - Dynamically analyze installed Kirby codebase
   - *Rejected*: Requires access to Kirby installation (may not exist in workspace), complex parsing logic
2. **Fetch API metadata from online service** - Query Kirby's API docs programmatically
   - *Rejected*: Requires internet connection, introduces latency, adds external dependency
3. **User-provided stubs** - Ask users to generate/provide their own stubs
   - *Rejected*: Poor user experience, defeats "zero configuration" principle

### Decision 3: Stub File Structure

**What:** Organize stubs as:
```
src/stubs/kirby-api/
├── Cms/
│   ├── Page.php
│   ├── Site.php
│   ├── File.php
│   ├── User.php
│   └── ...
└── kirby-core.php  # Namespace and class loader stubs
```

**Why:**
- Mirrors Kirby's actual class structure for maintainability
- Allows incremental updates to individual classes
- Intelephense can index all files in the directory tree

### Decision 4: Stub Injection Mechanism

**What:** On extension activation, copy stub files to a workspace-specific `.vscode/kirby-stubs/` directory and configure Intelephense to index it.

**Why:**
- Keeps stubs isolated from user's actual source code
- Allows workspace-specific configuration without polluting global settings
- Users can inspect/modify stubs if needed (transparency)
- Easy cleanup when extension is disabled

**Implementation details:**
1. Check if `.vscode/kirby-stubs/` exists; if not, copy from `src/stubs/kirby-api/`
2. Update `.vscode/settings.json` to add stub directory to Intelephense's `stubs` configuration:
   ```json
   {
     "intelephense.stubs": [
       ".vscode/kirby-stubs",
       "...other stubs..."
     ]
   }
   ```
3. Trigger Intelephense reindex via workspace configuration change event

**Alternatives considered:**
1. **Global stub directory** - Install stubs in user's global Intelephense directory
   - *Rejected*: Pollutes global configuration, harder to manage across multiple projects
2. **Virtual file system** - Serve stubs via VS Code's FileSystemProvider API
   - *Rejected*: Intelephense may not support virtual filesystems, adds complexity

### Decision 5: Configuration & Graceful Degradation

**What:** Add settings to control stub integration:
```json
{
  "kirby.enableApiIntelliSense": true,  // Master toggle
  "kirby.kirbyVersion": "4.0",          // API version to use (future: support multiple versions)
  "kirby.customStubsPath": ""           // Override with user-provided stubs
}
```

**Why:**
- Allows users to disable if conflicts arise
- Future-proofs for Kirby version compatibility
- Supports advanced users with custom API extensions

**Graceful degradation:**
- If Intelephense is not installed, show informational message (once per workspace) suggesting installation
- Continue providing basic type-hint injection (existing functionality)
- Don't block extension activation if stub copying fails

## Risks / Trade-offs

### Risk 1: Stub Maintenance Burden
**Risk:** Kirby API changes require manual stub updates, which could lag behind releases.

**Mitigation:**
- Create automated stub generation script from Kirby's API documentation (JSON export)
- Document stub update process in `src/stubs/README.md`
- Track Kirby releases and update stubs in sync with toolkit releases
- Consider community contributions for stub updates

### Risk 2: Intelephense Compatibility
**Risk:** Future Intelephense updates may change stub loading behavior or break integration.

**Mitigation:**
- Use stable, documented Intelephense features (stub loading is a core feature)
- Test with multiple Intelephense versions during development
- Monitor Intelephense release notes for breaking changes
- Provide fallback to basic functionality if integration fails

### Risk 3: Workspace Pollution
**Risk:** Creating `.vscode/kirby-stubs/` directory may clutter workspace and confuse users.

**Mitigation:**
- Add `.vscode/kirby-stubs/` to `.gitignore` automatically (if not already present)
- Document the stub directory purpose in extension README
- Provide command to clean up stub files: `Kirby: Remove API Stubs`
- Consider alternative stub locations (e.g., extension's global storage directory) if feedback is negative

### Risk 4: Conflicting Type Hints
**Risk:** Stub type hints may conflict with user's existing PHPDoc or actual Kirby installation's types.

**Mitigation:**
- Use fully qualified class names in stubs to avoid namespace conflicts
- Defer to Intelephense's type resolution logic (actual code wins over stubs)
- Provide clear documentation on stub behavior and precedence

## Migration Plan

**Phase 1: Initial Release (v0.4.0)**
1. Bundle Kirby 4.0 API stubs with extension
2. Implement stub copying and Intelephense configuration on activation
3. Add configuration settings and graceful degradation logic
4. Write comprehensive tests for stub injection and Intelephense detection
5. Update README with Intelephense setup instructions and troubleshooting

**Phase 2: Stub Generation Automation (v0.5.0)**
1. Create script to parse Kirby's API documentation and generate stubs
2. Automate stub updates in CI/CD pipeline when new Kirby version released
3. Support multiple Kirby version stubs (4.0, 4.1, etc.)

**Phase 3: Enhanced IntelliSense (v0.6.0)**
1. Add signature help provider for method parameters
2. Include code examples in hover documentation
3. Support Kirby plugin stubs (community-contributed)

**Rollback Plan:**
- If stub integration causes critical issues, provide hotfix that disables stub copying by default
- Users can manually remove `.vscode/kirby-stubs/` directory to fully revert
- Document rollback process in extension changelog

## Open Questions

1. **Kirby Plugin Support:** Should we allow users to add custom stubs for third-party Kirby plugins? If so, what's the discovery/configuration mechanism?
   - *Proposed answer*: Phase 2 feature; use `kirby.customStubsPath` setting to point to additional stub directories

2. **Stub Update Mechanism:** Should the extension check for stub updates periodically or only on major version upgrades?
   - *Proposed answer*: Only update stubs with extension version upgrades to avoid unexpected behavior; advanced users can manually replace stubs

3. **Multi-Workspace Support:** How should stubs behave in VS Code workspaces with multiple Kirby projects (different versions)?
   - *Proposed answer*: Each workspace folder gets its own `.vscode/kirby-stubs/` based on `kirby.kirbyVersion` setting; requires per-folder configuration

4. **Type Inference Depth:** How many levels of method chaining should return type inference support?
   - *Proposed answer*: Depends on Intelephense's capabilities; stubs will declare return types, but chaining depth is limited by LSP implementation (likely 3-4 levels is practical)
