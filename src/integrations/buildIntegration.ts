import * as vscode from 'vscode';
import { BuildOutputParser, BuildEvent } from '../utils/buildOutputParser';

/**
 * Build process states
 */
export enum BuildState {
  Idle = 'idle',
  Building = 'building',
  Ready = 'ready',
  WatchModeActive = 'watch-mode-active',
  Rebuilding = 'rebuilding',
  Error = 'error'
}

/**
 * Build metrics interface
 */
export interface BuildMetrics {
  lastBuildDuration?: number;
  lastRebuildTime?: number;
  rebuildCount: number;
}

/**
 * PTY instance interface (lazy-loaded)
 */
interface IPty {
  onData: (callback: (data: string) => void) => void;
  onExit: (callback: (exitCode: number) => void) => void;
  write: (data: string) => void;
  kill: (signal?: string) => void;
  pid: number;
  cols: number;
  rows: number;
}

/**
 * Custom Pseudoterminal for forwarding PTY output to VS Code Terminal
 */
class BuildPseudoterminal implements vscode.Pseudoterminal {
  private writeEmitter = new vscode.EventEmitter<string>();
  onDidWrite: vscode.Event<string> = this.writeEmitter.event;

  private closeEmitter = new vscode.EventEmitter<number | void>();
  onDidClose?: vscode.Event<number | void> = this.closeEmitter.event;

  constructor(
    private ptyProcess: IPty,
    private onOutput: (data: string) => void
  ) {
    // Forward PTY output to terminal and capture for parsing
    this.ptyProcess.onData((data) => {
      this.writeEmitter.fire(data);
      this.onOutput(data);
    });

    // Handle PTY exit
    this.ptyProcess.onExit((exitCode) => {
      this.closeEmitter.fire(exitCode);
    });
  }

  open(_initialDimensions: vscode.TerminalDimensions | undefined): void {
    // Terminal opened
  }

  close(): void {
    // Clean up
    this.ptyProcess.kill();
  }

  handleInput(data: string): void {
    // Forward user input to PTY
    this.ptyProcess.write(data);
  }

  setDimensions(dimensions: vscode.TerminalDimensions): void {
    // Could resize PTY here if needed
  }
}

/**
 * Manages the build process terminal lifecycle with output parsing support
 * Implements singleton pattern to prevent multiple simultaneous builds
 */
export class BuildProcess {
  private static instance: BuildProcess | null = null;
  private terminal: vscode.Terminal | null = null;
  private ptyProcess: IPty | null = null;
  private state: BuildState = BuildState.Idle;
  private stateChangeCallbacks: Array<(state: BuildState) => void> = [];
  private buildReadyTimeout: NodeJS.Timeout | null = null;
  private outputParser: BuildOutputParser | null = null;
  private isWatchMode: boolean = false;
  private metrics: BuildMetrics = { rebuildCount: 0 };
  private useHybridMode: boolean = true;
  private nodePtyModule: any = null;

  private constructor() {
    // Try to load node-pty module
    this.loadNodePty();

    // Register terminal lifecycle listeners
    vscode.window.onDidOpenTerminal(this.handleTerminalOpened.bind(this));
    vscode.window.onDidCloseTerminal(this.handleTerminalClosed.bind(this));
  }

  /**
   * Attempts to load node-pty module
   */
  private loadNodePty(): void {
    try {
      // Dynamic import to handle optional dependency
      this.nodePtyModule = require('node-pty');
      this.useHybridMode = true;
    } catch (error) {
      console.warn('node-pty module not available, falling back to pure Terminal API:', error);
      this.useHybridMode = false;
    }
  }

  /**
   * Gets the singleton instance of BuildProcess
   */
  static getInstance(): BuildProcess {
    if (!BuildProcess.instance) {
      BuildProcess.instance = new BuildProcess();
    }
    return BuildProcess.instance;
  }

