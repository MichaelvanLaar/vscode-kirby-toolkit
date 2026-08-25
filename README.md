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

### 2. Blueprint/Template Synchronization

Automatically detect missing counterpart files when you create a Blueprint or Template (including blocks and fields), and offer to create them with one click.

**Features:**
- 🔄 Monitors Blueprint and Template file creation in real-time
- 📝 Prompts to create missing counterparts automatically
- ⚙️ Optional Controller and Model file creation (for page templates)
- 🧩 **NEW: Block snippet synchronization** (enabled by default)
- 📋 **NEW: Field snippet synchronization** (opt-in)
- 🎯 Handles nested Blueprint structures (e.g., `blog/post.yml` → `blog.post.php`)
- 🔕 "Don't ask again" option with workspace-specific memory
- ⚡ Smart debouncing to avoid notification spam during bulk operations
- 🛠️ Three behavior modes: Ask (default), Never, Always
- 📁 Supports both flat (dot notation) and nested directory structures for blocks

**How it works:**

**Scenario 1: Creating a Blueprint**
1. Create a new Blueprint file: `site/blueprints/pages/article.yml`
2. Extension detects no matching template exists
3. Notification appears: "📄 Blueprint 'article.yml' created without a template. Create 'article.php'?"
4. Choose:
   - **Create Template** - Creates basic template with HTML boilerplate
   - **Create Template + Controller + Model** - Creates all three files
   - **Don't ask again** - Remembers choice for this workspace
   - **Dismiss** - Skip this time only

**Scenario 2: Creating a Template**
1. Create a new template file: `site/templates/project.php`
2. Extension detects no matching Blueprint exists
3. Notification appears: "📄 Template 'project.php' created without a Blueprint. Create Blueprint?"
4. Choose:
   - **Create Blueprint** - Creates Blueprint with sensible field defaults
   - **Don't ask again** - Remembers choice for this workspace
   - **Dismiss** - Skip this time only

**Nested Blueprint Support:**
- `site/blueprints/pages/blog/post.yml` → `site/templates/blog.post.php`
- `site/templates/section.article.php` → `site/blueprints/pages/section/article.yml`

**Configuration Options:**
```json
{
  "kirby.enableBlueprintTemplateSync": true,       // Master toggle
  "kirby.syncPromptBehavior": "ask",               // "ask" | "never" | "always"
  "kirby.syncCreateController": false,             // Auto-create controller by default
  "kirby.syncCreateModel": false,                  // Auto-create model by default
  "kirby.syncBlockSnippets": true,                 // Enable block synchronization
  "kirby.syncFieldSnippets": false,                // Enable field synchronization (opt-in)
  "kirby.syncBlockNestingStrategy": "auto",        // "auto" | "flat" | "nested"
  "kirby.syncIgnoreFolders": ["test/", "archive/"] // Exclude patterns
}
```

**Block Synchronization:**
- Automatically creates matching snippets for block Blueprints in `site/blueprints/blocks/`
- Supports both flat (`gallery.image.php`) and nested (`gallery/image.php`) directory structures
- Auto-detects nesting strategy from existing files or uses configured preference
- Bidirectional: Create Blueprint from snippet or snippet from Blueprint

**Field Synchronization:**
- Opt-in feature for developers who create custom field snippets
- Blueprint-first workflow: Only prompts when creating field Blueprints
- Creates snippets in `site/snippets/fields/` directory

**Behavior Modes:**
- **"ask"** (default): Show notification with action buttons
- **"never"**: Completely disable sync prompts
- **"always"**: Automatically create missing files without prompting

**Reset Dismissed Prompts:**
Run `Kirby: Reset Blueprint/Template Sync Prompts` to clear all "Don't ask again" choices.

**Use Cases:**
- **Quick prototyping**: Create Blueprint first, get Template automatically
- **Consistency enforcement**: Never forget to create matching files
- **Team workflows**: Standardize file creation across team members
- **Bulk operations**: Smart debouncing prevents notification spam during git operations

### 3. Extract to Snippet

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

### 4. Tailwind CSS Integration

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

### 5. Blueprint Field Navigation

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

### 6. Extended File Navigation

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

