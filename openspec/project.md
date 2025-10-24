# Project Context

## Purpose

The **Kirby CMS Developer Toolkit** is a Visual Studio Code extension designed to enhance productivity for web developers working with Kirby CMS, a file-based PHP content management system. The toolkit addresses common workflow pain points by automating repetitive tasks (type-hint injection), providing intelligent validation and auto-completion (Blueprint YAML support), and enabling seamless navigation between related project files (snippet navigation).

**Primary Goals**:
- Reduce manual boilerplate code writing (PHPDoc type-hints)
- Prevent errors through YAML validation for Kirby Blueprints
- Accelerate development with quick navigation between templates, snippets, and blueprints
- Provide zero-configuration experience with sensible defaults

## Tech Stack

- **Extension Development**: TypeScript with VS Code Extension API
- **Target Platform**: Kirby CMS (PHP-based, file-based CMS)
- **Build Tools**: Webpack or esbuild (via VS Code extension scaffold)
- **Testing**: VS Code Extension Test Runner, Mocha
- **Integrated Technologies**:
  - YAML (for Kirby Blueprint files)
  - JSON Schema (for YAML validation)
  - PHP (parsing snippet() calls, injecting PHPDoc)

## Project Conventions

### Code Style

- **Language**: TypeScript with strict type checking enabled
- **Formatting**: Prettier with default settings (2-space indentation, single quotes, trailing commas)
- **Naming**:
  - Files: `camelCase.ts` for utilities, `PascalCase.ts` for providers/classes
  - Functions: `camelCase` for functions and methods
  - Classes: `PascalCase` for class names
  - Constants: `UPPER_SNAKE_CASE` for immutable constants
- **Imports**: Organize imports (third-party → VS Code API → local modules)
- **Documentation**: Use JSDoc comments for public APIs and complex logic

### Architecture Patterns

- **Provider Pattern**: Use VS Code provider interfaces (CodeLensProvider, DefinitionProvider) for language features
- **Dependency Injection**: Pass configuration and utilities as parameters rather than global state
- **Single Responsibility**: Each provider/module handles one feature or concern
- **Utilities Separation**: Pure functions for path resolution, parsing, and detection in `utils/` directory
- **Configuration Access**: Centralize VS Code settings access in `config/settings.ts`
- **Extension Lifecycle**: Follow standard VS Code extension pattern with `activate()` and `deactivate()` functions

### Testing Strategy

- **Unit Tests**: Test pure utility functions (path resolution, snippet parsing) with Mocha
- **Integration Tests**: Test VS Code API interactions using Extension Test Runner
- **Coverage Target**: Aim for >80% code coverage for core logic
- **Test Fixtures**: Maintain sample Kirby project structure in `test-fixtures/` for realistic testing
- **Manual Testing**: Maintain checklist of manual test scenarios for each feature (see tasks.md section 8)

### Git Workflow

- **Branching**:
  - `main` branch for stable releases
  - Feature branches: `feature/description` (e.g., `feature/type-hint-injection`)
  - Bugfix branches: `fix/issue-number-description`
- **Commits**:
  - Follow Conventional Commits format: `type(scope): description`
  - Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`
  - Example: `feat(type-hints): add automatic PHPDoc injection on file creation`
- **Pull Requests**: Each PR should correspond to one OpenSpec change proposal
- **Code Review**: Required before merging feature branches

## Domain Context

### Kirby CMS Fundamentals

- **File-Based CMS**: Content stored as files, not in a database
- **Standard Directory Structure**:
  - `site/templates/` - PHP template files for page rendering
  - `site/snippets/` - Reusable PHP code blocks
  - `site/blueprints/` - YAML configuration files defining content structure
  - `site/config/` - PHP configuration files
  - `site/controllers/` - PHP controller files for template logic
- **Global Variables**: Kirby provides `$page`, `$site`, `$kirby` in templates/snippets
- **Snippet System**: `snippet('name')` function loads `site/snippets/name.php`
- **Blueprints**: YAML files defining fields, sections, and validation for content editing

### VS Code Extension Context

- **Activation Events**: Extensions should activate lazily based on language or workspace conditions
- **Language Providers**: CodeLens, Definition, Hover, etc. are standard patterns for language features
- **Configuration**: Extensions expose settings via `package.json` contributions
- **Dependencies**: Extensions can depend on other extensions (e.g., RedHat YAML extension)

## Important Constraints

### Technical Constraints

- **VS Code API Compatibility**: Must work with VS Code version 1.70.0+ (check specific API availability)
- **PHP Parsing Limitations**: Use simple regex-based parsing for MVP; full PHP AST parsing out of scope
- **No Kirby Runtime Dependency**: Extension cannot execute Kirby PHP code or call Kirby APIs
- **Standard Kirby Structure Only**: MVP assumes default `site/` directory structure; custom configurations out of scope
- **Offline Functionality**: Extension must work without internet connection (bundled schema)

### Performance Constraints

- **Fast Activation**: Extension activation time should be <500ms
- **Memory Footprint**: Minimal memory usage; leverage VS Code's lazy loading and incremental parsing
- **Large File Handling**: Limit regex scanning to files <500KB to prevent editor slowdown

### User Experience Constraints

- **Zero Configuration**: Must work out-of-box without requiring user configuration
- **Non-Intrusive**: Features should enhance workflow without cluttering UI (allow disabling CodeLens)
- **Error Handling**: Graceful degradation when files not found or YAML extension unavailable

## External Dependencies

### Required Dependencies

- **VS Code Extension API**: Core dependency, version specified in `package.json` engines
- **RedHat YAML Extension** (`redhat.vscode-yaml`): Required for Blueprint schema validation (declared as extensionDependency)

### Optional Dependencies

- **Intelephense** (bmewburn.vscode-intelephense-client): PHP language server that benefits from type-hints but not required by extension
- **Kirby Blueprint JSON Schema**: Community schema (e.g., johannschopplich/kirby-types-blueprint) or custom-created schema

### Build Dependencies

- **TypeScript**: Compilation to JavaScript
- **Webpack/esbuild**: Bundling extension code
- **VS Code Extension Test Runner**: Integration testing
- **Mocha**: Unit testing framework
- **vsce**: VS Code Extension Manager for packaging and publishing

## Notes for AI Assistants

- When implementing features, always check if workspace is a Kirby project before activating functionality
- Prioritize simplicity and maintainability over feature completeness for MVP
- Use VS Code's built-in capabilities (providers, configuration) rather than custom solutions
- Reference VS Code Extension API documentation for implementation patterns
- Test in realistic Kirby project structures, not just minimal examples
