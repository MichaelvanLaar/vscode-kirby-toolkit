# GitHub Repository Setup Guide

## Repository Name Convention

✅ **Repository Name**: `vscode-kirby-toolkit`

This follows the standard VS Code extension naming convention:
- Pattern: `vscode-{extension-name}`
- Examples: `vscode-gitlens`, `vscode-extension-samples`
- All lowercase with hyphens (kebab-case)

## Important: Package Name vs Repository Name

**Package Name** (stays unchanged):
- `kirby-cms-developer-toolkit` in `package.json`
- This is the VS Code Marketplace identifier
- Users will search for "Kirby CMS Developer Toolkit"

**Repository Name** (follows convention):
- `vscode-kirby-toolkit` on GitHub
- Shorter, follows VS Code extension standards
- Clear for developers browsing GitHub

## Steps to Create GitHub Repository

### 1. Create the Repository on GitHub

```bash
# Go to GitHub.com and create a new repository:
# - Name: vscode-kirby-toolkit
# - Description: VS Code extension for Kirby CMS development
# - Public or Private: Your choice
# - DO NOT initialize with README (we already have one)
```

### 2. Update Local Repository URLs

Replace `YOUR-USERNAME` in the following files with your actual GitHub username:

**`package.json`**:
```json
"repository": {
  "url": "https://github.com/YOUR-USERNAME/vscode-kirby-toolkit"
},
"bugs": {
  "url": "https://github.com/YOUR-USERNAME/vscode-kirby-toolkit/issues"
}
```

**`README.md`**:
```markdown
- **Issues**: [Report bugs...](https://github.com/YOUR-USERNAME/vscode-kirby-toolkit/issues)
```

### 3. Initialize Git and Push

```bash
# Add the remote
git remote add origin https://github.com/YOUR-USERNAME/vscode-kirby-toolkit.git

# Or if you're using SSH:
git remote add origin git@github.com:YOUR-USERNAME/vscode-kirby-toolkit.git

# Add all files
git add .

# Create initial commit
git commit -m "feat: initial MVP release v0.1.0

- Type-hint injection for templates and snippets
- Blueprint schema validation and auto-completion
- Snippet navigation with CodeLens and Go-to-Definition

🤖 Generated with Claude Code"

# Push to GitHub
git push -u origin main
```

### 4. Optional: Create Initial Release

After pushing, create a GitHub release:

1. Go to your repository on GitHub
2. Click "Releases" → "Create a new release"
3. Tag: `v0.1.0`
4. Title: `v0.1.0 - Initial MVP Release`
5. Description: Copy from `CHANGELOG.md`
6. Attach: `kirby-cms-developer-toolkit-0.1.0.vsix`
7. Publish release

### 5. Update Package and Rebuild (if needed)

After updating `YOUR-USERNAME` to your actual username:

```bash
# Recompile with updated repository info
npm run compile

# Repackage extension
vsce package
```

## Repository Best Practices

✅ **Add Topics/Tags on GitHub**:
- `vscode-extension`
- `kirby-cms`
- `php`
- `developer-tools`
- `productivity`

✅ **Add .gitattributes** (optional):
```
*.vsix binary
```

✅ **Consider GitHub Actions** (future):
- Automated testing
- Release automation
- Marketplace publishing

## Current Status

- ✅ **Local directory renamed** to `vscode-kirby-toolkit`
- ✅ **Repository naming convention** applied: `vscode-kirby-toolkit`
- ✅ **Package.json** repository fields updated (placeholder)
- ✅ **README.md** repository links updated (placeholder)
- ✅ **Extension rebuilt** successfully in renamed directory
- ⏳ **Waiting** for actual GitHub username to finalize
- ⏳ **Ready to push** when repository is created

## Next Actions

1. Create `vscode-kirby-toolkit` repository on GitHub
2. Replace `YOUR-USERNAME` with actual username in:
   - `package.json`
   - `README.md`
3. Run commands from "Initialize Git and Push" section above
4. Optionally create v0.1.0 release on GitHub