### 7. Automatic Type-Hint Injection

Automatically inject PHPDoc type hints for Kirby's global variables (`$page`, `$site`, `$kirby`) in template and snippet files.

**Features:**
- ✨ Automatic injection when creating new template or snippet files
- 🎯 Manual injection via command: `Kirby: Add Type Hints`
- ⚙️ Configurable variable list
- 🔍 IntelliSense support with Intelephense

**Usage:**
- Create a new PHP file in `site/templates/` or `site/snippets/` - type hints are added automatically
- For existing files, use the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and run `Kirby: Add Type Hints`

### 8. Kirby API IntelliSense

Intelligent autocompletion and inline documentation for Kirby CMS API classes and methods, powered by PHP stubs and the Intelephense language server.

**Features:**
- 💡 Smart autocompletion for Kirby core classes (`Page`, `Site`, `File`, `User`, `Kirby`, `Field`)
- 📖 Inline documentation with hover tooltips
- 🔗 Links to official Kirby documentation
- ⛓️ Method chaining support with return type inference
- 🎯 Signature help for method parameters
- 🔧 Automatic stub installation and configuration
- 🎛️ Optional custom stub paths for advanced use cases

**How it works:**
1. Extension automatically detects Intelephense PHP language server
2. Copies Kirby API stub files to `.vscode/kirby-stubs/` in your workspace
3. Configures Intelephense to index the stubs
4. You get instant autocompletion and documentation for all Kirby API methods!

**Usage:**
Simply type `$page->` in any PHP file and see all available Page methods with descriptions:
- `$page->title()` - Returns the page's title field
- `$page->children()` - Returns a collection of child pages
- `$page->url()` - Returns the page's URL
- And many more...

**Supported Classes:**
- **Page**: `title()`, `children()`, `parent()`, `url()`, `files()`, `images()`, etc.
- **Site**: `children()`, `find()`, `pages()`, `users()`, `homePage()`, etc.
- **File**: `url()`, `filename()`, `type()`, `size()`, `resize()`, `crop()`, etc.
- **User**: `email()`, `name()`, `role()`, `isAdmin()`, `avatar()`, etc.
- **Kirby/App**: `site()`, `users()`, `option()`, `roots()`, `urls()`, etc.
- **Field**: `value()`, `isEmpty()`, `html()`, `markdown()`, `kirbytext()`, etc.
- **Collections**: `Pages`, `Files`, `Users` with methods like `find()`, `first()`, `sortBy()`, etc.

**Example:**
```php
<?php
// Type $page-> and see all available methods with descriptions
$page->title()->value()  // ← IntelliSense shows Field methods
$page->children()->first()->url()  // ← Chaining works perfectly
$site->find('blog')->children()  // ← All Kirby classes supported
```

