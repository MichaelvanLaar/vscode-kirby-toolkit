# Design: Enhanced Build Integration

## Context

The current build integration uses VS Code's Terminal API exclusively, which provides excellent UI integration but no programmatic access to terminal output. This creates a fundamental trade-off:

**Terminal API benefits:**
- Native VS Code terminal UI (familiar to users)
- Interactive terminals (users can send Ctrl+C, view scrollback)
- Automatic theming and clickable error links
- Standard shell environment

**Terminal API limitations:**
- No programmatic access to stdout/stderr
- Cannot detect build completion or errors
- Cannot track watch mode rebuilds
- Cannot monitor external terminals

The current implementation works around this by using simple heuristics:
- 5-second timeout → "ready" state (see `buildIntegration.ts:72-79`)
- Terminal close event → "error" state (see `buildIntegration.ts:174-194`)
- Only tracking extension-created terminals

This enhancement aims to **preserve Terminal API benefits** while **adding output monitoring** through a hybrid approach.

**Key constraints:**
- Must not break existing workflow (Terminal API remains primary)
- Must support common build tools (Vite, Webpack, Tailwind, esbuild)
- Must handle diverse output formats (different tools, different locales)
- Must be opt-out (users can disable if it causes issues)
- Must not add significant performance overhead

**Stakeholders:**
- Extension users: Want reliable status updates during watch mode
- Extension maintainers: Need maintainable solution without tool-specific coupling
- Developers using npm scripts panel: Want status tracking for external builds

## Goals / Non-Goals

**Goals:**
- Detect watch mode rebuilds by parsing build tool output
- Track builds started from npm scripts panel or external terminals
- Provide real-time status updates during rebuilds
- Extract build success/failure from tool output
- Support major build tools (Vite, Webpack 4/5, Tailwind, esbuild, Parcel)
- Maintain Terminal API for user interaction

