/**
 * Build output parser for detecting build events from terminal output
 * Supports Webpack, Vite, Tailwind CSS, esbuild, and custom patterns
 */

/**
 * Build event types
 */
export type BuildEventType = 'build-start' | 'build-success' | 'build-error' | 'watch-ready';

/**
 * Build event interface
 */
export interface BuildEvent {
  type: BuildEventType;
  timestamp: number;
  duration?: number; // Build duration in milliseconds (for build-success events)
}

/**
 * Build tool pattern definition
 */
export interface BuildToolPattern {
  name: string;
  detect: RegExp;
  events: {
    buildStart: RegExp[];
    buildSuccess: RegExp[];
    buildError: RegExp[];
    watchReady: RegExp[];
  };
  extractDuration?: RegExp; // Pattern to extract build duration from success message
}

/**
 * Built-in build tool patterns
 */
const BUILTIN_PATTERNS: BuildToolPattern[] = [
  // Webpack 4 & 5
  {
    name: 'Webpack',
    detect: /webpack\s+\d+\.\d+\.\d+/i,
    events: {
      buildStart: [
        /Compiling\.\.\./i,
        /Hash:\s+[a-f0-9]+/i,
        /<s>\s*\[webpack\.Progress\]/i
      ],
      buildSuccess: [
        /compiled successfully/i,
        /Built at:/i,
        /webpack\s+\d+\.\d+\.\d+\s+compiled/i
      ],
      buildError: [
        /Failed to compile/i,
        /ERROR in /i,
        /Module not found:/i
      ],
      watchReady: [
        /webpack is watching the files/i,
        /watching files for updates/i
      ]
    },
    extractDuration: /compiled.*in\s+(\d+)\s*ms/i
  },
  // Vite 2 & 3
  {
    name: 'Vite',
    detect: /vite\s+v\d+\.\d+/i,
    events: {
      buildStart: [
        /vite\s+v\d+\.\d+.*building/i,
        /transforming/i
      ],
      buildSuccess: [
        /built in\s+\d+/i,
        /ready in\s+\d+/i
      ],
      buildError: [
        /error:/i,
        /failed to/i,
        /✘\s+\[ERROR\]/i
      ],
      watchReady: [
        /Local:.*http:/i,
        /ready in\s+\d+\s*ms/i
      ]
    },
    extractDuration: /(?:built|ready) in\s+(\d+)\s*ms/i
  },
  // Tailwind CSS CLI
  {
    name: 'Tailwind CSS',
    detect: /tailwindcss/i,
    events: {
      buildStart: [
        /Rebuilding\.\.\./i,
        /Building CSS/i
      ],
      buildSuccess: [
        /Done in\s+\d+/i,
        /Finished in\s+\d+/i
      ],
      buildError: [
        /error:/i,
        /Unexpected token/i
      ],
      watchReady: [
        /Watching for file changes/i,
        /Done in\s+\d+.*Watching/i
      ]
    },
    extractDuration: /Done in\s+(\d+)\s*ms/i
  },
  // esbuild
  {
    name: 'esbuild',
    detect: /esbuild/i,
    events: {
      buildStart: [
        /\[watch\]\s+build started/i
      ],
      buildSuccess: [
        /\[watch\]\s+build finished/i,
        /⚡\s+Done/i
      ],
      buildError: [
        /✘\s+\[ERROR\]/i,
        /error:/i
      ],
      watchReady: [
        /\[watch\]\s+build finished/i
      ]
    },
    extractDuration: /build finished.*\s+(\d+)\s*ms/i
  },
  // Parcel
  {
    name: 'Parcel',
    detect: /parcel/i,
    events: {
      buildStart: [
        /Building/i,
        /Bundling/i
      ],
      buildSuccess: [
        /Built in\s+\d+/i,
        /✨\s+Built/i
      ],
      buildError: [
        /🚨\s+Build failed/i,
        /ERROR:/i
      ],
      watchReady: [
        /Server running at/i,
        /Built in\s+\d+.*http/i
      ]
    },
    extractDuration: /Built in\s+(\d+(?:\.\d+)?)\s*s/i
  }
];

/**
 * Buffer size limit (100KB)
 */
const MAX_BUFFER_SIZE = 100 * 1024;

/**
 * Build output parser class
 */
export class BuildOutputParser {
  private activeTool: BuildToolPattern | null = null;
  private outputBuffer: string = '';
  private customPatterns: BuildToolPattern[] = [];
  private lastBuildStartTime: number | null = null;

  constructor(customPatterns?: Record<string, any>) {
    if (customPatterns) {
      this.loadCustomPatterns(customPatterns);
    }
  }

