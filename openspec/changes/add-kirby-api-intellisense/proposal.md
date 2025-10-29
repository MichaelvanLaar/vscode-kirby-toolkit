# Add Kirby API IntelliSense

## Why

Developers working with Kirby CMS frequently use specialized PHP classes and methods (e.g., `Page`, `File`, `User`, `Field` methods) but lack intelligent autocompletion and inline documentation within VS Code. While the current toolkit provides basic type-hint injection for global variables (`$page`, `$site`, `$kirby`), it doesn't extend to the rich Kirby API ecosystem, forcing developers to constantly reference external documentation or rely on memory. This slows down development and increases the likelihood of typos and API misuse.

## What Changes

This change introduces **Advanced Kirby API IntelliSense** by integrating with the Intelephense PHP language server to augment its existing capabilities with Kirby-specific API metadata. The implementation will:

- Create a Kirby API metadata system that provides completion items, hover documentation, and signature help for Kirby classes and methods
- Integrate with Intelephense by generating PHP stubs or leveraging extension APIs to inject Kirby-specific completions
- Provide contextual IntelliSense for common Kirby patterns (e.g., `$page->title()`, `$site->children()`, `$kirby->users()`)
- Support method chaining and return type inference for fluid API patterns
- Include inline documentation extracted from Kirby's official API documentation

The approach leverages existing infrastructure (Intelephense) rather than building a full Language Server Protocol implementation, reducing maintenance burden while delivering immediate value to developers.

## Impact

- **Affected specs**: New capability `kirby-api-completion`
- **Affected code**:
  - New module: `src/integrations/intelephenseIntegration.ts` - Core integration logic
  - New module: `src/utils/kirbyApiMetadata.ts` - API metadata provider
  - New directory: `src/stubs/` - Generated PHP stub files for Kirby API (optional, depending on integration approach)
  - Modified: `src/extension.ts` - Register integration on activation
  - Modified: `package.json` - Add Intelephense as optional extension dependency
- **Configuration**: New settings for enabling/disabling API IntelliSense and configuring Kirby version compatibility
- **Dependencies**: Requires Intelephense extension (optional but recommended)
- **Breaking changes**: None
- **Testing**: New test suite for API metadata generation and Intelephense integration
