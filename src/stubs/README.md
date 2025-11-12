# Kirby API PHP Stubs

This directory contains PHP stub files for the Kirby CMS API, used to provide IntelliSense (autocompletion, hover documentation, and signature help) in Visual Studio Code via the Intelephense extension.

## Purpose

PHP stub files are skeleton implementations of classes and methods that include PHPDoc annotations but no actual code. They serve as a type-hint database for PHP language servers like Intelephense, enabling intelligent code completion without requiring the full Kirby CMS installation in the workspace.

## Structure

```
kirby-api/
├── Cms/
│   ├── Page.php       # Page class methods
│   ├── Site.php       # Site class methods
│   ├── File.php       # File class methods
│   ├── User.php       # User class methods
│   ├── Kirby.php      # Kirby class methods
│   └── Field/         # Field type classes
│       ├── Field.php
│       ├── TextField.php
│       ├── EmailField.php
│       └── ...
└── kirby-core.php     # Namespace and autoloader declarations
```

## Maintenance

### Kirby Version Support

Current stubs are based on **Kirby 4.0 API**. When new Kirby versions are released:

1. Review the [Kirby changelog](https://getkirby.com/releases) for API changes
2. Update stub files to reflect new methods, changed signatures, or deprecated features
3. Update the version comment at the top of each stub file
4. Test IntelliSense with the updated stubs in a real project

### Adding New Classes

To add a new Kirby class to the stubs:

1. Create a new `.php` file in the appropriate namespace directory
2. Add the class declaration with PHPDoc annotations
3. Include all public methods with parameter types and return types
4. Add `@link` annotations pointing to official Kirby documentation
5. Update this README with the new class

### Stub Generation

Currently, stubs are **manually curated** from Kirby's official API documentation at https://getkirby.com/docs/reference. This ensures high-quality annotations and accurate type hints.

**Future enhancement**: Automated stub generation from Kirby's source code or API documentation exports.

## Quality Guidelines

When creating or updating stub files:

1. **Accuracy**: Match Kirby's actual API signatures exactly
2. **Documentation**: Include clear, concise PHPDoc descriptions
3. **Types**: Use precise type hints (avoid mixed/any when possible)
4. **Links**: Add `@link` to relevant Kirby documentation pages
5. **Completeness**: Cover all commonly used public methods
6. **Testing**: Verify IntelliSense works correctly after changes

## Usage in Extension

The extension automatically:

1. Copies stub files from `src/stubs/kirby-api/` to `.vscode/kirby-stubs/` in the workspace
2. Configures Intelephense to index the stub directory via `intelephense.stubs` setting
3. Adds `.vscode/kirby-stubs/` to `.gitignore` to prevent version control commits

Users can disable this feature with the `kirby.enableApiIntelliSense` setting or provide custom stubs via `kirby.customStubsPath`.

## Troubleshooting

**Stubs not appearing in IntelliSense:**
- Check that Intelephense extension is installed and enabled
- Verify `.vscode/kirby-stubs/` directory exists in workspace
- Check workspace settings.json for `intelephense.stubs` configuration
- Try running "Kirby: Reinstall API Stubs" command
- Restart VS Code to trigger Intelephense reindex

**Conflicting type hints:**
- Stub type hints should defer to actual code in workspace
- If conflicts occur, check Intelephense settings for stub priority
- Consider disabling stubs via `kirby.enableApiIntelliSense: false`

## Contributing

To contribute stub improvements:

1. Verify accuracy against official Kirby documentation
2. Test changes in a real Kirby project
3. Ensure all PHPDoc tags are correctly formatted
4. Submit a pull request with detailed change description

## License

These stub files are provided under the same MIT license as the VS Code Kirby Toolkit extension. Kirby CMS is a separate project with its own license.
