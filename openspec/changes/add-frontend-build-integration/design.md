# Design: Frontend Build Integration

## Context

Kirby CMS projects increasingly use modern frontend build tools for asset compilation:
- **Vite** for fast HMR and bundling
- **Webpack** for complex module bundling
- **Tailwind CSS CLI** for utility-first CSS compilation
- **PostCSS** for CSS transformations
- **esbuild** for fast JavaScript bundling

These tools typically run as long-lived "watch" processes that recompile assets on file changes. Developers must:
1. Open a separate terminal
2. Run `npm run dev` or `npm run watch`
3. Keep the terminal visible to monitor build errors
4. Switch between terminal and editor when errors occur

This workflow is tedious and interrupts focus, especially when build errors require code changes.

**Key constraints:**
- Cannot assume specific build tool (must support generic npm script runner)
- Must not interfere with existing terminal workflows (some users prefer manual control)
- Should work with zero configuration for common setups (auto-detect scripts)
- Cannot force users to use VS Code's integrated terminal (must be optional)
- Must handle build processes gracefully (proper cleanup on extension deactivate)

**Stakeholders:**
- Extension users: Want automated build process management without leaving VS Code
- Extension maintainers: Need a simple, reliable implementation that doesn't require tool-specific integrations

## Goals / Non-Goals

**Goals:**
- Auto-detect npm scripts for development builds (dev, watch, build, etc.)
- Provide commands to start/stop build watchers manually
- Optionally auto-start build watcher when opening workspace
- Display build output in VS Code's integrated terminal with proper theming
- Show build status in status bar (idle, building, success, error)
- Support custom build command configuration for non-standard setups
- Handle multiple workspace folders with independent build processes

