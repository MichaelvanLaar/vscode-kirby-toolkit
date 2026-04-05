# Kirby CMS Developer Toolkit

@AGENTS.md
@openspec/project.md for full architecture, conventions, domain context, and security details.

### Key Config Files

| File                                                   | Purpose                                       |
| ------------------------------------------------------ | --------------------------------------------- |
| `.claude/release-checklist.md`                         | Release process checklist                     |
| `.claude/settings.json`                                | Claude Code permissions and hooks             |
| `.claude/settings.local.json`                          | Local Claude Code overrides (gitignored)      |
| `.claude/skills/cc-init/SKILL.md`                      | TODO: add description                         |
| `.claude/skills/cc-optimize/SKILL.md`                  | TODO: add description                         |
| `.claude/skills/openspec-apply-change/SKILL.md`        | TODO: add description                         |
| `.claude/skills/openspec-archive-change/SKILL.md`      | TODO: add description                         |
| `.claude/skills/openspec-bulk-archive-change/SKILL.md` | TODO: add description                         |
| `.claude/skills/openspec-continue-change/SKILL.md`     | TODO: add description                         |
| `.claude/skills/openspec-explore/SKILL.md`             | TODO: add description                         |
| `.claude/skills/openspec-ff-change/SKILL.md`           | TODO: add description                         |
| `.claude/skills/openspec-new-change/SKILL.md`          | TODO: add description                         |
| `.claude/skills/openspec-onboard/SKILL.md`             | TODO: add description                         |
| `.claude/skills/openspec-sync-specs/SKILL.md`          | TODO: add description                         |
| `.claude/skills/openspec-verify-change/SKILL.md`       | TODO: add description                         |
| `eslint.config.mjs`                                    | ESLint flat config with TypeScript rules      |
| `.github/workflows/claude-code-review.yml`             | Automatic PR review by Claude                 |
| `.github/workflows/claude.yml`                         | Claude automation via `@claude` in issues/PRs |
| `.gitignore`                                           | Git ignore patterns                           |
| `.mcp.json`                                            | MCP server config                             |
| `package.json`                                         | Package metadata, dependencies, scripts       |
| `tsconfig.json`                                        | TypeScript compiler config                    |
| `.vscode-test.mjs`                                     | TODO: add description                         |

## Configuration Management

When running config optimization or audit tasks, always check for duplicate entries across `.claude/settings.json`, `.claude/settings.local.json`, and project-level configs before proposing changes.

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

## Handoff

Before ending a session, the user may invoke `/handoff` to create a machine-transfer summary.
When resuming work, always check if HANDOFF.md exists in the project root. If it does, read it
first and continue from where it left off. After confirming the context is restored, delete the file.
