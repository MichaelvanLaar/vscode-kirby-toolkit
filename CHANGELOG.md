# Change Log

All notable changes to the "Kirby CMS Developer Toolkit" extension will be documented in this file.

## [Unreleased]

## [0.4.0] - 2025-11-02

### Added

- **Blueprint/Template Synchronization** (FR-3.1)
  - Automatic detection of missing Blueprint/Template counterpart files
  - FileSystemWatcher monitors file creation in `site/blueprints/pages/` and `site/templates/`
  - Smart notification prompts with multiple action options
  - One-click creation of missing files with sensible defaults
  - Optional Controller and Model file creation when generating Templates
  - Support for nested Blueprint structures (e.g., `blog/post.yml` → `blog.post.php`)
  - "Don't ask again" option with workspace-specific memory
  - Smart debouncing (500ms) to prevent notification spam during bulk operations
  - Three behavior modes: "ask" (default), "never", "always"
  - Command: `Kirby: Reset Blueprint/Template Sync Prompts` to clear dismissed prompts
  - Folder exclusion patterns via `kirby.syncIgnoreFolders` setting

- **Frontend Build Integration** (FR-4.1)
  - Automatic detection of npm build scripts from `package.json`
  - Start/stop/restart build watchers from Command Palette
  - Real-time build status in the status bar (idle, building, ready, error)
  - Integrated terminal management with VS Code Terminal API
  - Optional auto-start on workspace open with configurable delay
  - Support for custom build commands via settings
  - Commands:
    - `Kirby: Start Build Watcher` - Start dev/watch script
    - `Kirby: Stop Build Watcher` - Stop active build process
    - `Kirby: Restart Build Watcher` - Restart build process
    - `Kirby: Run Build Once` - Execute one-time build
    - `Kirby: Show Build Terminal` - Focus build terminal
  - Status bar indicator with click-to-show terminal
  - Singleton pattern prevents multiple simultaneous builds
  - Priority-based script detection (dev > watch > dev:css > watch:css)
  - Build state management with callback notifications
  - Supported build tools: Vite, Webpack, Tailwind CSS CLI, PostCSS, esbuild, and any npm script-based build tool
  - Current limitations documented in README (Terminal API constraints)

### Changed

- **Refactoring**: Extracted scaffolding content generators to shared utilities
  - Created `src/utils/scaffoldingTemplates.ts` with reusable content generators
  - Functions: `generateBlueprintContent()`, `generateTemplateContent()`, `generateControllerContent()`, `generateModelContent()`
  - Updated `pageTypeScaffolder.ts` to use shared utilities
  - Ensures consistent file generation across all features
  - DRY principle: Single source of truth for boilerplate content

- **Utilities**: Extended kirbyProject.ts with file name mapping functions
  - `getTemplateNameFromBlueprint()` - Converts Blueprint path to template name
  - `getBlueprintNameFromTemplate()` - Converts template name to Blueprint path
  - `findMatchingTemplate()` - Finds matching template URI for a Blueprint
  - `findMatchingBlueprint()` - Finds matching Blueprint URI for a template
  - Handles nested structures with dot notation conversion

- **Testing**: Expanded test suite from 179 to 232 tests (+53 new tests)
  - Added `blueprintTemplateSync.test.ts` with comprehensive test coverage
  - Tests for file name mapping (flat and nested structures)
  - Tests for content generators (Blueprint, Template, Controller, Model)
  - Edge case testing (single character names, hyphens, underscores, deeply nested)
  - Security validation for generated content
  - Added `buildScriptDetector.test.ts` with 11 tests
  - Added `buildIntegration.test.ts` with 14 integration tests
  - Tests for script detection, validation, terminal management
  - Tests for singleton pattern, state transitions, cleanup
  - All tests passing with zero failures

- **Utilities**: New `src/utils/buildScriptDetector.ts` module
  - `detectBuildScripts()` - Parse and detect build scripts from package.json
  - `validateBuildCommand()` - Security validation for commands
  - `getNpmCommand()` - Format npm run commands
  - `hasPackageJson()` - Check for package.json existence

