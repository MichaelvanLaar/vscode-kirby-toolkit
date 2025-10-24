# Add VS Code Extension MVP

## Why

Kirby CMS developers currently face significant productivity bottlenecks in their daily workflows: manually adding PHPDoc type hints to enable IntelliSense, lacking validation and auto-completion for Blueprint YAML files, and navigating inefficiently between related project files (templates, snippets, blueprints). These repetitive tasks slow development and increase the likelihood of errors. An integrated VS Code extension addressing these pain points will provide immediate, measurable productivity gains for the Kirby developer community.

## What Changes

This proposal introduces the foundational MVP for the Kirby CMS Developer Toolkit VS Code extension with three core capabilities:

- **Automatic Type-Hint Injection**: Automatically insert PHPDoc type declarations (`@var \Kirby\Cms\Page $page`, etc.) into template and snippet files upon creation or via command
- **Blueprint Schema Support**: Provide YAML validation and auto-completion for Kirby Blueprint files using JSON Schema integration
- **Snippet Navigation**: Enable direct navigation from `snippet('name')` function calls to their corresponding snippet files

These features represent the highest-impact, lowest-complexity wins that establish the extension's value proposition and technical foundation for future enhancements.

## Impact

- **Affected specs**:
  - `type-hint-injection` (new capability)
  - `blueprint-support` (new capability)
  - `snippet-navigation` (new capability)

- **Affected code**:
  - New VS Code extension project structure
  - `package.json` (extension manifest)
  - TypeScript source files for each capability
  - JSON Schema file(s) for Blueprint validation
  - Extension activation and command registration logic

- **External dependencies**:
  - VS Code Extension API
  - VS Code YAML extension (for Blueprint schema integration)
  - TypeScript/Node.js build toolchain
  - Kirby CMS Blueprint JSON Schema (community or custom)

- **Testing requirements**:
  - Unit tests for file path resolution
  - Integration tests for VS Code API interactions
  - Manual testing in Kirby project workspace
