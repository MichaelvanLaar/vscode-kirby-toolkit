# Kirby CMS Developer Toolkit

A comprehensive Visual Studio Code extension that significantly enhances productivity for Kirby CMS developers by providing intelligent code generation, refactoring tools, navigation, type-hints, and Blueprint validation.

> **Note:** This is an unofficial third-party extension and is not affiliated with or endorsed by Kirby CMS.

## Features

### 1. Page Type Scaffolding

Quickly generate complete page types with all necessary files through an interactive wizard.

**Features:**
- 🚀 Interactive command palette wizard
- 📝 Generates Blueprint YAML with sensible defaults
- 🎨 Creates HTML5 template boilerplate
- ⚙️ Optional Controller and Model file generation
- 🔒 Built-in security validation for file names
- ✨ Automatic type-hint injection in templates
- 📂 Creates necessary directories automatically

**Usage:**
1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Run `Kirby: New Page Type`
3. Enter the page type name (e.g., "project", "article")
4. Select which files to generate:
   - Blueprint (Required) - `site/blueprints/pages/project.yml`
   - Template (Required) - `site/templates/project.php`
   - Controller (Optional) - `site/controllers/project.php`
   - Model (Optional) - `site/models/project.php`
5. Files are created with sensible defaults and opened automatically

**Example Output:**

Blueprint (`site/blueprints/pages/project.yml`):
```yaml
title: Project

fields:
  title:
    type: text
    label: Title
  text:
    type: textarea
    label: Text
```

Template (`site/templates/project.php`):
```php
<?php
/**
 * @var \Kirby\Cms\Page $page
 * @var \Kirby\Cms\Site $site
 * @var \Kirby\Cms\App $kirby
 */
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title><?= $page->title() ?></title>
</head>
<body>
  <h1><?= $page->title() ?></h1>
  <div><?= $page->text()->kirbytext() ?></div>
</body>
</html>
```

Model (`site/models/project.php`):
```php
<?php

use Kirby\Cms\Page;

class ProjectPage extends Page
{
  // Add custom page methods here
}
```

### 2. Extract to Snippet

Refactor selected code into reusable snippets with automatic replacement.

**Features:**
- ✂️ Extract any selected code to a new snippet file
- 🔄 Automatically replaces selection with `snippet()` call
- 🎯 Smart PHP context detection (adds tags only when needed)
- 📐 Preserves indentation perfectly
- 🗂️ Supports nested snippet paths (e.g., `partials/menu`)
- ⚠️ Validates bracket balance and warns about potential issues
- 🔒 Prevents overwriting existing snippet files
- ↩️ Full undo support via WorkspaceEdit

**Usage:**
1. Select the code you want to extract (in any template or snippet file)
2. Right-click and choose `Kirby: Extract to Snippet`
   - Or use Command Palette: `Kirby: Extract to Snippet`
3. Enter snippet name (e.g., "header" or "partials/menu")
4. The selected code is moved to `site/snippets/header.php`
5. Original selection is replaced with `<?php snippet('header') ?>`

**Example:**

Before extraction:
```php
<header class="site-header">
  <h1><?= $site->title() ?></h1>
  <nav><?= snippet('menu') ?></nav>
</header>
```

After extraction (with name "header"):
```php
<?php snippet('header') ?>
```

New file `site/snippets/header.php`:
```php
<?php
/**
 * @var \Kirby\Cms\Page $page
 * @var \Kirby\Cms\Site $site
 * @var \Kirby\Cms\App $kirby
 */
?>
<header class="site-header">
  <h1><?= $site->title() ?></h1>
  <nav><?= snippet('menu') ?></nav>
</header>
```

### 3. Tailwind CSS Integration

Automatic detection and configuration of Tailwind CSS IntelliSense for PHP templates.