- **Integration**: New `src/integrations/buildIntegration.ts` module
  - `BuildProcess` class for terminal lifecycle management
  - Build state tracking (Idle, Building, Ready, Error)
  - Terminal event listeners for state transitions
  - Cleanup on extension deactivation

- **Commands**: New `src/commands/buildCommands.ts` module
  - Complete command implementations with error handling
  - User-friendly notifications for all operations
  - Integration with workspace detection

### Configuration

Added 10 new configuration options:

**Blueprint/Template Sync:**
- `kirby.enableBlueprintTemplateSync`: Enable/disable sync prompts (default: `true`)
- `kirby.syncPromptBehavior`: Prompt behavior - `"ask"`, `"never"`, or `"always"` (default: `"ask"`)
- `kirby.syncCreateController`: Auto-create controller when creating template from Blueprint (default: `false`)
- `kirby.syncCreateModel`: Auto-create model when creating template from Blueprint (default: `false`)
- `kirby.syncIgnoreFolders`: Array of folder patterns to exclude from sync detection (default: `[]`)

**Frontend Build Integration:**
- `kirby.enableBuildIntegration`: Enable/disable build integration (default: `true`)
- `kirby.buildCommand`: Custom build command override (default: `""`)
- `kirby.buildAutoStart`: Auto-start on workspace open (default: `false`)
- `kirby.buildAutoStartScript`: Which script to auto-start (default: `"dev"`)
- `kirby.buildAutoStartDelay`: Auto-start delay in milliseconds (default: `2000`)

### Technical

- **New Source Files** (9 files):
  - Blueprint/Template Sync:
    - `src/providers/blueprintTemplateSyncWatcher.ts` - FileSystemWatcher for sync detection
    - `src/commands/resetSyncPrompts.ts` - Command to reset dismissed prompts
    - `src/utils/scaffoldingTemplates.ts` - Shared content generation utilities
    - `src/test/blueprintTemplateSync.test.ts` - Comprehensive test suite
  - Frontend Build Integration:
    - `src/integrations/buildIntegration.ts` - Build process management
    - `src/integrations/buildStatusBar.ts` - Status bar integration
    - `src/utils/buildScriptDetector.ts` - Build script detection
    - `src/commands/buildCommands.ts` - Build command implementations
    - `src/test/buildScriptDetector.test.ts` - Build detection tests
    - `src/test/buildIntegration.test.ts` - Build integration tests

- **Architecture**:
  - Blueprint/Template Sync:
    - FileSystemWatcher API for efficient file creation detection
    - Debounce mechanism to prevent multiple notifications during bulk operations
    - Workspace state API for persistent "Don't ask again" preferences
    - Queue mechanism to prevent concurrent notifications (max 1 active)
    - Configuration change listener to restart watchers when settings change
  - Frontend Build Integration:
    - VS Code Terminal API for interactive build process management
    - Singleton pattern to prevent multiple simultaneous builds
    - Event-driven state management with callback notifications
    - Terminal lifecycle management with automatic cleanup
    - Script detection with priority-based selection algorithm

## [0.3.0] - 2025-10-25

### Added

- **Page Type Scaffolding** (FR-2.1)
  - Interactive wizard to scaffold new Kirby page types
  - Command: `Kirby: New Page Type` creates Blueprint, Template, Controller, Model
  - User selects which files to generate during execution
  - Automatic PascalCase conversion for model class names
  - Pre-filled templates with common Kirby patterns
  - Integrated with type-hint injection for generated templates
  - Security: Input validation prevents path traversal attacks

- **Snippet Extraction Tool** (FR-2.2)
  - Refactor selected code into reusable snippets
  - Command: `Kirby: Extract to Snippet` or right-click context menu
  - Atomic operation: Creates snippet file and replaces selection with `snippet()` call
  - Smart PHP context detection (adds `<?php ?>` tags when needed)
  - Bracket balance validation before extraction
  - Indentation preservation in generated snippet files
  - Prevents overwriting existing snippets
  - 100KB selection size limit for performance

