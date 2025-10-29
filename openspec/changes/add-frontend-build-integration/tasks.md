# Implementation Tasks: Frontend Build Integration

## 1. Build Script Detection Infrastructure
- [ ] 1.1 Create `src/utils/buildScriptDetector.ts` module
- [ ] 1.2 Implement `detectBuildScripts(workspacePath: string): Promise<BuildScripts>` function
- [ ] 1.3 Add logic to read and parse package.json from workspace root
- [ ] 1.4 Implement priority-based script detection (dev > watch > dev:css, etc.)
- [ ] 1.5 Add validation to ensure detected scripts are executable commands
- [ ] 1.6 Implement error handling for missing or invalid package.json
- [ ] 1.7 Write unit tests for script detection with various package.json configurations

## 2. Build Process Management
- [ ] 2.1 Create `src/integrations/buildIntegration.ts` module
- [ ] 2.2 Implement `BuildProcess` class to manage terminal lifecycle
- [ ] 2.3 Implement `start(command: string, cwd: string)` method using Terminal API
- [ ] 2.4 Configure terminal with name "Kirby Build" and tools icon
- [ ] 2.5 Implement `stop()` method to dispose of terminal and kill process
- [ ] 2.6 Implement `isRunning()` method to check if build terminal exists
- [ ] 2.7 Implement `show()` method to focus the build terminal
- [ ] 2.8 Add singleton pattern to prevent multiple simultaneous build processes

## 3. Build Status Monitoring
- [ ] 3.1 Implement terminal lifecycle event listeners (onDidOpenTerminal, onDidCloseTerminal)
- [ ] 3.2 Track build terminal state (idle, building, ready, error)
- [ ] 3.3 Update internal state based on terminal events
- [ ] 3.4 Add timeout logic to transition from "building" to "ready" after 5 seconds of activity
- [ ] 3.5 Detect terminal close events and mark as "error" if exit code != 0 (if detectable)

## 4. Status Bar Integration
- [ ] 4.1 Create status bar item in `src/extension.ts`
- [ ] 4.2 Implement status text and icon based on build state:
  - Idle: "⚫ No build" (gray)
  - Building: "🔨 Building" (yellow)
  - Ready: "✅ Build ready" (green)
  - Error: "❌ Build error" (red)
- [ ] 4.3 Configure status bar click action to show build terminal
- [ ] 4.4 Implement right-click context menu with: Start, Stop, Restart, Configure
- [ ] 4.5 Add status bar visibility logic (only show in Kirby workspaces)
- [ ] 4.6 Update status bar when build state changes

## 5. Build Commands
- [ ] 5.1 Create `src/commands/buildCommands.ts` module
- [ ] 5.2 Implement `startBuildWatcher()` command handler
- [ ] 5.3 Detect build script (dev > watch) and start terminal
- [ ] 5.4 Display error if no build script found with instructions
- [ ] 5.5 Implement `stopBuildWatcher()` command handler
- [ ] 5.6 Implement `restartBuildWatcher()` command handler (stop + start)
- [ ] 5.7 Implement `runBuildOnce()` command handler for one-time builds
- [ ] 5.8 Implement `showBuildTerminal()` command handler to focus terminal

## 6. Auto-Start Feature
- [ ] 6.1 Implement auto-start logic in `src/extension.ts` activate() function
- [ ] 6.2 Check `kirby.buildAutoStart` setting on activation
- [ ] 6.3 Implement delay using `setTimeout()` with `kirby.buildAutoStartDelay` value
- [ ] 6.4 Check if "Kirby Build" terminal already exists before auto-starting
- [ ] 6.5 Display one-time informational notification on first auto-start
- [ ] 6.6 Store workspace state flag to prevent repeated notifications
- [ ] 6.7 Add logic to cancel auto-start if user manually starts build before delay expires

