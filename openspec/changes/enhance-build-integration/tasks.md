# Tasks: Enhance Build Integration

## 1. Dependencies and Architecture Setup
- [ ] 1.1 Add `node-pty` to production dependencies
- [ ] 1.2 Configure `node-pty` prebuild for cross-platform support
- [ ] 1.3 Implement fallback detection for `node-pty` load failures
- [ ] 1.4 Update extension build process to include `node-pty` native modules
- [ ] 1.5 Document platform requirements in README.md

## 2. Build Output Parser Implementation
- [ ] 2.1 Create `src/utils/buildOutputParser.ts` with pattern matching engine
- [ ] 2.2 Define output patterns for Webpack 4 and Webpack 5
- [ ] 2.3 Define output patterns for Vite 2+ and Vite 3+
- [ ] 2.4 Define output patterns for Tailwind CSS CLI
- [ ] 2.5 Define output patterns for esbuild
- [ ] 2.6 Implement tool auto-detection from output
- [ ] 2.7 Add configuration support for custom patterns (`kirby.buildToolPatterns`)
- [ ] 2.8 Implement output buffer management (100KB limit)
- [ ] 2.9 Write unit tests for pattern matching (all tools)
- [ ] 2.10 Write tests for tool detection logic
- [ ] 2.11 Write tests for custom pattern configuration

## 3. Hybrid PTY + Terminal Architecture
- [ ] 3.1 Refactor `src/integrations/buildIntegration.ts` to support hybrid mode
- [ ] 3.2 Implement PTY spawning with `node-pty`
- [ ] 3.3 Create custom `vscode.Pseudoterminal` implementation for output piping
- [ ] 3.4 Forward PTY output to VS Code Terminal
- [ ] 3.5 Capture PTY output for parsing
- [ ] 3.6 Implement fallback to pure Terminal API when PTY unavailable
- [ ] 3.7 Handle PTY process lifecycle (spawn, terminate, cleanup)
- [ ] 3.8 Write integration tests for PTY + Terminal workflow
- [ ] 3.9 Write tests for fallback behavior
- [ ] 3.10 Test cross-platform compatibility (Windows, macOS, Linux)

## 4. Enhanced Build State Machine
- [ ] 4.1 Add `WatchModeActive` and `Rebuilding` states to `BuildState` enum
- [ ] 4.2 Implement state transition logic for watch mode detection
- [ ] 4.3 Add state transition for rebuild events
- [ ] 4.4 Update `BuildProcess.setState()` to handle new states
- [ ] 4.5 Add `isWatchMode` tracking flag
- [ ] 4.6 Implement build event handlers for new states
- [ ] 4.7 Write unit tests for all state transitions
- [ ] 4.8 Write tests for edge cases (rapid state changes, multiple rebuilds)

## 5. Build Output Event Processing
- [ ] 5.1 Integrate `BuildOutputParser` with `BuildProcess`
- [ ] 5.2 Connect PTY output stream to parser
- [ ] 5.3 Handle `build-start` events from parser
- [ ] 5.4 Handle `build-success` events from parser
- [ ] 5.5 Handle `build-error` events from parser
- [ ] 5.6 Handle `watch-ready` events from parser
- [ ] 5.7 Implement event debouncing for rapid rebuilds
- [ ] 5.8 Add event logging for debugging
- [ ] 5.9 Write integration tests for event flow
- [ ] 5.10 Test with real build tools (Webpack, Vite, Tailwind)

## 6. Enhanced Status Bar Integration
- [ ] 6.1 Update status bar display for `WatchModeActive` state ("👁️ Watching")
- [ ] 6.2 Update status bar display for `Rebuilding` state ("🔨 Rebuilding")
- [ ] 6.3 Add build duration tracking
- [ ] 6.4 Add last rebuild timestamp
- [ ] 6.5 Update status bar tooltip with metrics
- [ ] 6.6 Add configuration option `kirby.showBuildMetrics`
- [ ] 6.7 Format build duration display (e.g., "234ms", "2.3s")
- [ ] 6.8 Write tests for status bar text generation
- [ ] 6.9 Write tests for tooltip formatting