- **Tailwind CSS Integration** (FR-2.3)
  - Automatic detection of Tailwind CSS in project dependencies
  - One-click configuration of Tailwind IntelliSense for PHP files
  - Commands: `Kirby: Configure Tailwind CSS`, `Kirby: Reset Tailwind Prompt`
  - Detects Tailwind in both dependencies and devDependencies
  - Updates `.vscode/settings.json` with IntelliSense configuration
  - FileSystemWatcher monitors package.json for new Tailwind installations
  - Remember user choice to avoid repeated prompts

- **Blueprint Field Display** (FR-2.4)
  - CodeLens showing available Blueprint fields in template files
  - Displays field names and types (configurable) at top of template
  - Click to open corresponding Blueprint file
  - Supports nested Blueprint structures (tabs, sections, columns)
  - Smart Blueprint resolution (checks both `blueprints/pages/` and `blueprints/`)
  - Configurable field display limit with "X more" indicator
  - Caching with FileSystemWatcher for performance
  - 500KB Blueprint file size limit

- **Extended File Navigation** (FR-2.5)
  - Bidirectional navigation between Templates, Controllers, and Models
  - CodeLens links: "Open Controller", "Open Model", "Open Template"
  - Go-to-Definition support (F12, Ctrl+Click) from any file type
  - Multi-target navigation when multiple related files exist
  - Warning indicators for orphaned files ("Template not found")
  - Configurable: Disable controller/model navigation independently
  - Works with existing snippet navigation feature

### Changed

- **Testing**: Expanded test suite from 36 to 179 tests (+143 new tests)
  - Added comprehensive tests for all new features
  - 7 new test suites: yamlParser, tailwindDetector, kirbyProjectExtended, pageTypeScaffolder, snippetExtractor, blueprintFieldCodeLens, fileNavigation
  - All tests passing with zero failures

- **Dependencies**: Added js-yaml for Blueprint YAML parsing
  - Production: `js-yaml@4.1.0`
  - Development: `@types/js-yaml@4.0.9`

- **Utilities**: Extended kirbyProject.ts with new helper functions
  - `isControllerFile()`, `isModelFile()` for file type detection
  - `resolveControllerPath()`, `resolveModelPath()`, `resolveTemplateFromFile()` for path resolution
  - `resolveBlueprintForTemplate()` for Blueprint file lookup
  - `validateFileName()` for security validation

### Configuration

Added 7 new configuration options:

- `kirby.showBlueprintFieldCodeLens`: Show Blueprint fields in templates (default: true)
- `kirby.showBlueprintFieldTypes`: Show field types in CodeLens (default: true)
- `kirby.blueprintFieldDisplayLimit`: Max fields shown before truncation (default: 5)
- `kirby.showControllerNavigation`: Enable controller navigation CodeLens (default: true)
- `kirby.showModelNavigation`: Enable model navigation CodeLens (default: true)
- `kirby.autoConfigureTailwind`: Auto-configure Tailwind when detected (default: false)
- `kirby.promptForTailwindSetup`: Show Tailwind setup prompt (default: true)

### Technical

- **New Source Files** (10 files):
  - `src/utils/yamlParser.ts` - Blueprint YAML parsing
  - `src/utils/tailwindDetector.ts` - Tailwind detection logic
  - `src/commands/pageTypeScaffolder.ts` - Page type scaffolding wizard
  - `src/commands/snippetExtractor.ts` - Snippet extraction tool
  - `src/integrations/tailwindIntegration.ts` - Tailwind auto-configuration
  - `src/providers/blueprintFieldCodeLens.ts` - Blueprint field CodeLens
  - `src/providers/fileNavigationCodeLens.ts` - Navigation CodeLens
  - `src/providers/fileNavigationProvider.ts` - Go-to-Definition provider
  - `src/test/` - 7 new test files with 143 tests

- **Architecture**:
  - WorkspaceEdit for atomic multi-file operations
  - Map-based caching with FileSystemWatcher invalidation
  - Security-first design with multi-layer validation
  - Command pattern for all user-facing operations

## [0.2.1] - 2025-10-25