## 7. Configuration Settings
- [ ] 7.1 Add `kirby.enableBuildIntegration` boolean setting to package.json (default: true)
- [ ] 7.2 Add `kirby.buildCommand` string setting to package.json (default: "", auto-detect if empty)
- [ ] 7.3 Add `kirby.buildAutoStart` boolean setting to package.json (default: false)
- [ ] 7.4 Add `kirby.buildAutoStartScript` enum setting to package.json (options: "dev", "watch", "build"; default: "dev")
- [ ] 7.5 Add `kirby.buildAutoStartDelay` number setting to package.json (default: 2000ms)
- [ ] 7.6 Add configuration descriptions with examples
- [ ] 7.7 Implement configuration validation for command format

## 8. Command Registration
- [ ] 8.1 Add `kirby.startBuildWatcher` command to package.json
- [ ] 8.2 Add `kirby.stopBuildWatcher` command to package.json
- [ ] 8.3 Add `kirby.restartBuildWatcher` command to package.json
- [ ] 8.4 Add `kirby.runBuildOnce` command to package.json
- [ ] 8.5 Add `kirby.showBuildTerminal` command to package.json
- [ ] 8.6 Register all commands in `src/extension.ts` activate() function
- [ ] 8.7 Add commands to Command Palette with descriptive titles

## 9. Multi-Workspace Support
- [ ] 9.1 Implement workspace folder detection for multi-root workspaces
- [ ] 9.2 Allow one build process per workspace folder
- [ ] 9.3 Label terminals with workspace folder name (e.g., "Kirby Build - ProjectA")
- [ ] 9.4 Track build state independently per workspace folder
- [ ] 9.5 Update status bar to show active workspace's build state

## 10. Error Handling and User Feedback
- [ ] 10.1 Handle missing package.json gracefully with informative message
- [ ] 10.2 Handle missing npm installation (command not found)
- [ ] 10.3 Display error notification if build script fails to start
- [ ] 10.4 Log detailed errors to output channel for troubleshooting
- [ ] 10.5 Provide "Configure Build Command" action in error messages

## 11. Testing
- [ ] 11.1 Create `src/test/buildScriptDetector.test.ts` test suite
- [ ] 11.2 Write test for detecting dev script from package.json
- [ ] 11.3 Write test for script priority logic (dev > watch > build)
- [ ] 11.4 Write test for custom script detection
- [ ] 11.5 Create `src/test/buildIntegration.test.ts` test suite
- [ ] 11.6 Write test for terminal creation with BuildProcess class
- [ ] 11.7 Write test for terminal disposal and cleanup
- [ ] 11.8 Write test for singleton pattern (prevent duplicate terminals)
- [ ] 11.9 Write test for auto-start logic with configuration settings
- [ ] 11.10 Write test for status bar state transitions
- [ ] 11.11 Write integration test for command handlers

## 12. Documentation
- [ ] 12.1 Update main README.md with Build Integration feature description
- [ ] 12.2 Add animated GIF/screenshot showing build terminal and status bar
- [ ] 12.3 Document configuration settings with examples (custom commands, auto-start)
- [ ] 12.4 Add section explaining how to configure build scripts in package.json
- [ ] 12.5 Document common build tool setups (Vite, Webpack, Tailwind CLI)
- [ ] 12.6 Add troubleshooting section for common issues (npm not found, script detection)
- [ ] 12.7 Update CHANGELOG.md with new version release notes

## 13. Validation and Release
- [ ] 13.1 Run full test suite (`npm test`) and ensure all tests pass
- [ ] 13.2 Manually test in real Kirby project with Vite: verify script detection and terminal creation
- [ ] 13.3 Test with Tailwind CLI project: verify build watcher starts correctly
- [ ] 13.4 Test auto-start feature with various delay settings
- [ ] 13.5 Test status bar updates during build lifecycle
- [ ] 13.6 Test multi-workspace scenario with different build scripts per folder
- [ ] 13.7 Test terminal cleanup when extension deactivates
- [ ] 13.8 Validate OpenSpec change with `openspec validate add-frontend-build-integration --strict`
- [ ] 13.9 Create pull request and request code review
- [ ] 13.10 After merge, archive OpenSpec change with `openspec archive add-frontend-build-integration`