  /**
   * Starts the build process with the given command
   *
   * @param command Command to run (e.g., "npm run dev")
   * @param cwd Working directory path
   * @param workspaceName Optional workspace name for multi-root workspaces
   */
  start(command: string, cwd: string, workspaceName?: string): void {
    // Stop existing build if running
    if (this.terminal) {
      this.stop();
    }

    // Create terminal name
    const terminalName = workspaceName
      ? `Kirby Build - ${workspaceName}`
      : 'Kirby Build';

    // Check if output parsing is enabled
    const config = vscode.workspace.getConfiguration('kirby');
    const outputParsingEnabled = config.get<boolean>('enableBuildOutputParsing', true);
    const customPatterns = config.get<Record<string, any>>('buildToolPatterns', {});

    // Initialize output parser
    if (outputParsingEnabled && this.useHybridMode && this.nodePtyModule) {
      this.outputParser = new BuildOutputParser(customPatterns);
      this.startWithPty(command, cwd, terminalName);
    } else {
      // Fall back to pure Terminal API
      this.outputParser = null;
      this.startWithTerminalApi(command, cwd, terminalName);
    }

    // Update state to building
    this.setState(BuildState.Building);

    // Reset metrics
    this.metrics = { rebuildCount: 0 };
    this.isWatchMode = false;

    // Set timeout to transition to "ready" after 5 seconds (fallback)
    this.buildReadyTimeout = setTimeout(() => {
      if (this.state === BuildState.Building && this.terminal) {
        // Only fall back to Ready if output parsing failed to detect anything
        if (!this.isWatchMode) {
          this.setState(BuildState.Ready);
        }
      }
    }, 5000);
  }

  /**
   * Starts build with hybrid PTY + Terminal approach
   */
  private startWithPty(command: string, cwd: string, terminalName: string): void {
    try {
      // Parse command into shell and args
      const [shell, ...args] = this.parseCommand(command);

      // Spawn PTY process
      const ptyProcess = this.nodePtyModule.spawn(shell, args, {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd,
        env: process.env
      });

      // Store PTY reference
      this.ptyProcess = ptyProcess;

      // Create custom pseudoterminal
      const pty = new BuildPseudoterminal(
        ptyProcess,
        (data) => this.handleOutput(data)
      );

      // Create VS Code terminal with custom PTY
      this.terminal = vscode.window.createTerminal({
        name: terminalName,
        pty,
        iconPath: new vscode.ThemeIcon('tools')
      });

      // Show terminal
      this.terminal.show();
    } catch (error) {
      console.error('Failed to start PTY process, falling back to Terminal API:', error);
      this.startWithTerminalApi(command, cwd, terminalName);
    }
  }

  /**
   * Starts build with pure Terminal API (fallback)
   */
  private startWithTerminalApi(command: string, cwd: string, terminalName: string): void {
    // Create new terminal
    this.terminal = vscode.window.createTerminal({
      name: terminalName,
      cwd,
      iconPath: new vscode.ThemeIcon('tools'),
    });

    // Show terminal
    this.terminal.show();

    // Send command
    this.terminal.sendText(command);
  }

  /**
   * Parses command string into shell and args
   */
  private parseCommand(command: string): string[] {
    // Handle npm/yarn/pnpm commands specially
    if (command.startsWith('npm ')) {
      return ['npm', ...command.slice(4).split(' ')];
    } else if (command.startsWith('yarn ')) {
      return ['yarn', ...command.slice(5).split(' ')];
    } else if (command.startsWith('pnpm ')) {
      return ['pnpm', ...command.slice(5).split(' ')];
    }

    // Default: use shell to execute command
    const shell = process.platform === 'win32' ? 'cmd.exe' : 'sh';
    const shellArg = process.platform === 'win32' ? '/c' : '-c';
    return [shell, shellArg, command];
  }

  /**
   * Handles output from PTY process
   */
  private handleOutput(data: string): void {
    if (!this.outputParser) {
      return;
    }

    try {
      const events = this.outputParser.parse(data);

      for (const event of events) {
        this.handleBuildEvent(event);
      }
    } catch (error) {
      console.error('Error parsing build output:', error);
    }
  }

  /**
   * Handles build events from output parser
   */
  private handleBuildEvent(event: BuildEvent): void {
    switch (event.type) {
      case 'build-start':
        if (this.state === BuildState.WatchModeActive) {
          this.setState(BuildState.Rebuilding);
          this.outputParser?.clearBuffer();
        } else if (this.state === BuildState.Building) {
          // Still in initial build
        } else {
          this.setState(BuildState.Building);
        }
        break;

      case 'build-success':
        // Clear ready timeout since we detected success
        if (this.buildReadyTimeout) {
          clearTimeout(this.buildReadyTimeout);
          this.buildReadyTimeout = null;
        }

        // Update metrics
        if (event.duration !== undefined) {
          this.metrics.lastBuildDuration = event.duration;
        }

        if (this.isWatchMode) {
          this.setState(BuildState.WatchModeActive);
          this.metrics.rebuildCount++;
          this.metrics.lastRebuildTime = event.timestamp;
        } else {
          this.setState(BuildState.Ready);
        }
        break;

      case 'build-error':
        // Clear ready timeout
        if (this.buildReadyTimeout) {
          clearTimeout(this.buildReadyTimeout);
          this.buildReadyTimeout = null;
        }
        this.setState(BuildState.Error);
        break;

      case 'watch-ready':
        this.isWatchMode = true;

        // Clear ready timeout
        if (this.buildReadyTimeout) {
          clearTimeout(this.buildReadyTimeout);
          this.buildReadyTimeout = null;
        }

        this.setState(BuildState.WatchModeActive);
        break;
    }
  }

