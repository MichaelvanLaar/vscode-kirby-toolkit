import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as os from 'os';
import {
  detectBuildScripts,
  validateBuildCommand,
  getNpmCommand,
  hasPackageJson,
  BuildScripts
} from '../utils/buildScriptDetector';

suite('Build Script Detector Test Suite', () => {
  let tempDir: string;

  setup(async () => {
    // Create temporary directory for test files
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'kirby-test-'));
  });

  teardown(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  suite('detectBuildScripts', () => {
    test('should detect dev script from package.json', async () => {
      const packageJson = {
        scripts: {
          dev: 'vite',
          build: 'vite build'
        }
      };

      await fs.writeFile(
        path.join(tempDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const scripts = await detectBuildScripts(tempDir);

      assert.strictEqual(scripts.dev, 'vite');
      assert.strictEqual(scripts.build, 'vite build');
    });

    test('should prioritize dev over watch', async () => {
      const packageJson = {
        scripts: {
          dev: 'vite',
          watch: 'webpack --watch'
        }
      };

      await fs.writeFile(
        path.join(tempDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const scripts = await detectBuildScripts(tempDir);

      assert.strictEqual(scripts.dev, 'vite');
      assert.strictEqual(scripts.watch, 'webpack --watch');
    });

    test('should detect watch when dev is missing', async () => {
      const packageJson = {
        scripts: {
          watch: 'webpack --watch',
          build: 'webpack'
        }
      };

      await fs.writeFile(
        path.join(tempDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const scripts = await detectBuildScripts(tempDir);

      assert.strictEqual(scripts.dev, 'webpack --watch');
      assert.strictEqual(scripts.watch, 'webpack --watch');
    });

    test('should detect namespaced scripts (dev:css, build:css)', async () => {
      const packageJson = {
        scripts: {
          'dev:css': 'tailwindcss -i src/input.css -o dist/output.css --watch',
          'build:css': 'tailwindcss -i src/input.css -o dist/output.css'
        }
      };

      await fs.writeFile(
        path.join(tempDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const scripts = await detectBuildScripts(tempDir);

      assert.ok(scripts.dev);
      assert.ok(scripts.build);
    });

    test('should handle package.json without scripts', async () => {
      const packageJson = {
        name: 'test-project',
        version: '1.0.0'
      };

      await fs.writeFile(
        path.join(tempDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const scripts = await detectBuildScripts(tempDir);

      assert.strictEqual(scripts.dev, undefined);
      assert.strictEqual(scripts.build, undefined);
      assert.strictEqual(scripts.watch, undefined);
    });

    test('should throw error for missing package.json', async () => {
      await assert.rejects(
        async () => await detectBuildScripts(tempDir),
        /package\.json not found/
      );
    });

    test('should throw error for invalid JSON', async () => {
      await fs.writeFile(
        path.join(tempDir, 'package.json'),
        '{ invalid json }'
      );

      await assert.rejects(
        async () => await detectBuildScripts(tempDir),
        /Invalid JSON/
      );
    });
  });

  suite('validateBuildCommand', () => {
    test('should accept valid commands', () => {
      assert.strictEqual(validateBuildCommand('vite'), true);
      assert.strictEqual(validateBuildCommand('webpack --watch'), true);
      assert.strictEqual(validateBuildCommand('tailwindcss -i input.css -o output.css'), true);
    });

    test('should reject empty commands', () => {
      assert.strictEqual(validateBuildCommand(''), false);
      assert.strictEqual(validateBuildCommand('   '), false);
    });

    test('should reject null or undefined', () => {
      assert.strictEqual(validateBuildCommand(null as any), false);
      assert.strictEqual(validateBuildCommand(undefined as any), false);
    });

    test('should reject commands with dangerous patterns', () => {
      assert.strictEqual(validateBuildCommand('rm -rf / && echo done'), false);
      assert.strictEqual(validateBuildCommand('vite || echo error'), false);
      assert.strictEqual(validateBuildCommand('vite; rm file'), false);
      assert.strictEqual(validateBuildCommand('echo `cat /etc/passwd`'), false);
      assert.strictEqual(validateBuildCommand('echo $(whoami)'), false);
    });
  });

  suite('getNpmCommand', () => {
    test('should format npm run command', () => {
      assert.strictEqual(getNpmCommand('dev'), 'npm run dev');
      assert.strictEqual(getNpmCommand('build'), 'npm run build');
      assert.strictEqual(getNpmCommand('watch'), 'npm run watch');
    });
  });

  suite('hasPackageJson', () => {
    test('should return true when package.json exists', async () => {
      await fs.writeFile(
        path.join(tempDir, 'package.json'),
        '{}'
      );

      const exists = await hasPackageJson(tempDir);
      assert.strictEqual(exists, true);
    });

    test('should return false when package.json does not exist', async () => {
      const exists = await hasPackageJson(tempDir);
      assert.strictEqual(exists, false);
    });
  });
});