**Non-Goals:**
- Deep integration with specific build tools (Vite, Webpack) beyond running npm scripts
- Parsing build tool configuration files (vite.config.js, webpack.config.js)
- Custom build error parsing or transformation (rely on tool's native output)
- Hot Module Replacement (HMR) integration (build tools handle this)
- Asset caching or optimization (not the extension's concern)
- Supporting non-npm build systems (Make, Gulp, Grunt) in initial implementation

## Decisions

### Decision 1: Build Script Detection Strategy

**What:** Automatically detect build-related npm scripts by parsing `package.json` and identifying scripts with common patterns.

**Why:**
- Most Node-based projects define build scripts in `package.json`
- Common naming conventions make detection reliable (dev, watch, build, start)
- Zero configuration for standard setups

**Detection logic:**
```typescript
function detectBuildScripts(packageJson: any): BuildScripts {
  const scripts = packageJson.scripts || {};

  return {
    dev: scripts.dev || scripts.watch || scripts['dev:css'],
    build: scripts.build || scripts['build:css'] || scripts.compile,
    watch: scripts.watch || scripts.dev,
  };
}
```

**Script priority:**
1. **Dev/Watch script** (preferred for auto-start): `dev` > `watch` > `dev:css` > `watch:css`
2. **Build script** (one-time compilation): `build` > `build:css` > `compile`

**Alternatives considered:**
1. **Manual configuration only** - Require users to specify build command
   - *Rejected*: Poor user experience for common setups
2. **Parse build tool config files** - Detect Vite/Webpack directly
   - *Rejected*: Too complex, tool-specific, fragile across version updates
3. **Use VS Code's built-in Task system** - Define tasks.json automatically
   - *Rejected*: Requires writing workspace files, users may have existing tasks

### Decision 2: Process Management - VS Code Terminal API

**What:** Use VS Code's Terminal API (`vscode.window.createTerminal()`) to run build processes instead of spawning Node child processes directly.

**Why:**
- Native VS Code UI integration (terminal panel)
- Users can interact with terminal (Ctrl+C to stop, view full output)
- Automatic terminal theming and font configuration
- Supports clickable error links (file paths in output)
- Familiar UX (same as manually running commands)

**Implementation:**
```typescript
class BuildProcess {
  private terminal: vscode.Terminal | null = null;

  start(command: string, cwd: string) {
    this.terminal = vscode.window.createTerminal({
      name: 'Kirby Build',
      cwd,
      iconPath: new vscode.ThemeIcon('tools'),
    });
    this.terminal.show();
    this.terminal.sendText(command);
  }

  stop() {
    if (this.terminal) {
      this.terminal.dispose(); // Sends SIGTERM to process
      this.terminal = null;
    }
  }
}
```

**Alternatives considered:**
1. **Node child_process.spawn()** - Spawn npm directly as child process
   - *Rejected*: Requires manual output handling, complex IPC, no terminal UI
2. **VS Code Task API** - Create and run tasks programmatically
   - *Rejected*: More complex API, less control over lifecycle, requires task configuration
3. **Output channel** - Display output in custom output channel
   - *Rejected*: No interactive terminal features, can't send Ctrl+C, less familiar UX

### Decision 3: Build Status Monitoring

**What:** Monitor terminal output to detect build success/failure and update status bar indicator.

**Why:**
- Users need quick visual feedback on build status
- Status bar is always visible (no need to check terminal)
- Enables features like "jump to error" commands

**Approach:**
- Unfortunately, VS Code's Terminal API does not provide programmatic access to terminal output
- **Solution:** Use VS Code's `onDidChangeActiveTerminal` and `onDidCloseTerminal` events for basic lifecycle tracking
- **Status bar states:**
  - 🔨 Building (yellow) - Terminal is active and named "Kirby Build"
  - ✅ Ready (green) - Build terminal has been running for >5 seconds without closing
  - ❌ Error (red) - Terminal closed unexpectedly (exit code != 0, detected via close event)
  - ⚫ Idle (gray) - No build terminal active

**Limitation:** Cannot parse output for specific error messages without custom output capture, which would require not using the Terminal API. For initial implementation, rely on users checking terminal output directly.

**Alternatives considered:**
1. **Parse terminal output** - Capture stdout/stderr with child_process
   - *Rejected*: Loses Terminal API benefits (interactivity, theming, clickable links)
2. **File system watching** - Detect asset changes to infer build success
   - *Rejected*: Unreliable (build may change files even on error), lag time
3. **No status monitoring** - Only provide start/stop commands
   - *Accepted for Phase 1*: Keep it simple, add advanced monitoring in Phase 2 if needed

### Decision 4: Auto-Start Behavior

**What:** Provide an optional setting to automatically start the build watcher when opening a Kirby workspace.

**Why:**
- Reduces manual steps for common workflow (open project → start build)
- Can be disabled for users who prefer manual control
- Respects user preference and doesn't force behavior

**Configuration:**
```json
{
  "kirby.buildAutoStart": false,  // Default: off for safety
  "kirby.buildAutoStartScript": "dev",  // Which script to run: "dev" | "watch" | "build"
  "kirby.buildAutoStartDelay": 2000,  // Wait 2s after workspace opens (allow project to load)
}
```

**Workflow:**
1. Extension activates in Kirby workspace
2. Check if `kirby.buildAutoStart` is true
3. Wait `buildAutoStartDelay` milliseconds (allow user to cancel if needed)
4. Detect build script (dev > watch > custom from `buildAutoStartScript`)
5. Start build process in terminal

**Safety measures:**
- Default to disabled (opt-in, not opt-out)
- Show notification on first auto-start: "Kirby Toolkit auto-started build process. Disable in settings."
- Don't auto-start if a "Kirby Build" terminal already exists (prevent duplicates)

**Alternatives considered:**
1. **Always auto-start** - Start build for everyone by default
   - *Rejected*: Too intrusive, may conflict with existing workflows
2. **Prompt on first workspace open** - Ask user if they want auto-start
   - *Rejected*: Adds friction, interrupts workflow
3. **No auto-start** - Require manual command execution
   - *Considered*: Simplest, but reduces feature value for common use case

### Decision 5: File Watch Triggering (Future Enhancement)

**What:** Phase 1 implementation will NOT include automatic build triggering on file save. This is reserved for Phase 2 based on user feedback.

**Why:**
- Most build tools (Vite, Webpack) already watch files when running in dev mode
- Triggering builds on save is redundant with native watch mode
- Adds complexity (which files to watch? how to debounce?)
- Risk of triggering duplicate builds or interfering with native watchers

**Phase 2 consideration:** If users request this feature for one-time build commands (e.g., `npm run build` on save), implement as:
```json
{
  "kirby.buildOnSave": false,
  "kirby.buildOnSaveScript": "build",
  "kirby.buildOnSavePatterns": ["assets/**/*.css", "assets/**/*.js"]
}
```

### Decision 6: Commands and User Interface

**What:** Provide the following commands in the Command Palette:

| Command | Description |
|---------|-------------|
| `Kirby: Start Build Watcher` | Starts `npm run dev` (or configured script) |
| `Kirby: Stop Build Watcher` | Stops the active build terminal |
| `Kirby: Run Build Once` | Runs `npm run build` (one-time compilation) |
| `Kirby: Restart Build Watcher` | Stops and restarts the build process |
| `Kirby: Show Build Terminal` | Focuses the build terminal if running |

**Status bar integration:**
- Display build status: 🔨 Building | ✅ Ready | ❌ Error | ⚫ Idle
- Click to show build terminal
- Right-click context menu: Start, Stop, Restart, Configure

## Risks / Trade-offs

### Risk 1: Terminal Output Not Captured
**Risk:** Cannot programmatically parse terminal output for errors without losing Terminal API benefits.

**Mitigation:**
- Accept limitation for Phase 1 (users check terminal manually)
- Rely on build tools' native error formatting (most tools output file:line:column format, which VS Code makes clickable)
- Phase 2: Consider hybrid approach with output channels for error parsing

### Risk 2: Process Cleanup Failures
**Risk:** Build processes may not terminate properly when extension deactivates or VS Code closes.

**Mitigation:**
- Use `terminal.dispose()` which sends SIGTERM to process
- Register terminal disposal in `context.subscriptions` for automatic cleanup
- Test extension deactivation and ensure processes are killed

### Risk 3: Auto-Start Conflicts
**Risk:** Auto-starting build processes may conflict with users' existing terminal workflows or scripts.

**Mitigation:**
- Default `kirby.buildAutoStart` to false (opt-in)
- Check if "Kirby Build" terminal already exists before auto-starting
- Provide clear notification on first auto-start with instructions to disable

### Risk 4: Build Script Detection False Positives
**Risk:** Extension may detect unrelated npm scripts as build commands (e.g., `dev` script for backend server, not assets).

**Mitigation:**
- Allow users to override via `kirby.buildCommand` setting
- Prioritize common frontend patterns (dev:css, watch:css, etc.)
- Document configuration for custom setups

## Migration Plan

**Phase 1: Initial Implementation (v0.4.0 or v0.5.0)**
1. Implement build script detection from package.json
2. Add commands: Start/Stop/Restart Build Watcher
3. Implement Terminal API integration for process management
4. Add basic status bar integration (show terminal name and status)
5. Implement optional auto-start with configuration settings
6. Write comprehensive tests for script detection and terminal lifecycle

**Phase 2: Enhanced Monitoring (v0.6.0)**
1. Add output channel integration for error parsing (if user feedback requests it)
2. Implement "jump to error" command when build fails
3. Add desktop notifications for build completion/errors (opt-in)
4. Support custom error pattern matching via configuration

**Phase 3: Advanced Features (v0.7.0)**
1. Add build-on-save feature with file pattern configuration
2. Support multiple concurrent build processes (CSS, JS, assets separately)
3. Add build time metrics and history tracking
4. Integrate with VS Code's Problem Matcher system for better error reporting

**Rollback Plan:**
- If terminal integration causes critical issues, provide hotfix that disables build integration by default
- Users can still run npm scripts manually in their own terminals
- No data loss risk (feature only manages terminal processes, doesn't modify files)

## Open Questions

1. **Multiple Build Scripts:** Should users be able to run multiple build scripts simultaneously (e.g., CSS and JS separately)?
   - *Proposed answer*: Phase 1 supports one build terminal at a time; Phase 3 can add multi-terminal support

2. **Build Tool Detection:** Should we detect build tools (Vite, Webpack) from lockfiles and suggest optimal commands?
   - *Proposed answer*: Not in Phase 1; Phase 2 could add tool-specific optimizations if valuable

3. **Task Integration:** Should we expose build commands as VS Code Tasks for better integration with existing workflows?
   - *Proposed answer*: Phase 2 feature; allow users to configure tasks.json with our commands as task runners

4. **Cross-Platform Path Handling:** How do we ensure npm commands work correctly on Windows (npm.cmd vs. npm)?
   - *Proposed answer*: Terminal API handles this automatically; test on Windows during development