**Features:**
- 🔍 Auto-detects Tailwind CSS in your project
- ⚡ One-click configuration for IntelliSense in PHP files
- 📦 Checks for Tailwind CSS IntelliSense extension
- 🔧 Updates workspace settings automatically
- 💾 Remembers your choice (doesn't prompt again)
- 📝 Manual configuration command available

**How it works:**
1. Extension detects `tailwindcss` in your `package.json`
2. Prompts: "Tailwind CSS detected. Enable IntelliSense for PHP templates?"
3. Click "Yes" to automatically configure workspace settings
4. Tailwind class completion now works in your PHP template files!

**What gets configured:**
```json
{
  "tailwindCSS.includeLanguages": {
    "php": "html"
  }
}
```

**Manual configuration:**
- Command: `Kirby: Configure Tailwind IntelliSense`
- Reset prompt: `Kirby: Reset Tailwind Integration Prompt`

**Requirements:**
- [Tailwind CSS IntelliSense extension](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) by Brad Cornes
- `tailwindcss` in your project's dependencies or devDependencies

### 4. Blueprint Field Navigation

See available custom fields from your Blueprints directly in template files.

**Features:**
- 👁️ CodeLens shows Blueprint fields at the top of templates
- 🗺️ Automatic template-to-Blueprint matching
- 📊 Shows field names and optionally their types
- ✂️ Truncates long field lists intelligently
- 🔗 Click to open the corresponding Blueprint file
- ⚡ Caching for optimal performance
- 📝 Supports nested Blueprint structures (tabs, sections, columns)

**Usage:**
Open any template file (e.g., `site/templates/project.php`), and you'll see a CodeLens at the top showing available fields from `site/blueprints/pages/project.yml`:

```
Blueprint Fields: title, description, image, date, tags ... (+3 more)
```

Click the CodeLens to open the Blueprint file and edit the field definitions.

**Example:**

Template: `site/templates/article.php`

CodeLens displays:
```
Blueprint Fields: title, author, date, text, tags, gallery
```

Now you know exactly which fields are available when writing:
```php
<h1><?= $page->title() ?></h1>
<p>By <?= $page->author() ?> on <?= $page->date() ?></p>
<div><?= $page->text()->kirbytext() ?></div>
```

### 5. Extended File Navigation

Seamlessly navigate between related files: Templates, Controllers, and Models.

**Features:**
- 🔗 CodeLens links for quick navigation
- ⚡ F12 / Ctrl+Click (Go-to-Definition) support
- 🔄 Bidirectional navigation (template ↔ controller ↔ model)
- 👁️ Peek Definition support
- 🎯 Multi-target navigation when multiple files exist
- 📝 Warning indicators for orphaned files
- ⚙️ Individually configurable navigation types

**Usage:**

**From Templates:**
- See "Open Controller" and "Open Model" CodeLens links at the top
- F12 on any part of the file to see all related files
- Ctrl+Click to jump to controller or model

**From Controllers:**
- See "Open Template" CodeLens link
- F12 to jump back to the template

**From Models:**
- See "Open Template" CodeLens link
- Navigate back to the template instantly

**Example:**

`site/templates/project.php` shows:
```
Open Controller | Open Model
```

`site/controllers/project.php` shows:
```
Open Template
```

F12 (Go-to-Definition) from `project.php` template shows both:
- `site/controllers/project.php`
- `site/models/project.php`

### 6. Automatic Type-Hint Injection

Automatically inject PHPDoc type hints for Kirby's global variables (`$page`, `$site`, `$kirby`) in template and snippet files.

**Features:**
- ✨ Automatic injection when creating new template or snippet files
- 🎯 Manual injection via command: `Kirby: Add Type Hints`
- ⚙️ Configurable variable list
- 🔍 IntelliSense support with Intelephense

**Usage:**
- Create a new PHP file in `site/templates/` or `site/snippets/` - type hints are added automatically
- For existing files, use the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and run `Kirby: Add Type Hints`

### 7. Blueprint Schema Validation

JSON Schema validation and auto-completion for Kirby Blueprint YAML files.

**Features:**
- ✅ Real-time validation of Blueprint syntax
- 💡 Auto-completion for field types, sections, and options
- 📝 Inline documentation and hints
- 🎨 Syntax highlighting for Blueprint-specific keys

**How it works:**
- Open any `.yml` file in `site/blueprints/`
- Get instant validation and auto-completion powered by the official Kirby Blueprint schema

**Schema Attribution:**
This extension bundles the [Kirby Blueprint JSON Schema](https://github.com/bnomei/kirby-schema) by [bnomei](https://github.com/bnomei), licensed under MIT.

### 8. Snippet Navigation

Quickly navigate from `snippet()` function calls to their corresponding snippet files.

**Features:**
- 🔗 CodeLens links above `snippet()` calls
- ⚡ Go-to-Definition support (F12, Ctrl+Click)
- 👁️ Peek Definition support
- 🗂️ Support for nested snippets (e.g., `snippet('partials/menu')`)

**Usage:**
- Click the "Open Snippet" link above any `snippet()` call
- Or use F12 / Ctrl+Click (Cmd+Click on macOS) on the snippet name
- Works in both templates and snippets

## Requirements

- **VS Code**: Version 1.105.0 or higher
- **Kirby CMS project**: Extension detects and activates only in workspaces containing a `site/` directory
- **YAML extension**: The [Red Hat YAML extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) is required for Blueprint validation (automatically installed as dependency)

## Extension Settings

This extension contributes the following settings:

### Type Hints
* `kirby.autoInjectTypeHints`: Enable/disable automatic type-hint injection on file creation (default: `true`)
* `kirby.typeHintVariables`: Array of variable names to include in type-hint blocks (default: `["$page", "$site", "$kirby"]`)

### Blueprint Validation
* `kirby.enableBlueprintValidation`: Enable/disable Blueprint JSON Schema validation (default: `true`)
* `kirby.blueprintSchemaPath`: Path to custom Blueprint JSON Schema file (leave empty to use bundled schema)

### Blueprint Field CodeLens
* `kirby.showBlueprintFieldCodeLens`: Show/hide CodeLens with Blueprint fields in templates (default: `true`)
* `kirby.showBlueprintFieldTypes`: Show field types in Blueprint field CodeLens (default: `false`)
* `kirby.blueprintFieldDisplayLimit`: Maximum number of fields to display before truncating (default: `5`)

### Navigation
* `kirby.showSnippetCodeLens`: Show/hide CodeLens links above snippet() calls (default: `true`)
* `kirby.showControllerNavigation`: Show/hide navigation to controller files from templates (default: `true`)
* `kirby.showModelNavigation`: Show/hide navigation to model files from templates (default: `true`)

### Tailwind CSS
* `kirby.enableTailwindIntegration`: Enable/disable automatic Tailwind CSS integration (default: `true`)

## Installation

### From VS Code Marketplace

The easiest way to install the extension:

1. Open VS Code
2. Go to Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "Kirby CMS Developer Toolkit"
4. Click "Install"

Or install directly from the command line:
```bash
code --install-extension MichaelvanLaar.vscode-kirby-toolkit
```

Marketplace page: https://marketplace.visualstudio.com/items?itemName=MichaelvanLaar.vscode-kirby-toolkit

### From GitHub Releases

1. Go to the [Releases page](https://github.com/MichaelvanLaar/vscode-kirby-toolkit/releases)
2. Download the latest `.vsix` file
3. Open VS Code
4. Go to Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`)
5. Click the "..." menu at the top of the Extensions view
6. Select "Install from VSIX..."
7. Choose the downloaded `.vsix` file

### Build from Source

If you want to build and install the extension yourself:

```bash
# Clone the repository
git clone https://github.com/MichaelvanLaar/vscode-kirby-toolkit.git
cd vscode-kirby-toolkit

# Install dependencies
npm install

# Build the VSIX file
npm install -g @vscode/vsce
vsce package

# This creates a .vsix file in the current directory
# Install it using the steps above (Extensions view → Install from VSIX)
```

## Usage Tips

### Page Type Scaffolding

**Quick scaffolding:**
```
1. Ctrl+Shift+P → "Kirby: New Page Type"
2. Enter name: "project"
3. Select files: Blueprint + Template + Controller
4. Done! All files created and ready to edit
```

**Naming conventions:**
- Use lowercase with hyphens: `blog-post`, `team-member`
- Use underscores: `my_page`
- Model classes are auto-converted to PascalCase: `blog-post` → `BlogPostPage`

### Snippet Extraction

**Best practices:**
- Extract reusable components early (headers, footers, cards)
- Use nested paths for organization: `partials/navigation`, `components/card`
- The extension warns about unbalanced brackets - review before confirming
- Extracted snippets automatically get type hints if enabled

**Undo extraction:**
Just press `Ctrl+Z` (or `Cmd+Z`) - both the file creation and code replacement are undone together!

### Blueprint Field Navigation

**Viewing field types:**
Enable `kirby.showBlueprintFieldTypes` to see:
```
Blueprint Fields: title (text), description (textarea), image (files)
```

**Adjusting field limit:**
```json
{
  "kirby.blueprintFieldDisplayLimit": 10
}
```

Shows up to 10 fields before truncating with "... (+N more)".

### File Navigation

**Keyboard shortcuts:**
- `F12` - Go to Definition (jump to related file)
- `Alt+F12` - Peek Definition (preview without opening)
- `Ctrl+Click` (Windows/Linux) or `Cmd+Click` (macOS) - Quick jump

**Disabling specific navigation:**
```json
{
  "kirby.showControllerNavigation": false,  // Hide controller links
  "kirby.showModelNavigation": true         // Keep model links
}
```

### Type Hints

**Customizing Type-Hint Variables:**

```json
{
  "kirby.typeHintVariables": ["$page", "$site", "$kirby", "$pages"]
}
```

**Disabling Automatic Injection:**

If you prefer to add type hints manually:

```json
{
  "kirby.autoInjectTypeHints": false
}
```

Then use the command `Kirby: Add Type Hints` when needed.

### Blueprint Validation

The extension uses the Kirby 5 Blueprint schema by default. If you're working with custom Blueprint extensions or need a different schema version:

```json
{
  "kirby.blueprintSchemaPath": "/path/to/custom/schema.json"
}
```

### Snippet Navigation

**Disabling CodeLens:**

If you find CodeLens links distracting but still want F12 navigation:

```json
{
  "kirby.showSnippetCodeLens": false
}
```

This disables ALL CodeLens features (snippets, controllers, models, Blueprint fields).

## Security & Quality

This extension has undergone comprehensive security review and testing:

- ✅ **179 automated tests** covering all features (up from 36 in v0.2)
- ✅ **Path traversal protection** with multi-layer input sanitization
- ✅ **Zero security vulnerabilities** in dependencies
- ✅ **Pre-commit testing** via Husky hooks ensures every commit passes all tests
- ✅ **Strict TypeScript** compilation and ESLint validation
- ✅ **Security-focused tests** for file operations and path validation
- ✅ **Atomic operations** for file creation (undo support)
- ✅ **Workspace settings only** (never modifies user-global settings)

See [SECURITY.md](SECURITY.md) for detailed security information and vulnerability reporting.

## Known Issues

- **Custom Kirby directory structures**: Current version only supports the standard `site/` directory structure
- **Regex-based PHP parsing**: Snippet detection uses regex which may produce false positives in edge cases (e.g., snippet calls in comments)
- **Blueprint schema extends validation**: When using the `extends` property in Blueprint fields (e.g., `extends: fields/myfield`), you may see a validation warning about a missing `type` property. This is a known limitation in the upstream JSON schema - according to Kirby documentation, the `type` property should be omitted when using `extends`, but the schema incorrectly requires it. Your blueprints will work correctly in Kirby despite this warning. See [bnomei/kirby-schema issue #38](https://github.com/bnomei/kirby-schema/issues/38) for tracking.
- **PHP AST limitations**: Field navigation and code extraction rely on simple parsing, not full PHP AST analysis. Complex expressions may not be handled perfectly.

## Roadmap

Planned features for future releases:

- **Bidirectional snippet navigation**: Navigate from snippet files back to templates that use them
- **Enhanced field completion**: IntelliSense for custom field names (e.g., `$page->→`)
- **Model method navigation**: Jump from template method calls to model definitions
- **Blueprint field validation**: Real-time validation of field usage in templates
- **Multi-workspace support**: Better handling of multi-root workspaces

## Contributing

Contributions are welcome! This project is open source.

### Development Setup

1. Clone the repository
2. Run `npm install`
3. Open in VS Code
4. Press F5 to launch Extension Development Host
5. Test your changes

### AI-Assisted Development (Optional)

This project uses Claude Code with Context7 MCP integration for enhanced AI-assisted development. The integration provides access to up-to-date documentation for VS Code Extension API and Kirby CMS.

**Setup:**

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Get your Context7 API key from [context7.com](https://context7.com)

3. Add your API key to the `.env` file:
   ```
   CONTEXT7_API_KEY=your-api-key-here
   ```

4. The MCP server is already configured in `.mcp.json`

**Note:** The `.env` file is ignored by git and will not be committed. Context7 integration is completely optional and not required for contributing to the project.

### Building & Testing

```bash
npm run compile      # Compile TypeScript + copy schemas
npm run watch        # Watch mode for development
npm run lint         # Run ESLint validation
npm run test         # Run all 179 tests (compile + lint + test suite)
```

**Quality Assurance:**
- All commits are automatically tested via pre-commit hooks
- Tests must pass before code can be committed
- 179 tests covering security, parsing, scaffolding, refactoring, navigation, and integration
- Zero tolerance for security vulnerabilities

### Packaging

```bash
npm install -g @vscode/vsce
vsce package
```

## License

This extension is licensed under the MIT License.

### Bundled Dependencies

- **Kirby Blueprint JSON Schema**: MIT License © [bnomei](https://github.com/bnomei) - The complete license is bundled with this extension in [src/schemas/LICENSE](src/schemas/LICENSE). Original repository: [bnomei/kirby-schema](https://github.com/bnomei/kirby-schema)
- **js-yaml**: MIT License © Vitaly Puzrin - Used for parsing Blueprint YAML files

## Acknowledgments

- [Kirby CMS](https://getkirby.com) - The amazing file-based CMS
- [bnomei](https://github.com/bnomei) - For the Kirby Blueprint JSON Schema
- The Kirby community for inspiration and feedback

## Support

- **Issues**: [Report bugs or request features](https://github.com/MichaelvanLaar/vscode-kirby-toolkit/issues)
- **Security**: [Report vulnerabilities](SECURITY.md#reporting-a-vulnerability)
- **Kirby Forum**: Join the discussion at [forum.getkirby.com](https://forum.getkirby.com)

---

**Enjoy developing with Kirby CMS!** 🚀
