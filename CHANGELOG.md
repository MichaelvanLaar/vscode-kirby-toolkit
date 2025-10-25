# Change Log

All notable changes to the "Kirby CMS Developer Toolkit" extension will be documented in this file.

## [Unreleased]

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
