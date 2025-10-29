# Add Frontend Build Integration

## Why

Modern Kirby CMS projects frequently use Node-based build tools (Vite, Webpack, Tailwind CLI, etc.) to compile CSS and JavaScript assets. Developers must manually start build processes in a separate terminal and monitor output for errors, then switch back to the editor to fix issues. This context switching is inefficient and error-prone, especially during rapid iteration when saving template files requires checking if CSS/JS changes compiled correctly. The extension already has Tailwind CSS detection but doesn't automate build processes.

## What Changes

This change introduces **Frontend Build Integration** by automatically detecting and running npm build scripts when asset files are saved, displaying build output in VS Code's integrated terminal or output channel, and providing commands to manage build processes. The implementation will:

- Detect `package.json` scripts (dev, watch, build) related to frontend asset compilation
- Provide commands to start/stop build watchers (npm run dev, npm run watch)
- Optionally auto-start build watchers when opening a Kirby workspace
- Monitor file save events for CSS/JS/asset files and trigger appropriate build tasks
- Display build output in VS Code's integrated terminal with clickable error links
- Show build status in the status bar (building, success, errors)
- Support configuration of custom build commands and file patterns

This feature streamlines asset compilation workflows, provides immediate feedback on build errors, and eliminates the need for external terminal windows.

## Impact

- **Affected specs**: New capability `build-automation`
- **Affected code**:
  - New module: `src/integrations/buildIntegration.ts` - Build process management
  - New module: `src/utils/buildScriptDetector.ts` - Detect npm scripts and build tools
  - New module: `src/commands/buildCommands.ts` - User-facing build commands
  - Modified: `src/extension.ts` - Register commands and file watchers
  - Modified: `package.json` - Add new commands and configuration settings
- **Configuration**: New settings for auto-start behavior, build command customization, and file pattern watching
- **Dependencies**: None (uses built-in VS Code Terminal API and FileSystemWatcher)
- **Breaking changes**: None
- **Testing**: New test suite for build script detection, process management, and file watching
