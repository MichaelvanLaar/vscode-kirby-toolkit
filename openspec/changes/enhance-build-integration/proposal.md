# Proposal: Enhance Build Integration

## Why

The current Frontend Build Integration feature (added in v0.4.0) provides basic build process management using VS Code's Terminal API, but has significant limitations that reduce its usefulness for common development workflows:

1. **Watch mode rebuilds are invisible**: When using `npm run dev-server` with webpack watch or similar, only the initial build is detected. Subsequent rebuilds triggered by file changes don't update the status bar - it remains stuck on "Build ready" from the initial 5-second timeout.

2. **External terminal builds are not tracked**: Builds started via VS Code's npm scripts panel or external terminals are completely invisible to the extension. The status bar shows "No build" even when builds are actively running.

3. **No build output visibility**: Without terminal output parsing, users cannot benefit from features like "jump to error" or build time tracking. The extension has no insight into whether builds succeeded or failed beyond terminal closure.

4. **Limited workflow compatibility**: Developers using workflows like `npm run dev-server` (which combines watch mode + PHP dev server) cannot rely on the extension's status indicators, making the feature less valuable.

These limitations stem from the deliberate design decision to use the Terminal API for its UI benefits (interactivity, theming, clickable links) at the cost of programmatic output access. This proposal addresses these gaps while preserving the Terminal API's advantages.

## What Changes

This enhancement adds three major capabilities to the Build Automation feature:

1. **Build Output Monitoring**
   - Add hybrid output capture using `pty.spawn()` alongside Terminal API
   - Parse build tool output to detect rebuild events in watch mode
   - Extract build success/failure status from tool-specific output patterns
   - Detect build completion times for performance tracking

2. **Broader Terminal Monitoring**
   - Monitor all VS Code terminals (not just extension-created ones)
   - Detect npm script executions in any terminal based on process name/command
   - Track build processes started from npm scripts panel or custom terminals
   - Associate external terminals with build status when detected

3. **Enhanced Status Indicators**
   - Add "Watch mode active" state to distinguish from "Build ready"
   - Show last rebuild timestamp in status bar tooltip
   - Add build duration metrics (time to complete)
   - Provide real-time feedback during watch mode rebuilds

**Configuration additions:**
- `kirby.enableBuildOutputParsing` (default: true) - Enable output monitoring
- `kirby.buildToolPatterns` (default: auto) - Customize output patterns for detection
- `kirby.monitorAllTerminals` (default: false) - Track external terminal builds
- `kirby.showBuildMetrics` (default: true) - Display build time in status bar

## Impact

**Affected specs:**
- `build-automation` - Major modifications to Build Status Monitoring, Terminal-Based Process Management

**Affected code:**
- `src/integrations/buildIntegration.ts` - Core process management and output parsing
- `src/integrations/buildStatusBar.ts` - Status bar display and metrics
- `src/utils/buildOutputParser.ts` (NEW) - Tool-specific output pattern matching
- `src/test/buildIntegration.test.ts` - Expanded test coverage for output parsing

**Breaking changes:**
- None - All enhancements are additive and backward-compatible
- Existing configurations continue to work unchanged
- New features can be disabled via settings

**User impact:**
- Resolves confusion about status bar not updating during watch rebuilds
- Makes build integration useful for developers using npm scripts panel
- Enables future features like error parsing and performance monitoring