## 7. External Terminal Monitoring (Phase 2)
- [ ] 7.1 Create `src/integrations/terminalMonitor.ts`
- [ ] 7.2 Implement `vscode.window.onDidOpenTerminal` handler
- [ ] 7.3 Detect npm scripts panel terminals by name pattern
- [ ] 7.4 Extract script name from terminal name
- [ ] 7.5 Associate external terminals with build status
- [ ] 7.6 Add configuration option `kirby.monitorAllTerminals` (default: false)
- [ ] 7.7 Add configuration option `kirby.externalTerminalPatterns`
- [ ] 7.8 Implement terminal monitoring enable/disable logic
- [ ] 7.9 Write unit tests for terminal detection
- [ ] 7.10 Write integration tests with npm scripts panel
- [ ] 7.11 Document privacy implications in README.md

## 8. Configuration and Settings
- [ ] 8.1 Add `kirby.enableBuildOutputParsing` setting (default: true)
- [ ] 8.2 Add `kirby.buildToolPatterns` setting for custom patterns
- [ ] 8.3 Add `kirby.monitorAllTerminals` setting (default: false)
- [ ] 8.4 Add `kirby.externalTerminalPatterns` setting
- [ ] 8.5 Add `kirby.showBuildMetrics` setting (default: true)
- [ ] 8.6 Update `package.json` configuration section
- [ ] 8.7 Add configuration change listeners
- [ ] 8.8 Implement hot-reload when settings change
- [ ] 8.9 Write tests for configuration handling

## 9. Error Handling and Fallbacks
- [ ] 9.1 Implement graceful degradation when `node-pty` unavailable
- [ ] 9.2 Add error logging for pattern match failures
- [ ] 9.3 Fall back to timeout-based status when patterns don't match
- [ ] 9.4 Handle PTY spawn failures gracefully
- [ ] 9.5 Add user-friendly error messages for common issues
- [ ] 9.6 Write tests for error scenarios
- [ ] 9.7 Write tests for fallback behavior
- [ ] 9.8 Document troubleshooting steps in README.md

## 10. Documentation
- [ ] 10.1 Update README.md with new features (remove "Current Limitations")
- [ ] 10.2 Document supported build tools and patterns
- [ ] 10.3 Add examples of custom pattern configuration
- [ ] 10.4 Document external terminal monitoring privacy considerations
- [ ] 10.5 Update Known Issues section if limitations remain
- [ ] 10.6 Add usage examples for watch mode workflows
- [ ] 10.7 Document `node-pty` installation requirements
- [ ] 10.8 Update CHANGELOG.md with feature additions

## 11. Testing
- [ ] 11.1 Write unit tests for `BuildOutputParser` (50+ tests)
- [ ] 11.2 Write integration tests for hybrid PTY architecture (20+ tests)
- [ ] 11.3 Write tests for new build states and transitions (15+ tests)
- [ ] 11.4 Write tests for external terminal monitoring (10+ tests)
- [ ] 11.5 Write end-to-end tests with real build tools
- [ ] 11.6 Test on Windows, macOS, and Linux
- [ ] 11.7 Test with multiple workspace folders
- [ ] 11.8 Performance testing with large webpack builds
- [ ] 11.9 Verify all 232 existing tests still pass
- [ ] 11.10 Achieve >90% code coverage for new code

## 12. Release Preparation
- [ ] 12.1 Update version number to 0.5.0 in package.json
- [ ] 12.2 Update CHANGELOG.md with detailed feature list
- [ ] 12.3 Run full test suite and ensure all tests pass
- [ ] 12.4 Build VSIX package and test installation
- [ ] 12.5 Test in clean VS Code environment
- [ ] 12.6 Update marketplace listing with new features
- [ ] 12.7 Create GitHub release with release notes
- [ ] 12.8 Archive this change proposal via `openspec archive`