  /**
   * Loads custom patterns from configuration
   */
  private loadCustomPatterns(customPatterns: Record<string, any>): void {
    try {
      for (const [name, pattern] of Object.entries(customPatterns)) {
        if (!pattern.detect || !pattern.events) {
          console.warn(`Invalid custom pattern for ${name}, skipping`);
          continue;
        }

        this.customPatterns.push({
          name,
          detect: new RegExp(pattern.detect, 'i'),
          events: {
            buildStart: this.compilePatterns(pattern.events.buildStart || []),
            buildSuccess: this.compilePatterns(pattern.events.buildSuccess || []),
            buildError: this.compilePatterns(pattern.events.buildError || []),
            watchReady: this.compilePatterns(pattern.events.watchReady || [])
          },
          extractDuration: pattern.extractDuration ? new RegExp(pattern.extractDuration, 'i') : undefined
        });
      }
    } catch (error) {
      console.error('Failed to load custom build tool patterns:', error);
    }
  }

  /**
   * Compiles string patterns to RegExp
   */
  private compilePatterns(patterns: string[]): RegExp[] {
    return patterns.map(p => new RegExp(p, 'i'));
  }

  /**
   * Parses output chunk and returns detected build events
   */
  parse(chunk: string): BuildEvent[] {
    // Add to buffer
    this.outputBuffer += chunk;

    // Enforce buffer size limit
    if (this.outputBuffer.length > MAX_BUFFER_SIZE) {
      this.outputBuffer = this.outputBuffer.slice(-MAX_BUFFER_SIZE);
    }

    // Detect build tool if not yet identified
    if (!this.activeTool) {
      this.activeTool = this.detectBuildTool(this.outputBuffer);
    }

    // Parse events
    const events: BuildEvent[] = [];

    if (this.activeTool) {
      // Check for build start
      for (const pattern of this.activeTool.events.buildStart) {
        if (pattern.test(chunk)) {
          this.lastBuildStartTime = Date.now();
          events.push({
            type: 'build-start',
            timestamp: this.lastBuildStartTime
          });
          break;
        }
      }

      // Check for build success
      for (const pattern of this.activeTool.events.buildSuccess) {
        if (pattern.test(chunk)) {
          const duration = this.extractBuildDuration(chunk);
          events.push({
            type: 'build-success',
            timestamp: Date.now(),
            duration
          });
          this.lastBuildStartTime = null;
          break;
        }
      }

      // Check for build error
      for (const pattern of this.activeTool.events.buildError) {
        if (pattern.test(chunk)) {
          events.push({
            type: 'build-error',
            timestamp: Date.now()
          });
          this.lastBuildStartTime = null;
          break;
        }
      }

      // Check for watch ready
      for (const pattern of this.activeTool.events.watchReady) {
        if (pattern.test(chunk)) {
          events.push({
            type: 'watch-ready',
            timestamp: Date.now()
          });
          break;
        }
      }
    }

    return events;
  }

  /**
   * Detects which build tool is running based on output
   */
  private detectBuildTool(output: string): BuildToolPattern | null {
    // Check custom patterns first
    for (const pattern of this.customPatterns) {
      if (pattern.detect.test(output)) {
        return pattern;
      }
    }

    // Check built-in patterns
    for (const pattern of BUILTIN_PATTERNS) {
      if (pattern.detect.test(output)) {
        return pattern;
      }
    }

    return null;
  }

  /**
   * Extracts build duration from success message
   */
  private extractBuildDuration(chunk: string): number | undefined {
    if (!this.activeTool?.extractDuration) {
      // Fall back to calculating from start time
      if (this.lastBuildStartTime) {
        return Date.now() - this.lastBuildStartTime;
      }
      return undefined;
    }

    const match = chunk.match(this.activeTool.extractDuration);
    if (match && match[1]) {
      const value = parseFloat(match[1]);
      // Convert to milliseconds if needed (some tools report in seconds)
      return value < 100 ? value * 1000 : value;
    }

    // Fall back to calculating from start time
    if (this.lastBuildStartTime) {
      return Date.now() - this.lastBuildStartTime;
    }

    return undefined;
  }

  /**
   * Resets the parser state (called when build stops or restarts)
   */
  reset(): void {
    this.activeTool = null;
    this.outputBuffer = '';
    this.lastBuildStartTime = null;
  }

  /**
   * Clears the output buffer (called on new build in watch mode)
   */
  clearBuffer(): void {
    this.outputBuffer = '';
  }

  /**
   * Gets the name of the detected build tool
   */
  getDetectedTool(): string | null {
    return this.activeTool?.name || null;
  }

  /**
   * Returns all available patterns (built-in + custom)
   */
  getAllPatterns(): BuildToolPattern[] {
    return [...this.customPatterns, ...BUILTIN_PATTERNS];
  }
}
