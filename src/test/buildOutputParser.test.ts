import * as assert from 'assert';
import { BuildOutputParser, BuildEventType } from '../utils/buildOutputParser';

suite('BuildOutputParser Tests', () => {
  let parser: BuildOutputParser;

  setup(() => {
    parser = new BuildOutputParser();
  });

  teardown(() => {
    parser.reset();
  });

  suite('Webpack Detection and Parsing', () => {
    test('should detect Webpack from output', () => {
      const output = 'webpack 5.89.0 compiled successfully';
      parser.parse(output);

      assert.strictEqual(parser.getDetectedTool(), 'Webpack');
    });

    test('should detect Webpack build start', () => {
      parser.parse('webpack 5.89.0');
      const events = parser.parse('Compiling...');

      assert.strictEqual(events.length, 1);
      assert.strictEqual(events[0].type, 'build-start');
    });

    test('should detect Webpack build success', () => {
      parser.parse('webpack 5.89.0');
      const events = parser.parse('compiled successfully in 234 ms');

      assert.strictEqual(events.length, 1);
      assert.strictEqual(events[0].type, 'build-success');
      assert.ok(events[0].duration !== undefined);
    });

    test('should detect Webpack build error', () => {
      parser.parse('webpack 5.89.0');
      const events = parser.parse('ERROR in ./src/index.js');

      assert.strictEqual(events.length, 1);
      assert.strictEqual(events[0].type, 'build-error');
    });

    test('should detect Webpack watch mode', () => {
      parser.parse('webpack 5.89.0');
      const events = parser.parse('webpack is watching the files...');

      assert.strictEqual(events.length, 1);
      assert.strictEqual(events[0].type, 'watch-ready');
    });

    test('should extract build duration from Webpack output', () => {
      parser.parse('webpack 5.89.0');
      const events = parser.parse('compiled successfully in 2345 ms');

      assert.strictEqual(events.length, 1);
      assert.strictEqual(events[0].duration, 2345);
    });
  });

  suite('Vite Detection and Parsing', () => {
    test('should detect Vite from output', () => {
      const output = 'vite v4.5.0 building for production...';
      parser.parse(output);

      assert.strictEqual(parser.getDetectedTool(), 'Vite');
    });

    test('should detect Vite build start', () => {
      parser.parse('vite v4.5.0');
      const events = parser.parse('vite v4.5.0 building for production...');

      assert.strictEqual(events.length, 1);
      assert.strictEqual(events[0].type, 'build-start');
    });

    test('should detect Vite build success', () => {
      parser.parse('vite v4.5.0');
      const events = parser.parse('built in 1234ms');

      assert.strictEqual(events.length, 1);
      assert.strictEqual(events[0].type, 'build-success');
      assert.strictEqual(events[0].duration, 1234);
    });

    test('should detect Vite dev server ready', () => {
      parser.parse('vite v4.5.0');
      const events = parser.parse('Local:   http://localhost:5173/');

      assert.strictEqual(events.length, 1);
      assert.strictEqual(events[0].type, 'watch-ready');
    });

    test('should detect Vite build error', () => {
      parser.parse('vite v4.5.0');
      const events = parser.parse('error: Could not resolve "./component"');

      assert.strictEqual(events.length, 1);
      assert.strictEqual(events[0].type, 'build-error');
    });
  });

  suite('Tailwind CSS Detection and Parsing', () => {
    test('should detect Tailwind CSS from output', () => {
      const output = 'tailwindcss v3.3.0';
      parser.parse(output);

      assert.strictEqual(parser.getDetectedTool(), 'Tailwind CSS');
    });

    test('should detect Tailwind rebuild start', () => {
      parser.parse('tailwindcss v3.3.0');
      const events = parser.parse('Rebuilding...');

      assert.strictEqual(events.length, 1);
      assert.strictEqual(events[0].type, 'build-start');
    });

    test('should detect Tailwind build success', () => {
      parser.parse('tailwindcss v3.3.0');
      const events = parser.parse('Done in 456ms');

      assert.strictEqual(events.length, 1);
      assert.strictEqual(events[0].type, 'build-success');
      assert.strictEqual(events[0].duration, 456);
    });

    test('should detect Tailwind watch mode', () => {
      parser.parse('tailwindcss v3.3.0');
      const events = parser.parse('Done in 123ms. Watching for file changes...');

      // Should detect both success and watch-ready
      assert.strictEqual(events.length, 2);
      assert.strictEqual(events[0].type, 'build-success');
      assert.strictEqual(events[1].type, 'watch-ready');
    });
  });

  suite('esbuild Detection and Parsing', () => {
    test('should detect esbuild from output', () => {
      const output = '[watch] build started (esbuild)';
      parser.parse(output);

      assert.strictEqual(parser.getDetectedTool(), 'esbuild');
    });

    test('should detect esbuild build start', () => {
      parser.parse('esbuild');
      const events = parser.parse('[watch] build started');

      assert.strictEqual(events.length, 1);
      assert.strictEqual(events[0].type, 'build-start');
    });

    test('should detect esbuild build success', () => {
      parser.parse('esbuild');
      const events = parser.parse('[watch] build finished in 89ms');

      assert.strictEqual(events.length, 2);
      assert.strictEqual(events[0].type, 'watch-ready');
      assert.strictEqual(events[1].type, 'build-success');
    });

    test('should detect esbuild build error', () => {
      parser.parse('esbuild');
      const events = parser.parse('✘ [ERROR] Could not resolve "react"');

      assert.strictEqual(events.length, 1);
      assert.strictEqual(events[0].type, 'build-error');
    });
  });

  suite('Parcel Detection and Parsing', () => {
    test('should detect Parcel from output', () => {
      const output = 'parcel v2.9.3';
      parser.parse(output);

      assert.strictEqual(parser.getDetectedTool(), 'Parcel');
    });

    test('should detect Parcel build success', () => {
      parser.parse('parcel');
      const events = parser.parse('✨ Built in 1.23s');

      assert.strictEqual(events.length, 1);
      assert.strictEqual(events[0].type, 'build-success');
      assert.strictEqual(events[0].duration, 1230); // Converted to ms
    });

    test('should detect Parcel server ready', () => {
      parser.parse('parcel');
      const events = parser.parse('Server running at http://localhost:1234');

      assert.strictEqual(events.length, 1);
      assert.strictEqual(events[0].type, 'watch-ready');
    });
  });

  suite('Custom Patterns', () => {
    test('should support custom build tool patterns', () => {
      const customParser = new BuildOutputParser({
        'my-tool': {
          detect: 'my-tool v\\d+',
          events: {
            buildStart: ['Starting build...'],
            buildSuccess: ['Build complete!'],
            buildError: ['Build failed!'],
            watchReady: ['Watching...']
          }
        }
      });

      customParser.parse('my-tool v1.0.0');
      assert.strictEqual(customParser.getDetectedTool(), 'my-tool');

      const startEvents = customParser.parse('Starting build...');
      assert.strictEqual(startEvents.length, 1);
      assert.strictEqual(startEvents[0].type, 'build-start');

      const successEvents = customParser.parse('Build complete!');
      assert.strictEqual(successEvents.length, 1);
      assert.strictEqual(successEvents[0].type, 'build-success');
    });

    test('should prioritize custom patterns over built-in', () => {
      const customParser = new BuildOutputParser({
        'custom-webpack': {
          detect: 'webpack',
          events: {
            buildStart: ['Custom build starting'],
            buildSuccess: ['Custom build done'],
            buildError: [],
            watchReady: []
          }
        }
      });

      customParser.parse('webpack 5.0.0');
      assert.strictEqual(customParser.getDetectedTool(), 'custom-webpack');

      const events = customParser.parse('Custom build starting');
      assert.strictEqual(events.length, 1);
      assert.strictEqual(events[0].type, 'build-start');
    });
  });

  suite('Buffer Management', () => {
    test('should limit buffer size to 100KB', () => {
      // Generate large output
      const largeOutput = 'x'.repeat(150 * 1024); // 150KB
      parser.parse(largeOutput);

      // Buffer should be trimmed (we can't directly access buffer size,
      // but we can verify parser still works after large input)
      parser.parse('webpack 5.0.0');
      const events = parser.parse('compiled successfully');

      assert.strictEqual(events.length, 1);
      assert.strictEqual(events[0].type, 'build-success');
    });

    test('should clear buffer when requested', () => {
      parser.parse('webpack 5.0.0');
      parser.parse('Compiling...');

      parser.clearBuffer();

      // After clearing, tool should still be detected but buffer is empty
      assert.strictEqual(parser.getDetectedTool(), 'Webpack');
    });

    test('should reset parser state completely', () => {
      parser.parse('webpack 5.0.0');
      assert.strictEqual(parser.getDetectedTool(), 'Webpack');

      parser.reset();

      assert.strictEqual(parser.getDetectedTool(), null);
    });
  });

  suite('Edge Cases', () => {
    test('should handle empty output', () => {
      const events = parser.parse('');
      assert.strictEqual(events.length, 0);
    });

    test('should handle output without build tool detection', () => {
      const events = parser.parse('Some random output that does not match any pattern');
      assert.strictEqual(events.length, 0);
      assert.strictEqual(parser.getDetectedTool(), null);
    });

    test('should handle multiple events in single output chunk', () => {
      parser.parse('webpack 5.0.0');
      const events = parser.parse('Compiling...\ncompiled successfully in 100ms');

      // Should detect both start and success
      assert.strictEqual(events.length, 2);
      assert.strictEqual(events[0].type, 'build-start');
      assert.strictEqual(events[1].type, 'build-success');
    });

    test('should handle ANSI escape codes in output', () => {
      parser.parse('webpack 5.0.0');
      const events = parser.parse('\x1b[32mcompiled successfully\x1b[0m');

      assert.strictEqual(events.length, 1);
      assert.strictEqual(events[0].type, 'build-success');
    });

    test('should calculate duration from timestamp if extraction fails', () => {
      parser.parse('webpack 5.0.0');
      parser.parse('Compiling...');

      // Wait a bit
      const delay = 50;
      const start = Date.now();
      while (Date.now() - start < delay) {
        // Busy wait
      }

      const events = parser.parse('compiled successfully');
      assert.strictEqual(events.length, 1);
      assert.ok(events[0].duration !== undefined);
      assert.ok(events[0].duration! >= delay);
    });
  });

  suite('Pattern Performance', () => {
    test('should parse output chunks efficiently', () => {
      parser.parse('webpack 5.0.0');

      const startTime = Date.now();
      for (let i = 0; i < 1000; i++) {
        parser.parse('Compiling...\ncompiled successfully in 100ms\n');
      }
      const elapsed = Date.now() - startTime;

      // Should complete 1000 iterations in under 100ms
      assert.ok(elapsed < 100, `Parsing took ${elapsed}ms, expected < 100ms`);
    });
  });
});
