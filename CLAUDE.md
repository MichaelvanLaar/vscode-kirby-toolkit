# Kirby CMS Developer Toolkit

VS Code extension for Kirby CMS development — type-hints, Blueprint validation, scaffolding, snippet navigation, build integration, and more (11 features, 284 tests).

## Stack

TypeScript 5.9, VS Code Extension API ^1.60.0, js-yaml, JSON Schema, Mocha, ESLint, Husky.

## Architecture

Providers (`src/providers/`) for language features, commands (`src/commands/`) for user actions, integrations (`src/integrations/`) for third-party tools, utilities (`src/utils/`) for shared logic.

@openspec/project.md for full architecture, conventions, domain context, and security details.

## Key Conventions

- Conventional Commits with gitmoji.
- Strict TypeScript — no `any` types.
- All public APIs documented with JSDoc.
- Security first: always use `resolveSnippetPath()` and `validateFileName()` for file paths.
- Tests: 284 tests across 12 suites; run `npm test` before commits (enforced by Husky).

## Important Constraints

- No Kirby runtime — extension runs in VS Code, cannot execute PHP.
- Standard `site/` directory structure only.
- Offline functionality — schema bundled locally.
- Files >500KB are skipped for parsing.

## Publishing

@.claude/release-checklist.md

## OpenSpec

This project uses OpenSpec for structured change management.
Use OpenSpec workflow for new features and breaking changes.
See `openspec/config.yaml` for workflow configuration.
