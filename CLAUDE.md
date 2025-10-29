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

This is a **Visual Studio Code extension** for **Kirby CMS** development with 8 comprehensive features:

**Core Features (MVP - v0.1.0):**
1. **Type-Hint Injection**: Automatic PHPDoc type hints for `$page`, `$site`, `$kirby`
2. **Blueprint Validation**: JSON Schema validation for Kirby Blueprint YAML files
3. **Snippet Navigation**: CodeLens and Go-to-Definition for `snippet()` calls

**Toolkit Features (v0.3.0):**
4. **Page Type Scaffolding**: Interactive wizard to generate Blueprint, Template, Controller, Model
5. **Snippet Extraction**: Refactor selected code into reusable snippets
6. **Tailwind CSS Integration**: Auto-detect and configure Tailwind IntelliSense for PHP
7. **Blueprint Field Display**: CodeLens showing Blueprint fields in templates
8. **Extended File Navigation**: Navigate between Templates, Controllers, and Models

### Quick Start

- **Read First**: [openspec/project.md](openspec/project.md) - Comprehensive project documentation
- **Tech Stack**: TypeScript 5.9.3 + VS Code Extension API + js-yaml
- **Testing**: 179 tests across 12 test suites (run `npm test` before commits)
- **Build**: `npm run compile` (TypeScript + schema copying)

### Key Files

- [src/extension.ts](src/extension.ts) - Extension entry point
- [src/commands/](src/commands/) - User-facing commands (scaffolding, extraction)
- [src/providers/](src/providers/) - CodeLens and Definition providers
- [src/integrations/](src/integrations/) - Third-party integrations (Tailwind)
- [src/utils/kirbyProject.ts](src/utils/kirbyProject.ts) - Project detection & path resolution
- [openspec/project.md](openspec/project.md) - Full project documentation

### Important Rules

- **Security First**: Always validate user inputs, use `resolveSnippetPath()` and `validateFileName()` for file paths
- **Test Coverage**: All changes must pass 179 tests (enforced by Husky pre-commit hook)
- **No Kirby Runtime**: Extension runs in VS Code, cannot execute PHP or call Kirby APIs
- **OpenSpec for Features**: Use OpenSpec workflow for new features/breaking changes
- **Release Process**: Follow [.claude/release-checklist.md](.claude/release-checklist.md) for publishing new versions

For complete context including architecture, conventions, testing strategy, and domain knowledge, see [openspec/project.md](openspec/project.md).
- Always use Conventional Commits and gitmoji when creating git commit messages.