**Non-Goals:**
- Deep integration with build tool internals (plugins, config parsing)
- Custom build error parsing beyond tool's native output
- Build process performance optimization
- Supporting non-npm build systems (Make, Gradle, etc.)
- Real-time progress bars (rely on tool's native output)

## Decisions

### Decision 1: Hybrid Output Capture Architecture

**What:** Run build processes using `node-pty` to capture output, then pipe to VS Code Terminal API for display.

**Why:**
- `node-pty` provides full pty (pseudo-terminal) with both output capture AND interactive capabilities
- Can read stdout/stderr programmatically while maintaining interactive terminal
- Terminal API can receive piped input, preserving UI benefits
- Widely used in VS Code's integrated terminal itself

**Implementation approach:**
```typescript
import * as pty from 'node-pty';

class BuildProcess {
  private ptyProcess: pty.IPty | null = null;
  private terminal: vscode.Terminal | null = null;

  start(command: string, cwd: string) {
    // Spawn pty process for output capture
    this.ptyProcess = pty.spawn('npm', ['run', 'dev'], {
      cwd,
      cols: 80,
      rows: 30,
    });

    // Create VS Code terminal to display output
    this.terminal = vscode.window.createTerminal({
      name: 'Kirby Build',
      pty: {
        onDidWrite: this.writeEmitter.event,
        open: () => this.handleOpen(),
        close: () => this.handleClose(),
      },
    });

    // Capture output for parsing
    this.ptyProcess.onData((data) => {
      this.writeEmitter.fire(data); // Forward to terminal
      this.parseOutput(data);        // Parse for events
    });
  }

  private parseOutput(data: string) {
    // Detect rebuild events, errors, completion
    if (this.outputParser.matchesRebuildPattern(data)) {
      this.setState(BuildState.Building);
    }
    // ... more pattern matching
  }
}
```

**Alternatives considered:**

1. **child_process.spawn() with separate Terminal** - Spawn process independently, pipe to terminal manually
   - *Rejected*: More complex IPC, harder to maintain terminal synchronization
   - *Benefit*: Slightly simpler architecture

2. **VS Code Task API for output capture** - Use tasks.json with problemMatchers
   - *Rejected*: Requires task configuration files, less flexible for dynamic commands
   - *Benefit*: Built-in VS Code support for problem matching

3. **Output Channel instead of Terminal** - Use custom output channel for builds
   - *Rejected*: Loses interactive terminal benefits (Ctrl+C, clickable links)
   - *Benefit*: Full programmatic control

**Risk mitigation:**
- `node-pty` requires native compilation → add to production dependencies, document installation
- Fallback to current Terminal API approach if `node-pty` fails to load
- Configuration flag `kirby.enableBuildOutputParsing` to disable if issues occur

### Decision 2: Build Tool Output Pattern Matching

**What:** Define regex patterns for common build tools to detect rebuild events, success, and errors.

**Why:**
- Build tools have consistent output patterns (e.g., Webpack: "compiled successfully in Xms")
- Pattern matching is simpler and more maintainable than tool-specific integrations
- Supports diverse tool versions without deep coupling

**Pattern database structure:**
```typescript
interface BuildToolPattern {
  name: string;
  detect: RegExp;  // Detect if this tool is running
  events: {
    buildStart: RegExp[];
    buildSuccess: RegExp[];
    buildError: RegExp[];
    watchReady: RegExp[];
  };
}

const TOOL_PATTERNS: BuildToolPattern[] = [
  {
    name: 'Webpack',
    detect: /webpack \d+\.\d+\.\d+/i,
    events: {
      buildStart: [/Compiling\.\.\./i, /Hash: [a-f0-9]+/i],
      buildSuccess: [/compiled successfully/i, /Built at:/i],
      buildError: [/Failed to compile/i, /ERROR in /i],
      watchReady: [/webpack \d+\.\d+\.\d+ compiled/i],
    },
  },
  {
    name: 'Vite',
    detect: /vite v\d+\.\d+/i,
    events: {
      buildStart: [/vite v\d+\.\d+ building/i],
      buildSuccess: [/built in \d+ms/i, /ready in \d+ms/i],
      buildError: [/error:/i, /failed to/i],
      watchReady: [/Local:.*http:/i],
    },
  },
  // ... more tools
];
```

**Pattern matching logic:**
```typescript
class BuildOutputParser {
  private activeTool: BuildToolPattern | null = null;
  private outputBuffer: string = '';

  parse(chunk: string): BuildEvent[] {
    this.outputBuffer += chunk;

    // Detect tool if not yet identified
    if (!this.activeTool) {
      this.activeTool = this.detectBuildTool(this.outputBuffer);
    }

    // Match events for active tool
    const events: BuildEvent[] = [];
    if (this.activeTool) {
      for (const pattern of this.activeTool.events.buildStart) {
        if (pattern.test(chunk)) {
          events.push({ type: 'build-start', timestamp: Date.now() });
        }
      }
      // ... match other event types
    }

    return events;
  }
}
```

**Customization:**
Users can override patterns via settings:
```json
{
  "kirby.buildToolPatterns": {
    "custom-tool": {
      "detect": "my-tool v\\d+",
      "events": {
        "buildStart": ["Building..."],
        "buildSuccess": ["Done!"]
      }
    }
  }
}
```

**Alternatives considered:**

1. **AST parsing of build tool output** - Parse JSON output from tools
   - *Rejected*: Not all tools provide structured output; requires tool-specific configuration
   - *Benefit*: More accurate than regex

2. **Build tool plugins** - Install plugins in user's build config
   - *Rejected*: Requires modifying user's project files; too invasive
   - *Benefit*: Direct API integration

3. **File system watching for output changes** - Watch dist/ directory
   - *Rejected*: Unreliable (builds may change files even on error); lag time
   - *Benefit*: No output parsing needed

### Decision 3: External Terminal Monitoring Strategy

**What:** Monitor all VS Code terminals using `vscode.window.terminals` and detect npm script executions based on terminal name and process info.

**Why:**
- Users frequently use npm scripts panel or custom terminals
- Extension-only monitoring creates confusing UX ("Why doesn't it work when I click Run Script?")
- VS Code exposes terminal metadata we can use for detection

**Implementation:**
```typescript
class TerminalMonitor {
  constructor(private context: vscode.ExtensionContext) {
    // Monitor terminal creation
    vscode.window.onDidOpenTerminal(this.handleTerminalOpened, this, context.subscriptions);

    // Monitor active terminal changes
    vscode.window.onDidChangeActiveTerminal(this.handleActiveTerminalChanged, this, context.subscriptions);
  }

  private async handleTerminalOpened(terminal: vscode.Terminal) {
    // Check if terminal is running npm/yarn/pnpm
    const processId = await terminal.processId;
    if (!processId) return;

    // Detect npm script execution
    if (this.isNpmScriptTerminal(terminal)) {
      const script = this.extractScriptName(terminal.name);
      if (this.isBuildScript(script)) {
        // Associate this terminal with build status
        BuildProcess.getInstance().trackExternalTerminal(terminal, script);
      }
    }
  }

  private isNpmScriptTerminal(terminal: vscode.Terminal): boolean {
    // npm scripts panel creates terminals with pattern: "npm: <script-name>"
    return /^(npm|yarn|pnpm): /.test(terminal.name);
  }
}
```

**Configuration:**
```json
{
  "kirby.monitorAllTerminals": false,  // Opt-in for privacy
  "kirby.externalTerminalPatterns": ["npm:", "yarn:", "pnpm:"]
}
```

**Alternatives considered:**

1. **Only monitor extension-created terminals** - Keep current behavior
   - *Rejected*: Doesn't solve user's problem (npm scripts panel not detected)
   - *Benefit*: Simpler, no privacy concerns

2. **Monitor all terminals regardless of name** - Track any terminal
   - *Rejected*: Privacy concerns (user may run sensitive commands)
   - *Benefit*: Catches all build processes

3. **Prompt user to enable external monitoring** - Show notification when npm script detected
   - *Considered*: Good middle ground; implement as future enhancement

### Decision 4: Build State Machine

**What:** Enhance build state transitions to support watch mode and external terminals.

**Current states:** Idle, Building, Ready, Error

**New states:**
- **WatchModeActive** - Build completed, watching for file changes
- **Rebuilding** - Watch mode rebuild in progress (file change detected)

**State transitions:**
```
Idle
  → Building (user starts build OR external terminal detected)
    → Ready (one-time build completes)
    → WatchModeActive (watch mode detected in output)
      → Rebuilding (file change triggers rebuild)
        → WatchModeActive (rebuild succeeds)
        → Error (rebuild fails)
    → Error (build fails)

WatchModeActive
  → Idle (user stops build OR terminal closed)

Ready
  → Idle (terminal closed)
```

**State detection logic:**
```typescript
private handleBuildEvent(event: BuildEvent) {
  switch (event.type) {
    case 'build-start':
      if (this.state === BuildState.WatchModeActive) {
        this.setState(BuildState.Rebuilding);
      } else {
        this.setState(BuildState.Building);
      }
      break;

    case 'build-success':
      if (this.isWatchMode) {
        this.setState(BuildState.WatchModeActive);
      } else {
        this.setState(BuildState.Ready);
      }
      break;

    case 'watch-ready':
      this.isWatchMode = true;
      this.setState(BuildState.WatchModeActive);
      break;

    case 'build-error':
      this.setState(BuildState.Error);
      break;
  }
}
```

**Status bar display:**
- **WatchModeActive**: "👁️ Watching" (blue/info color)
- **Rebuilding**: "🔨 Rebuilding" (yellow/warning color)

## Risks / Trade-offs

### Risk 1: node-pty Native Dependency
**Risk:** `node-pty` requires native compilation, which may fail on some platforms or VS Code versions.

**Mitigation:**
- Add `node-pty` to production dependencies with prebuild support
- Implement fallback to current Terminal API approach if `node-pty` fails to load
- Log detailed error messages to help users troubleshoot
- Document platform requirements in README

**Rollback:** Disable `kirby.enableBuildOutputParsing` by default if issues are widespread

### Risk 2: Pattern Matching Fragility
**Risk:** Build tool output formats may change across versions, breaking pattern detection.

**Mitigation:**
- Use broad, version-agnostic patterns when possible (e.g., `/compiled successfully/i`)
- Provide configuration to customize patterns per project
- Fall back gracefully when patterns don't match (use timeout-based status)
- Community contributions for new tool patterns

**Monitoring:** Track pattern match failures in telemetry (if added in future)

### Risk 3: Performance Overhead
**Risk:** Parsing all terminal output may impact performance, especially with verbose build tools.

**Mitigation:**
- Parse output in chunks, not line-by-line
- Use efficient regex patterns (avoid backtracking)
- Implement output buffer limits (discard old output after 100KB)
- Make output parsing opt-out via configuration

**Testing:** Benchmark with large webpack builds (1000+ modules)

### Risk 4: External Terminal Privacy
**Risk:** Monitoring all terminals may capture sensitive command output.

**Mitigation:**
- Make external terminal monitoring opt-in (`kirby.monitorAllTerminals: false` by default)
- Only monitor terminals matching npm script patterns
- Don't store terminal output, only parse in-memory
- Document privacy implications in README

## Migration Plan

**Phase 1: Core Output Parsing (v0.5.0)**
1. Add `node-pty` dependency and fallback logic
2. Implement hybrid pty + Terminal API architecture
3. Add pattern matching for Webpack and Vite (most common)
4. Update build state machine with WatchModeActive state
5. Add tests for output parsing and state transitions

**Phase 2: External Terminal Monitoring (v0.6.0)**
1. Implement terminal monitoring for npm scripts panel
2. Add configuration for external terminal patterns
3. Add user notification when external builds detected
4. Write tests for external terminal detection

**Phase 3: Enhanced Metrics (v0.7.0)**
1. Add build duration tracking
2. Show last rebuild timestamp in status bar tooltip
3. Add "jump to error" command when build fails
4. Implement build history tracking (last 10 builds)

**Rollback plan:**
- If `node-pty` causes widespread issues, disable by default via `kirby.enableBuildOutputParsing: false`
- Users can still use current Terminal API approach
- No data loss risk (feature only enhances existing functionality)

## Open Questions

1. **Should we support non-npm build tools?** (Make, Gradle, custom scripts)
   - *Proposed answer*: Phase 3 feature; focus on npm ecosystem first

2. **Should external terminal monitoring be opt-in or opt-out?**
   - *Proposed answer*: Opt-in for privacy; show one-time prompt when npm script detected

3. **Should we cache build tool detection across sessions?**
   - *Proposed answer*: Yes, store detected tool in workspace state for faster startup

4. **How to handle build tools with minimal output?** (e.g., silent mode)
   - *Proposed answer*: Fall back to timeout-based status detection
