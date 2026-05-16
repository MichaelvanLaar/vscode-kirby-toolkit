# Kirby CMS Developer Toolkit

@AGENTS.md
@openspec/project.md for full architecture, conventions, domain context, and security details.

### Key Config Files

| File | Purpose |
|------|---------|
| `.claude/release-checklist.md` | Release process checklist                                                            |
| `.claude/settings.json` | Claude Code permissions and hooks                                                    |
| `.claude/skills/openspec-apply-change/SKILL.md` | Skill: implement tasks from an OpenSpec change                                       |
| `.claude/skills/openspec-archive-change/SKILL.md` | Skill: finalize and archive a completed OpenSpec change                              |
| `.claude/skills/openspec-bulk-archive-change/SKILL.md` | Skill: archive multiple completed OpenSpec changes at once                           |
| `.claude/skills/openspec-continue-change/SKILL.md` | Skill: create the next artifact in an in-progress OpenSpec change                    |
| `.claude/skills/openspec-explore/SKILL.md` | Skill: thinking-partner mode for exploring ideas before or during a change           |
| `.claude/skills/openspec-ff-change/SKILL.md` | Skill: fast-forward through all OpenSpec artifacts without stepping through each     |
| `.claude/skills/openspec-new-change/SKILL.md` | Skill: start a new OpenSpec change with a structured step-by-step approach           |
| `.claude/skills/openspec-onboard/SKILL.md` | Skill: guided onboarding walkthrough for the OpenSpec workflow                       |
| `.claude/skills/openspec-sync-specs/SKILL.md` | Skill: sync delta specs from a change to main specs without archiving                |
| `.claude/skills/openspec-verify-change/SKILL.md` | Skill: verify implementation matches change artifacts before archiving               |
| `eslint.config.mjs` | ESLint flat config with TypeScript rules                                             |
| `.github/workflows/claude-code-review.yml` | Automatic PR review by Claude                                                        |
| `.github/workflows/claude.yml` | Claude automation via `@claude` in issues/PRs                                        |
| `.gitignore` | Git ignore patterns                                                                  |
| `.mcp.json` | MCP server config                                                                    |
| `package.json` | Package metadata, dependencies, scripts                                              |
| `tsconfig.json` | TypeScript compiler config                                                           |
| `.vscode-test.mjs` | VS Code test runner config (test file glob + workspace folder)                       |

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

## Learnings

When the user corrects a mistake or points out a recurring issue, append a one-line
summary to .claude/learnings.md. Don't modify CLAUDE.md directly.

## Compact Instructions

When compacting, preserve: list of modified files, current test status (284 tests), open TODOs, key decisions made, and which OpenSpec change is in progress.

## Handoff

Before ending a session, the user may invoke `/handoff` to create a machine-transfer summary.
When resuming work, always check if HANDOFF.md exists in the project root. If it does, read it
first and continue from where it left off. After confirming the context is restored, delete the file.
