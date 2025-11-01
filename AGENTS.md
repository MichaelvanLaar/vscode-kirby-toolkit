<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

## Kirby CMS Developer Toolkit - Project Context

## What This Project Is

This is a **Visual Studio Code extension** that enhances productivity for developers working with **Kirby CMS** (a file-based PHP content management system). The extension provides:

1. **Automatic Type-Hint Injection**: Adds PHPDoc type hints for Kirby's global variables (`$page`, `$site`, `$kirby`) in templates and snippets
2. **Blueprint Schema Validation**: Real-time YAML validation and auto-completion for Kirby Blueprint files using JSON Schema
3. **Snippet Navigation**: CodeLens links and Go-to-Definition support for navigating from `snippet()` calls to snippet files

## Quick Reference

- **Tech Stack**: TypeScript 5.9.3 + VS Code Extension API ^1.60.0
- **Target Platform**: Kirby CMS (PHP file-based CMS)
- **Testing**: 36 comprehensive tests (Mocha + VS Code Extension Test Runner)
- **Security**: Path traversal protection, input validation, 0 vulnerabilities
- **Repository**: <https://github.com/MichaelvanLaar/vscode-kirby-toolkit>

## Key Project Files

- `src/extension.ts` - Main entry point with activate()/deactivate()
- `src/providers/` - CodeLens and Definition providers for language features
- `src/utils/kirbyProject.ts` - Kirby project detection and snippet path resolution
- `src/utils/phpParser.ts` - Regex-based PHP parsing for snippet() calls
- `src/config/settings.ts` - Centralized VS Code settings access
- `src/schemas/blueprint.schema.json` - Bundled Kirby Blueprint JSON Schema (from bnomei/kirby-schema, MIT)
- `openspec/project.md` - **COMPREHENSIVE project documentation** (read this for full context)

## Development Workflow

### Before Starting Any Task

1. **Read** [openspec/project.md](openspec/project.md) for comprehensive context including:
   - Architecture patterns and conventions
   - Security considerations and testing strategy
   - Kirby CMS domain knowledge
   - Build process and dependencies

2. **For OpenSpec-managed changes** (new features, breaking changes, architecture shifts):
   - Follow the workflow in [openspec/AGENTS.md](openspec/AGENTS.md)
   - Create proposal → validate → implement → archive

3. **For bug fixes and simple changes**:
   - Write tests first (or verify existing tests cover the fix)
   - Ensure all 36 tests pass before committing
   - Security-related changes MUST have test coverage

### Testing Requirements

- **Pre-commit Hook**: Husky runs `npm test` before every commit (compile + lint + test suite)
- **Test Files**: `src/test/*.test.ts` (security, unit, feature, integration tests)
- **Run Tests**: `npm test` (must pass 36/36 tests)
- **Test Coverage**: Focus on security-critical paths (path handling, input validation)

### Code Style

- **TypeScript**: Strict mode enabled, ES2022 target
- **ESLint**: 2-space indentation, semicolons required, strict equality
- **Naming**: camelCase for functions/files, PascalCase for classes
- **Documentation**: JSDoc for public APIs

## Important Constraints

- **No Kirby Runtime**: Cannot execute Kirby PHP code or call Kirby APIs (extension runs in VS Code, not PHP)
- **Regex-based Parsing**: Uses simple regex for PHP parsing (not full AST parser)
- **Standard Structure Only**: Assumes default `site/` directory structure
- **Offline Functionality**: Must work without internet (schema bundled locally)
- **Performance**: Fast activation (<500ms), limited file scanning to <500KB files

## Security Principles

- **Always validate and sanitize** user inputs before file system operations
- **Path traversal protection**: Use `resolveSnippetPath()` from `src/utils/kirbyProject.ts`
- **Write security tests** for any new file path handling or user input processing
- **Check dependency security**: Run `npm audit` regularly (currently: 0 vulnerabilities)

## Domain Knowledge

### Kirby CMS Structure

```text
site/
├── templates/      # PHP template files (use $page, $site, $kirby)
├── snippets/       # Reusable PHP code blocks (loaded via snippet())
├── blueprints/     # YAML files defining content structure
├── config/         # PHP configuration
└── controllers/    # PHP controller files
```

### Key Kirby Concepts

- **Global Variables**: `$page` (current page), `$site` (site object), `$kirby` (Kirby instance)
- **Snippet Function**: `snippet('name')` loads `site/snippets/name.php`
- **Blueprints**: YAML files with JSON Schema validation (fields, sections, validation rules)

## Getting Help

- **Full Documentation**: [openspec/project.md](openspec/project.md)
- **OpenSpec Workflow**: [openspec/AGENTS.md](openspec/AGENTS.md)
- **User Documentation**: [README.md](README.md)
- **Security Info**: [SECURITY.md](SECURITY.md)
