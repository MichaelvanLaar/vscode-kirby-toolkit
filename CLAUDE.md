# Kirby CMS Developer Toolkit

@AGENTS.md
@openspec/project.md for full architecture, conventions, domain context, and security details.

## Commands

- Build: `npm run compile`
- Test: `npm test` (compile + lint + 284 tests)
- Lint: `npm run lint`
- Watch: `npm run watch`
- Audit: `npm audit`

## Publishing

@.claude/release-checklist.md **Read when:** preparing a release or bumping version.

## OpenSpec

This project uses OpenSpec for structured change management.
Use OpenSpec workflow for new features and breaking changes.
See `openspec/config.yaml` for workflow configuration.

## Compact Instructions

When compacting, preserve: list of modified files, current test status (284 tests), open TODOs, key decisions made, and which OpenSpec change is in progress.
