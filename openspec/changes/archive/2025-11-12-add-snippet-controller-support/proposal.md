# Add Snippet Controller Support

## Why

The [Kirby Snippet Controller](https://github.com/lukaskleinschmidt/kirby-snippet-controller) plugin is a popular community plugin that enables developers to define controllers for snippets using the same patterns applied to page controllers in Kirby CMS. Many Kirby developers use this plugin to separate logic from presentation in their snippets. Currently, the VS Code extension does not recognize or support snippet controller files, which means developers miss out on navigation features, type hints, and other productivity enhancements when working with snippet controllers.

## What Changes

- **Snippet Navigation Enhancement**: Extend snippet navigation to recognize and navigate to `.controller.php` files alongside regular snippet files
- **Type-Hint Injection**: Add automatic type-hint injection for snippet controller files with appropriate Kirby variable declarations
- **File Navigation**: Enable bidirectional navigation between snippet files and their controllers (similar to template/controller navigation)
- **Plugin Detection**: Detect when the Snippet Controller plugin is installed in the Kirby project to enable/disable controller-specific features
- **CodeLens Enhancement**: Display CodeLens links for navigating between snippets and their controllers

## Impact

- **Affected specs**:
  - `snippet-navigation` - MODIFIED to support controller file detection
  - `type-hint-injection` - MODIFIED to support snippet controller files
  - `file-navigation` - ADDED new capability for snippet-to-controller navigation
  - `snippet-controller-detection` - NEW capability for plugin detection

- **Affected code**:
  - `src/utils/kirbyProject.ts` - Add snippet controller detection and path resolution functions
  - `src/providers/snippetCodeLens.ts` - Add CodeLens for controller navigation
  - `src/providers/snippetDefinition.ts` - Extend to support controller file navigation
  - `src/providers/fileNavigationProvider.ts` - Add snippet-controller navigation support
  - `src/providers/fileNavigationCodeLens.ts` - Add CodeLens for snippet-controller navigation
  - `src/providers/typeHintProvider.ts` - Extend to recognize snippet controller files
  - `src/config/settings.ts` - Add configuration options for snippet controller features
  - `src/test/` - Add comprehensive test coverage for all new features

## Dependencies

- No new external dependencies required
- Feature gracefully degrades when Snippet Controller plugin is not installed
- Maintains backward compatibility with existing snippet navigation features