**Requirements:**
- [Intelephense](https://marketplace.visualstudio.com/items?itemName=bmewburn.vscode-intelephense-client) extension (free version works)
- Recommended: Disable or configure other PHP extensions to avoid conflicts

**Troubleshooting:**
If stubs aren't appearing in IntelliSense:
1. Check that Intelephense extension is installed and enabled
2. Verify `.vscode/kirby-stubs/` directory exists in your workspace
3. Check workspace `settings.json` for `intelephense.stubs` configuration
4. Run `Kirby: Reinstall API Stubs` command to force refresh
5. Restart VS Code to trigger Intelephense reindex

**Commands:**
- `Kirby: Remove API Stubs` - Clean up stub files
- `Kirby: Reinstall API Stubs` - Force reinstall/refresh stubs

**Configuration:**
```json
{
  "kirby.enableApiIntelliSense": true,     // Master toggle
  "kirby.kirbyVersion": "4.0",             // API version (currently only 4.0)
  "kirby.customStubsPath": ""              // Custom stub directory (optional)
}
```

**What's Included:**
Based on **Kirby 4.0 API** with comprehensive method signatures and PHPDoc annotations extracted from official documentation.

### 9. Blueprint Schema Validation

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

### 10. Frontend Build Integration

Automatically manage Node.js build processes (Vite, Webpack, Tailwind CLI) directly from VS Code with integrated terminal management and status monitoring.

**Features:**
- 🔨 Auto-detect npm build scripts (`dev`, `watch`, `build`)
- ▶️ Start/stop/restart build watchers from Command Palette
- 📊 Real-time build status in the status bar
- 🖥️ Integrated terminal with clickable error links
- 🚀 Optional auto-start on workspace open
- ⚙️ Custom build command configuration
- 🎯 One-click access to build terminal

**How it works:**

**Automatic Script Detection:**
The extension scans your `package.json` for common build scripts:
- **Dev/Watch mode**: `dev`, `watch`, `dev:css`, `watch:css`
- **One-time build**: `build`, `build:css`, `compile`

**Commands:**
- `Kirby: Start Build Watcher` - Starts `npm run dev` or `npm run watch`
- `Kirby: Stop Build Watcher` - Stops the active build process
- `Kirby: Restart Build Watcher` - Restarts the build process
- `Kirby: Run Build Once` - Runs `npm run build` (one-time)
- `Kirby: Show Build Terminal` - Focuses the build terminal

**Status Bar Indicator:**
- ⚫ **No build** (gray) - No build process running
- 🔨 **Building** (yellow) - Build process active
- ✅ **Build ready** (green) - Build completed successfully
- ❌ **Build error** (red) - Build process failed

Click the status bar to show the build terminal.

**Configuration Examples:**

```json
{
  // Enable build integration
  "kirby.enableBuildIntegration": true,

  // Custom build command (overrides auto-detection)
  "kirby.buildCommand": "npm run dev",

  // Auto-start build watcher on workspace open
  "kirby.buildAutoStart": false,

  // Which script to auto-start ("dev", "watch", or "build")
  "kirby.buildAutoStartScript": "dev",

  // Delay before auto-start (in milliseconds)
  "kirby.buildAutoStartDelay": 2000
}
```

**Enhanced Features:**

The build integration uses intelligent output parsing to provide real-time status updates:

1. **Watch Mode Detection**: Automatically detects when build tools enter watch mode and updates the status bar to show "👁️ Watching". Subsequent rebuilds triggered by file changes are detected and tracked in real-time.

2. **Build Output Parsing**: Parses terminal output from common build tools (Webpack, Vite, Tailwind CSS, esbuild, Parcel) to detect:
   - Build start events
   - Build completion (success/error)
   - Watch mode activation
   - Build duration

3. **Build Metrics**: Status bar tooltip displays:
   - Last build duration (e.g., "234ms" or "2.3s")
   - Rebuild count in watch mode
   - Time since last rebuild
   - Detected build tool

4. **Graceful Fallback**: If output parsing is unavailable or disabled, the extension falls back to timeout-based status detection (5 seconds) to ensure basic functionality.

**Configuration Options:**
```json
{
  "kirby.enableBuildOutputParsing": true,  // Enable intelligent output parsing
  "kirby.showBuildMetrics": true,          // Show build metrics in tooltip
  "kirby.buildToolPatterns": {}            // Custom pattern overrides (advanced)
}
```

**Supported Build Tools:**
- ✅ Vite
- ✅ Webpack
- ✅ Tailwind CSS CLI
- ✅ PostCSS
- ✅ esbuild
- ✅ Any npm script-based build tool

**Example package.json scripts:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "watch": "tailwindcss -i src/input.css -o dist/output.css --watch"
  }
}
```

### 11. Snippet Navigation & Controller Support

Quickly navigate from `snippet()` function calls to their corresponding snippet files, and seamlessly work with snippet controllers when using the [Kirby Snippet Controller plugin](https://github.com/lukaskleinschmidt/kirby-snippet-controller).

**Features:**
- 🔗 CodeLens links above `snippet()` calls
- ⚡ Go-to-Definition support (F12, Ctrl+Click)
- 👁️ Peek Definition support
- 🗂️ Support for nested snippets (e.g., `snippet('partials/menu')`)
- 🎮 **NEW: Snippet Controller support** - Navigate between snippets and their controllers
- 🔍 **NEW: Automatic plugin detection** - Detects Kirby Snippet Controller plugin via composer.json or site/plugins/
- 📝 **NEW: Type-hint injection** - Automatic type-hints for snippet controller files
- 🧭 **NEW: Bidirectional navigation** - Navigate from snippets to controllers and vice versa

**Usage:**
- Click the "Open Snippet" or "Open Controller" link above any `snippet()` call
- Or use F12 / Ctrl+Click (Cmd+Click on macOS) on the snippet name to see both targets
- Navigate between snippet and controller files using CodeLens at the top of each file
- Works in templates, snippets, and snippet controllers

**Snippet Controller Support:**

When the [Kirby Snippet Controller plugin](https://github.com/lukaskleinschmidt/kirby-snippet-controller) is detected in your project:
- CodeLens shows both "Open Snippet" and "Open Controller" links above `snippet()` calls
- F12 (Go-to-Definition) shows both snippet and controller as navigation targets
- Snippet files display "Open Snippet Controller" CodeLens when a controller exists
- Controller files display "Open Snippet" CodeLens to navigate back
- Automatic type-hint injection when creating new snippet controller files
- Supports nested snippets (e.g., `partials/menu.controller.php`)

### 12. Kirby Panel Integration

Access the Kirby Panel directly within VS Code, eliminating context switching between your editor and browser during development.

**Features:**
- 🎛️ WebView-based Panel embedded in VS Code editor
- 🌐 Alternative browser-based Panel access
- 🔍 Automatic Panel URL detection (localhost probing)
- ⚙️ Manual Panel URL configuration for remote/custom setups
- 📊 Status bar indicator showing Panel server status
- 🔄 Panel reload functionality
- 🔐 Session persistence within VS Code session
- ⚡ Quick access via status bar or command palette

**Usage:**

**Open Panel in WebView (Recommended):**
1. Click the "🎛️ Kirby Panel" status bar item (bottom-right)
2. Or use Command Palette: `Kirby: Open Panel in WebView`
3. Panel opens in a new editor tab within VS Code

**Open Panel in Browser:**
- Command: `Kirby: Open Panel in Browser`
- Opens Panel URL in your default web browser

**Additional Commands:**
- `Kirby: Reload Panel` - Refresh the Panel WebView content
- `Kirby: Configure Panel URL` - Manually set Panel URL for custom configurations

**Panel URL Detection:**

The extension automatically detects your Panel URL using multiple strategies:

1. **Configuration Setting** (highest priority):
   - Set `kirby.panelUrl` in workspace settings
   - Example: `"kirby.panelUrl": "http://localhost:8000/panel"`

2. **Localhost Port Probing**:
   - Automatically checks common ports: 8000, 3000, 8080, 8888
   - Tests URL pattern: `http://localhost:{port}/panel`

