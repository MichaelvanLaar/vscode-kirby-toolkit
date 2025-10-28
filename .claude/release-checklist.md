# Release Checklist for VS Code Extension

This checklist should be followed every time a new version is ready for release.

## Pre-Release Verification

- [ ] All features/fixes for this release are complete and merged
- [ ] All tests passing (179 tests, enforced by pre-commit hooks)
- [ ] No linting errors (`npm run lint`)
- [ ] No security vulnerabilities (`npm audit`)
- [ ] Extension builds successfully (`npm run compile`)
- [ ] Check `.gitignore` file: Review and update if recent changes require ignoring additional files/directories
- [ ] **Check for archivable OpenSpec changes**: Run `openspec list` to verify if any completed changes need archiving

## Version & Documentation Updates

- [ ] **Determine version number** following semantic versioning:

  - Patch (0.3.x): Bug fixes, minor improvements
  - Minor (0.x.0): New features, backward compatible
  - Major (x.0.0): Breaking changes

- [ ] **Update CHANGELOG.md**:

  - Move items from `[Unreleased]` to new version section with date
  - Use format: `## [X.Y.Z] - YYYY-MM-DD`
  - Categorize changes: Added, Changed, Fixed, Removed, Security
  - Include feature codes (e.g., FR-2.1) where applicable
  - List new configuration options if any
  - Update test counts if changed
  - Document any breaking changes prominently

- [ ] **Review README.md**:

  - Ensure all new features are documented
  - Update feature count if changed (currently 8 features)
  - Update test count if changed (currently 179 tests)
  - Check installation instructions are current
  - Verify all code examples are accurate
  - Update screenshots/images if UI changed

- [ ] **Review package.json**:

  - Verify description is accurate
  - Check keywords are relevant for discoverability
  - Confirm all new configuration options are listed in `contributes.configuration`
  - Ensure all new commands are registered in `contributes.commands`

- [ ] Review `.gitignore`: Ensure all build artifacts, temporary files, and sensitive data are properly ignored

- [ ] **Update other documentation** if needed:
  - CLAUDE.md (project context for AI)
  - openspec/project.md (comprehensive project documentation)
  - SECURITY.md (if security-related changes)

## Bump Version

- [ ] **Update version in package.json**:
  - Change `"version": "X.Y.Z"` to new version number
  - Example: `"version": "0.3.0"` → `"version": "0.4.0"`

## Testing & Quality Assurance

- [ ] Run full test suite: `npm test`

  - All 179 tests must pass
  - Pre-commit hook will enforce this, but verify manually too

- [ ] Test extension manually:
  - Press F5 to launch Extension Development Host
  - Test new features in a real Kirby project
  - Verify existing features still work
  - Test with fresh VS Code window

## OpenSpec Management

- [ ] **Archive completed OpenSpec changes**:

  ```bash
  openspec list
  ```

  - If any completed changes are listed, archive them:

    ```bash
    openspec archive <change-id> --yes
    ```

    Or if specs are already updated manually:

    ```bash
    openspec archive <change-id> --yes --skip-specs
    ```

  - Verify archive was created:

    ```bash
    openspec validate --all --strict
    ```

- [ ] **Stage OpenSpec changes** (if any were archived):

  ```bash
  git add openspec/
  ```

## Commit & Tag

- [ ] **Stage all changes**:

  ```bash
  git add CHANGELOG.md package.json README.md [other-modified-files]
  ```

- [ ] **Commit with descriptive message**:

  ```bash
  git commit -m "Release version X.Y.Z

  [Brief summary of major changes in this release]

  🤖 Generated with [Claude Code](https://claude.com/claude-code)

  Co-Authored-By: Claude <noreply@anthropic.com>"
  ```

  - Pre-commit hook will run tests automatically

- [ ] **Create annotated git tag**:

  ```bash
  git tag -a vX.Y.Z -m "Version X.Y.Z - [Brief description]"
  ```

- [ ] **Push to GitHub**:
  ```bash
  git push && git push --tags
  ```

## GitHub Release

- [ ] **Package extension**:

  ```bash
  vsce package
  ```

  - This creates `vscode-kirby-toolkit-X.Y.Z.vsix`

- [ ] **Create GitHub release**:

  ```bash
  gh release create vX.Y.Z vscode-kirby-toolkit-X.Y.Z.vsix \
    --title "vX.Y.Z - [Release Title]" \
    --notes "[Release notes from CHANGELOG]"
  ```

- [ ] **Verify GitHub release**:
  - Visit: https://github.com/MichaelvanLaar/vscode-kirby-toolkit/releases
  - Confirm release appears with VSIX file attached
  - Check release notes render correctly

## Marketplace Publishing

- [ ] **Publish to VS Code Marketplace**:

  ```bash
  vsce publish
  ```

  - Or with PAT: `vsce publish -p <token>`
  - This automatically runs `vscode:prepublish` script

- [ ] **Verify marketplace publication** (5-10 minutes after publish):
  - Visit: https://marketplace.visualstudio.com/items?itemName=MichaelvanLaar.vscode-kirby-toolkit
  - Confirm new version number is displayed
  - Check README renders correctly
  - Verify icon displays
  - Test installation from marketplace

## Post-Release

- [ ] **Test installation from marketplace**:

  ```bash
  code --install-extension MichaelvanLaar.vscode-kirby-toolkit
  ```

- [ ] **Verify extension works** after marketplace install:

  - Open a Kirby project
  - Test key features (type hints, navigation, scaffolding)
  - Check all CodeLens providers work

- [ ] **Update project board/issues** (if applicable):

  - Close issues fixed in this release
  - Update project milestones
  - Move tasks to "Released" status

- [ ] **Announce release** (optional):
  - Kirby Forum: https://forum.getkirby.com
  - Social media if significant release
  - Newsletter to users (if you have one)

## Rollback Procedure (if needed)

If critical issues are discovered after publishing:

1. **Unpublish from marketplace** (use with caution):

   ```bash
   vsce unpublish MichaelvanLaar.vscode-kirby-toolkit@X.Y.Z
   ```

2. **Delete GitHub release**:

   ```bash
   gh release delete vX.Y.Z
   ```

3. **Delete git tag**:

   ```bash
   git tag -d vX.Y.Z
   git push origin :refs/tags/vX.Y.Z
   ```

4. **Fix issues and create patch release** (X.Y.Z+1)

---

## Quick Reference: Version Number Guide

- **Patch** (0.3.1): Bug fixes, documentation updates, minor improvements
- **Minor** (0.4.0): New features, new commands, backward compatible changes
- **Major** (1.0.0): Breaking changes, major architecture changes, removed features

## Notes

- **Pre-commit hooks** automatically run tests before every commit (via Husky)
- **All 179 tests must pass** before release (enforced by hooks)
- **No security vulnerabilities** tolerated (run `npm audit` regularly)
- Follow **semantic versioning**: https://semver.org/
- Keep **CHANGELOG.md** updated throughout development, not just at release time
- **Review `.gitignore`** before each release to ensure proper file exclusion
- **Archive OpenSpec changes** as part of release to keep specs synchronized with released code
