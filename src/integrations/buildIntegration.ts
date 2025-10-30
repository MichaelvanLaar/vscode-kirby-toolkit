import * as vscode from 'vscode';

/**
 * Build process states
 */
export enum BuildState {
  Idle = 'idle',
  Building = 'building',
  Ready = 'ready',
  Error = 'error'
}

/**
 * Manages the build process terminal lifecycle
 * Implements singleton pattern to prevent multiple simultaneous builds
 */
export class BuildProcess {
  private static instance: BuildProcess | null = null;
  private terminal: vscode.Terminal | null = null;
  private state: BuildState = BuildState.Idle;
  private stateChangeCallbacks: Array<(state: BuildState) => void> = [];
  private buildReadyTimeout: NodeJS.Timeout | null = null;

  private constructor() {
    // Register terminal lifecycle listeners
    vscode.window.onDidOpenTerminal(this.handleTerminalOpened.bind(this));
    vscode.window.onDidCloseTerminal(this.handleTerminalClosed.bind(this));
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

    // Update state to building
    this.setState(BuildState.Building);

    // Set timeout to transition to "ready" after 5 seconds
    this.buildReadyTimeout = setTimeout(() => {
      if (this.state === BuildState.Building && this.terminal) {
        this.setState(BuildState.Ready);
      }
    }, 5000);
  }

  /**
   * Stops the build process
   */
  stop(): void {
    if (this.terminal) {
      this.terminal.dispose();
      this.terminal = null;
    }

    // Clear ready timeout
    if (this.buildReadyTimeout) {
      clearTimeout(this.buildReadyTimeout);
      this.buildReadyTimeout = null;
    }

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

      // Clear timeout
      if (this.buildReadyTimeout) {
        clearTimeout(this.buildReadyTimeout);
        this.buildReadyTimeout = null;
      }

      // Update state based on exit code
      // Note: Terminal API doesn't provide exit code, so we assume error if closed unexpectedly
      if (this.state === BuildState.Building) {
        this.setState(BuildState.Error);
      } else {
        this.setState(BuildState.Idle);
      }
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
