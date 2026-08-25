# Project: Kirby CMS Developer Toolkit

VS Code extension for Kirby CMS development — type-hints, Blueprint validation, scaffolding, snippet navigation, build integration, and more (11 features, 284 tests).

## Stack

TypeScript 5.9, VS Code Extension API ^1.60.0, js-yaml, JSON Schema, Mocha, ESLint, Husky.

## Setup

- Install: `npm install`
- Build: `npm run compile` (TypeScript + schema/stub copying)
- Test: `npm test` (compile + lint + 284 tests)
- Lint: `npm run lint`
- Watch: `npm run watch`

## Architecture

Entry point: `src/extension.ts`. Providers in `src/providers/`, commands in `src/commands/`, integrations in `src/integrations/`, utilities in `src/utils/`, schemas in `src/schemas/`, stubs in `src/stubs/`.
Full documentation: `openspec/project.md`.

## Conventions

- Conventional Commits with gitmoji.
- Strict TypeScript — no `any` types.
- All public APIs documented with JSDoc.
- camelCase for files/functions, PascalCase for classes.
- Security: always validate file paths via `resolveSnippetPath()` and `validateFileName()`.
- Tests required for all new features; security-critical paths need >90% coverage.

## Constraints

- No Kirby runtime — extension cannot execute PHP or call Kirby APIs.
- Standard `site/` directory structure only.
- Offline — schema and stubs bundled locally.
- Pre-commit hook enforces full test suite.

## Safety

- Never read or write `.env`, `.env.*`, or `secrets/` files.
- Validate all user inputs before file system operations.
- Path traversal protection required for all file path handling.

## OpenSpec

This project uses OpenSpec for structured change management. See `openspec/config.yaml`.