3. **package.json Script Parsing**:
   - Extracts port from server commands
   - Example: `"dev": "php -S localhost:8000"` → detects port 8000

4. **Manual Entry Fallback**:
   - Prompts you to enter URL if detection fails

**Status Bar Indicator:**

The status bar shows Panel server status:
- **🎛️ Kirby Panel** - Server detected and reachable
- **⚠️ Panel offline** - Server URL configured but not reachable
- Tooltip shows the detected Panel URL

**Server Setup Examples:**

PHP Built-in Server:
```bash
php -S localhost:8000
```

Laravel Valet:
```bash
valet link
# Panel URL: http://your-project.test/panel
```

Docker:
```json
{
  "kirby.panelUrl": "http://localhost:3000/panel"
}
```

**Troubleshooting:**

**Panel won't load in WebView:**
- Some servers may block iframe embedding via `X-Frame-Options` header
- Solution: Use "Open Panel in Browser" command instead
- Or configure your server to allow iframe embedding

**Panel URL not detected:**
- Start your development server first
- Or manually configure: `Kirby: Configure Panel URL`
- Check `kirby.panelAutoDetect` setting is enabled (default: true)

**Authentication:**
- Login via the Panel's standard login form within the WebView
- Session persists during VS Code session
- Re-authentication required after VS Code restart (sessions don't persist across restarts)

**Configuration Options:**
```json
{
  "kirby.enablePanelIntegration": true,      // Enable Panel integration (default: true)
  "kirby.panelUrl": "",                       // Manual Panel URL (auto-detect if empty)
  "kirby.panelAutoDetect": true,              // Auto-detect Panel URL (default: true)
  "kirby.panelOpenInWebView": true            // Open in WebView by default (default: true)
}
```

## Requirements

- **VS Code**: Version 1.60.0 or higher
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
* `kirby.enableSnippetControllers`: Enable/disable snippet controller support (navigation, type-hints, CodeLens) (default: `true`)

### Blueprint/Template Synchronization
* `kirby.enableBlueprintTemplateSync`: Enable/disable automatic Blueprint/Template sync prompts (default: `true`)
* `kirby.syncPromptBehavior`: How to handle sync prompts - `"ask"`, `"never"`, or `"always"` (default: `"ask"`)
* `kirby.syncCreateController`: Automatically create controller when creating template from Blueprint (default: `false`)
* `kirby.syncCreateModel`: Automatically create model when creating template from Blueprint (default: `false`)
* `kirby.syncIgnoreFolders`: Array of folder patterns to exclude from sync detection (default: `[]`)

### Frontend Build Integration
* `kirby.enableBuildIntegration`: Enable/disable build integration features (default: `true`)
* `kirby.buildCommand`: Custom build command to run (leave empty for auto-detection) (default: `""`)
* `kirby.buildAutoStart`: Automatically start build watcher when opening workspace (default: `false`)
* `kirby.buildAutoStartScript`: Which npm script to use for auto-start - `"dev"`, `"watch"`, or `"build"` (default: `"dev"`)
* `kirby.buildAutoStartDelay`: Delay in milliseconds before auto-starting build watcher (default: `2000`)

### Tailwind CSS
* `kirby.enableTailwindIntegration`: Enable/disable automatic Tailwind CSS integration (default: `true`)

### API IntelliSense
* `kirby.enableApiIntelliSense`: Enable/disable Kirby API IntelliSense via Intelephense (default: `true`)
* `kirby.kirbyVersion`: Kirby CMS version for API stubs (default: `"4.0"`)
* `kirby.customStubsPath`: Custom path to Kirby API stub files (default: `""`)

### Panel Integration
* `kirby.enablePanelIntegration`: Enable/disable Kirby Panel integration features (default: `true`)
* `kirby.panelUrl`: Kirby Panel URL for manual configuration (leave empty for automatic detection, e.g., `"http://localhost:8000/panel"`)
* `kirby.panelAutoDetect`: Automatically detect Panel URL by probing common localhost ports (default: `true`)
* `kirby.panelOpenInWebView`: Open Panel in WebView by default; if false, always use external browser (default: `true`)

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

- ✅ **232 automated tests** covering all features (up from 36 in v0.2)
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

**Available Slash Commands:**

The project includes custom slash commands for on-demand documentation retrieval:

- `/context7:vscode [topic]` - Pull VS Code Extension API docs and samples
  - Example: `/context7:vscode FileSystemWatcher`
  - Example: `/context7:vscode` (general context)

- `/context7:kirby [topic]` - Pull Kirby CMS documentation
  - Example: `/context7:kirby blueprints`
  - Example: `/context7:kirby` (general context)

- `/context7:full [topic]` - Pull both VS Code and Kirby docs (comprehensive context)
  - Example: `/context7:full template validation`
  - Example: `/context7:full` (general context from both sources)

**When to use Context7 commands:**
- ✅ Working with unfamiliar or new APIs
- ✅ Troubleshooting complex issues
- ✅ Implementing features requiring deep understanding of both systems
- ✅ Verifying best practices or API changes
- ❌ Following existing patterns (usually not needed)
- ❌ Routine refactoring or similar features

**Note:** The `.env` file is ignored by git and will not be committed. Context7 integration is completely optional and not required for contributing to the project.

### Building & Testing

```bash
npm run compile      # Compile TypeScript + copy schemas
npm run watch        # Watch mode for development
npm run lint         # Run ESLint validation
npm run test         # Run all 284 tests (compile + lint + test suite)
```

**Quality Assurance:**
- All commits are automatically tested via pre-commit hooks
- Tests must pass before code can be committed
- 284 tests covering security, parsing, scaffolding, refactoring, navigation, integration, and build automation
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
