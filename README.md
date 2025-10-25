# Kirby CMS Developer Toolkit

A Visual Studio Code extension that enhances productivity for Kirby CMS developers by providing type-hints, Blueprint validation, and intelligent snippet navigation.

## Features

### 1. Automatic Type-Hint Injection

Automatically inject PHPDoc type hints for Kirby's global variables (`$page`, `$site`, `$kirby`) in template and snippet files.

**Features:**
- ✨ Automatic injection when creating new template or snippet files
- 🎯 Manual injection via command: `Kirby: Add Type Hints`
- ⚙️ Configurable variable list
- 🔍 IntelliSense support with Intelephense

**Usage:**
- Create a new PHP file in `site/templates/` or `site/snippets/` - type hints are added automatically
- For existing files, use the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and run `Kirby: Add Type Hints`

### 2. Blueprint Schema Validation

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

### 3. Snippet Navigation

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

* `kirby.autoInjectTypeHints`: Enable/disable automatic type-hint injection on file creation (default: `true`)
* `kirby.typeHintVariables`: Array of variable names to include in type-hint blocks (default: `["$page", "$site", "$kirby"]`)
* `kirby.enableBlueprintValidation`: Enable/disable Blueprint JSON Schema validation (default: `true`)
* `kirby.blueprintSchemaPath`: Path to custom Blueprint JSON Schema file (leave empty to use bundled schema)
* `kirby.showSnippetCodeLens`: Show/hide CodeLens links above snippet() calls (default: `true`)

## Installation

### From Marketplace (Coming Soon)

Search for "Kirby CMS Developer Toolkit" in the VS Code Extensions Marketplace.

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

## Security & Quality

This extension has undergone comprehensive security review and testing:

- ✅ **36 automated tests** covering all features
- ✅ **Path traversal protection** with input sanitization
- ✅ **Zero security vulnerabilities** in dependencies
- ✅ **Pre-commit testing** via Husky hooks
- ✅ **Strict TypeScript** compilation and ESLint validation

See [SECURITY.md](SECURITY.md) for detailed security information and vulnerability reporting.

## Known Issues

- **Custom Kirby directory structures**: MVP version only supports the standard `site/` directory structure
- **Regex-based PHP parsing**: Snippet detection uses regex which may produce false positives in edge cases (e.g., snippet calls in comments)
- **Blueprint schema extends validation**: When using the `extends` property in Blueprint fields (e.g., `extends: fields/myfield`), you may see a validation warning about a missing `type` property. This is a known limitation in the upstream JSON schema - according to Kirby documentation, the `type` property should be omitted when using `extends`, but the schema incorrectly requires it. Your blueprints will work correctly in Kirby despite this warning. See [bnomei/kirby-schema issue #XX](https://github.com/bnomei/kirby-schema/issues) for tracking.

## Roadmap

Planned features for future releases:

- **Bidirectional snippet navigation**: Navigate from snippet files back to templates that use them
- **Controller file support**: Type-hint injection for controller files
- **Template navigation**: Jump from Blueprint files to their corresponding templates
- **Field completion**: Auto-complete field names from Blueprints in templates
- **Tailwind CSS integration**: Configure Tailwind class completion in PHP files

## Contributing

Contributions are welcome! This project is open source.

### Development Setup

1. Clone the repository
2. Run `npm install`
3. Open in VS Code
4. Press F5 to launch Extension Development Host
5. Test your changes

### Building & Testing

```bash
npm run compile      # Compile TypeScript + copy schemas
npm run watch        # Watch mode for development
npm run lint         # Run ESLint validation
npm run test         # Run all 36 tests (compile + lint + test suite)
```

**Quality Assurance:**
- All commits are automatically tested via pre-commit hooks
- Tests must pass before code can be committed
- 36 tests covering security, parsing, type-hints, and integration
- Zero tolerance for security vulnerabilities

### Packaging

```bash
npm install -g @vscode/vsce
vsce package
```

## License

This extension is licensed under the MIT License.

### Bundled Dependencies

- **Kirby Blueprint JSON Schema**: [MIT License](https://github.com/bnomei/kirby-schema/blob/main/LICENSE) © [bnomei](https://github.com/bnomei)

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
