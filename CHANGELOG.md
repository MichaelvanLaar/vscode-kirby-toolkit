# Change Log

All notable changes to the "Kirby CMS Developer Toolkit" extension will be documented in this file.

## [0.1.0] - 2025-10-24

### Initial MVP Release

#### Added
- **Type-Hint Injection**
  - Automatic PHPDoc type-hint injection when creating template or snippet files
  - Manual type-hint injection via `Kirby: Add Type Hints` command
  - Configurable type-hint variables
  - Duplicate detection to prevent multiple injections

- **Blueprint Schema Validation**
  - JSON Schema validation for Kirby Blueprint YAML files
  - Auto-completion for Blueprint fields, sections, and options
  - Bundled Kirby 4 Blueprint schema
  - Support for custom schema paths

- **Snippet Navigation**
  - CodeLens links above `snippet()` function calls
  - Go-to-Definition support (F12, Ctrl+Click)
  - Peek Definition support
  - Support for nested snippets
  - Error notifications for missing snippet files

#### Configuration
- `kirby.autoInjectTypeHints`: Enable/disable automatic type-hint injection (default: true)
- `kirby.typeHintVariables`: Customize variables in type-hint blocks (default: ["$page", "$site", "$kirby"])
- `kirby.enableBlueprintValidation`: Enable/disable Blueprint validation (default: true)
- `kirby.blueprintSchemaPath`: Custom schema path (optional)
- `kirby.showSnippetCodeLens`: Show/hide CodeLens links (default: true)

#### Technical
- Kirby project detection via `site/` directory
- Extension only activates in Kirby projects
- TypeScript implementation with strict type checking
- Integration with Red Hat YAML extension for Blueprint support

---

## Future Releases

See the [Roadmap](README.md#roadmap) section in the README for planned features.