  /**
   * Stops the build process
   */
  stop(): void {
    if (this.ptyProcess) {
      this.ptyProcess.kill();
      this.ptyProcess = null;
    }

    if (this.terminal) {
      this.terminal.dispose();
      this.terminal = null;
    }

    // Clear ready timeout
    if (this.buildReadyTimeout) {
      clearTimeout(this.buildReadyTimeout);
      this.buildReadyTimeout = null;
    }

    // Reset parser
    if (this.outputParser) {
      this.outputParser.reset();
    }

    this.isWatchMode = false;
    this.metrics = { rebuildCount: 0 };
    this.setState(BuildState.Idle);
  }

  /**
   * Restarts the build process with the same command
   *
   * @param command Command to run
   * @param cwd Working directory path
   * @param workspaceName Optional workspace name
   */
  restart(command: string, cwd: string, workspaceName?: string): void {
    this.stop();
    // Small delay to ensure terminal is fully disposed
    setTimeout(() => {
      this.start(command, cwd, workspaceName);
    }, 100);
  }

  /**
   * Checks if build process is running
   *
   * @returns True if build terminal exists
   */
  isRunning(): boolean {
    return this.terminal !== null;
  }

  /**
   * Shows the build terminal (focuses it)
   */
  show(): void {
    if (this.terminal) {
      this.terminal.show();
    }
  }

  /**
   * Gets the current build state
   */
  getState(): BuildState {
    return this.state;
  }

  /**
   * Gets the current build metrics
   */
  getMetrics(): BuildMetrics {
    return { ...this.metrics };
  }

  /**
   * Checks if watch mode is active
   */
  isInWatchMode(): boolean {
    return this.isWatchMode;
  }

  /**
   * Gets the detected build tool name
   */
  getDetectedTool(): string | null {
    return this.outputParser?.getDetectedTool() || null;
  }

  /**
   * Registers a callback for state changes
   *
   * @param callback Function to call when state changes
   */
  onStateChange(callback: (state: BuildState) => void): void {
    this.stateChangeCallbacks.push(callback);
  }

  /**
   * Disposes the build process (cleanup on extension deactivation)
   */
  dispose(): void {
    this.stop();
    this.stateChangeCallbacks = [];
    BuildProcess.instance = null;
  }

  /**
   * Handles terminal opened event
   */
  private handleTerminalOpened(terminal: vscode.Terminal): void {
    // Check if this is our build terminal
    if (terminal.name.startsWith('Kirby Build')) {
      // Update state if not already set
      if (this.state === BuildState.Idle) {
        this.setState(BuildState.Building);
      }
    }
  }

  /**
   * Handles terminal closed event
   */
  private handleTerminalClosed(terminal: vscode.Terminal): void {
    // Check if this is our build terminal
    if (terminal === this.terminal || terminal.name.startsWith('Kirby Build')) {
      // Clear terminal reference
      this.terminal = null;
      this.ptyProcess = null;

      // Clear timeout
      if (this.buildReadyTimeout) {
        clearTimeout(this.buildReadyTimeout);
        this.buildReadyTimeout = null;
      }

      // Reset parser
      if (this.outputParser) {
        this.outputParser.reset();
      }

      // Update state based on exit code
      // Note: Terminal API doesn't provide exit code, so we assume error if closed unexpectedly
      if (this.state === BuildState.Building || this.state === BuildState.Rebuilding) {
        this.setState(BuildState.Error);
      } else {
        this.setState(BuildState.Idle);
      }

      this.isWatchMode = false;
      this.metrics = { rebuildCount: 0 };
    }
  }

  /**
   * Sets the build state and notifies callbacks
   */
  private setState(newState: BuildState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.stateChangeCallbacks.forEach(callback => callback(newState));
    }
  }
}