### Added
- **License Compliance**: Bundled MIT License file for Kirby Blueprint schema
  - Complete license text now included at `src/schemas/LICENSE`
  - License properly copied to output directory during build
  - Full compliance with MIT License distribution requirements

### Changed
- **Documentation**: Added disclaimer clarifying unofficial third-party status
  - README now includes note that extension is not affiliated with or endorsed by Kirby CMS
  - Updated LICENSE file to reference bundled schema license
  - Updated README to reference bundled license file instead of external link

### Fixed
- **Issue #1**: Missing license file for bundled Blueprint schema
  - Previously only linked to external license
  - Now properly bundles complete license text with extension
  - Resolves licensing compliance concern raised by @bnomei

## [0.2.0] - 2025-10-25

### Added
- **Extension Icon**: Custom extension icon based on Kirby CMS branding
  - Hexagonal design inspired by official Kirby logo
  - Geometric symbol representing development tools
  - PNG format (256x256) optimized for VS Code marketplace

### Changed
- **Blueprint Schema**: Updated from Kirby 4 to Kirby 5 Blueprint schema
  - Schema source: [bnomei/kirby-schema](https://github.com/bnomei/kirby-schema) (MIT licensed)
  - Provides latest field types and properties for Kirby 5

### Fixed
- **Documentation**: Updated Known Issues section to better explain the `extends` property validation warning
  - Added clarification that this is an upstream schema limitation
  - Blueprints work correctly in Kirby despite this warning
  - Upstream issue tracked at [bnomei/kirby-schema#38](https://github.com/bnomei/kirby-schema/issues/38)

## [0.1.0] - 2025-10-24

### Initial MVP Release

#### Added
- **Type-Hint Injection**
  - Automatic PHPDoc type-hint injection when creating template or snippet files
  - Manual type-hint injection via `Kirby: Add Type Hints` command
  - Configurable type-hint variables
  - Duplicate detection to prevent multiple injections

- **Blueprint Schema Validation**
  - JSON Schema validation for Kirby Blueprint YAML files
  - Auto-completion for Blueprint fields, sections, and options
  - Bundled Kirby Blueprint schema (bnomei/kirby-schema, MIT licensed)
  - Support for custom schema paths

- **Snippet Navigation**
  - CodeLens links above `snippet()` function calls
  - Go-to-Definition support (F12, Ctrl+Click)
  - Peek Definition support
  - Support for nested snippets (e.g., `partials/menu`)
  - Error notifications for missing snippet files

#### Security & Quality
- **Comprehensive Testing** (36 tests, all passing)
  - Unit tests for utility functions (kirbyProject, phpParser)
  - Security tests for path traversal protection
  - Type hint generation and detection tests
  - Extension integration tests

- **Security Hardening**
  - Path traversal protection in snippet resolution
  - Input sanitization for all user-provided data
  - Multi-layer validation (sanitization + directory boundary checks)
  - Fixed race condition in file creation handler
  - Zero vulnerabilities in dependencies (verified with npm audit)

- **Development Tools**
  - Pre-commit hooks with Husky (automatic test execution)
  - Comprehensive SECURITY.md documentation
  - ESLint with TypeScript validation
  - Strict TypeScript compilation

#### Configuration
- `kirby.autoInjectTypeHints`: Enable/disable automatic type-hint injection (default: true)
- `kirby.typeHintVariables`: Customize variables in type-hint blocks (default: ["$page", "$site", "$kirby"])
- `kirby.enableBlueprintValidation`: Enable/disable Blueprint validation (default: true)
- `kirby.blueprintSchemaPath`: Custom schema path (optional)
- `kirby.showSnippetCodeLens`: Show/hide CodeLens links (default: true)

#### Technical
- Kirby project detection via `site/` directory
- Extension only activates in Kirby projects
- TypeScript 5.9.3 with strict type checking
- ESLint 9.36.0 with @typescript-eslint plugin
- Integration with Red Hat YAML extension for Blueprint support
- Automated testing via VS Code Extension Test Runner + Mocha
- Build process: TypeScript compilation + schema file copying

---

## Future Releases

See the [Roadmap](README.md#roadmap) section in the README for planned features.
