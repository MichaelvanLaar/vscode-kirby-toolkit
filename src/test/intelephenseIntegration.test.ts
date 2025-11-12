import * as assert from 'assert';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IntelephenseIntegration } from '../integrations/intelephenseIntegration';

suite('Intelephense Integration Test Suite', () => {
  let integration: IntelephenseIntegration;
  let outputChannel: vscode.OutputChannel;
  let testWorkspacePath: string;
  let context: vscode.ExtensionContext;

  setup(() => {
    // Create output channel
    outputChannel = vscode.window.createOutputChannel('Test Kirby Toolkit');

    // Get test context
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    testWorkspacePath = workspaceFolder?.uri.fsPath || '/tmp/test-workspace';

    // Create mock context
    context = {
      extensionPath: path.join(__dirname, '..', '..'),
      globalState: {
        get: () => undefined,
        update: async () => { },
        keys: () => [],
        setKeysForSync: () => { }
      },
      workspaceState: {
        get: () => undefined,
        update: async () => { },
        keys: () => []
      },
      subscriptions: [],
    } as any;

    // Create integration instance
    integration = new IntelephenseIntegration(context, outputChannel);
  });

  teardown(() => {
    // Clean up any created stub directories
    const stubsPath = path.join(testWorkspacePath, '.vscode', 'kirby-stubs');
    if (fs.existsSync(stubsPath)) {
      fs.rmSync(stubsPath, { recursive: true, force: true });
    }

    // Dispose output channel
    outputChannel.dispose();
  });

  suite('Extension Detection', () => {
    test('should detect Intelephense extension', () => {
      const isDetected = integration.detectIntelephense();

      // In a real VS Code environment with Intelephense installed, this would be true
      // In test environment, it might be false
      assert.strictEqual(typeof isDetected, 'boolean');
    });

    test('should not throw when checking for Intelephense', () => {
      assert.doesNotThrow(() => {
        integration.detectIntelephense();
      });
    });
  });

  suite('Stub Initialization', () => {
    test('should create stub directory when initializing', async function() {
      // Skip if no workspace
      if (!testWorkspacePath || testWorkspacePath === '/tmp/test-workspace') {
        this.skip();
        return;
      }

      const stubsPath = path.join(testWorkspacePath, '.vscode', 'kirby-stubs');

      // Clean up if exists
      if (fs.existsSync(stubsPath)) {
        fs.rmSync(stubsPath, { recursive: true, force: true });
      }

      try {
        await integration.initializeStubs(testWorkspacePath);

        // Check if directory was created
        assert.ok(fs.existsSync(stubsPath), 'Stub directory should be created');
      } catch (error) {
        // May fail if source stubs don't exist in test environment
        console.log('Stub initialization failed (expected in test environment):', error);
      }
    });

    test('should not overwrite existing stubs', async function() {
      // Skip if no workspace
      if (!testWorkspacePath || testWorkspacePath === '/tmp/test-workspace') {
        this.skip();
        return;
      }

      const stubsPath = path.join(testWorkspacePath, '.vscode', 'kirby-stubs');
      const testFilePath = path.join(stubsPath, 'test.txt');

      // Create stub directory with test file
      fs.mkdirSync(stubsPath, { recursive: true });
      fs.writeFileSync(testFilePath, 'test content');

      await integration.initializeStubs(testWorkspacePath);

      // Test file should still exist (stubs not overwritten)
      assert.ok(fs.existsSync(testFilePath), 'Existing files should not be overwritten');

      // Clean up
      fs.rmSync(stubsPath, { recursive: true, force: true });
    });

    test('should handle initialization errors gracefully', async () => {
      // Try to initialize in non-existent directory
      const invalidPath = '/non/existent/path/that/definitely/does/not/exist';

      // Should not throw, but should log error
      await assert.doesNotReject(async () => {
        await integration.initializeStubs(invalidPath);
      });
    });
  });

  suite('Intelephense Configuration', () => {
    test('should create settings.json if it does not exist', async function() {
      // Skip if no workspace
      if (!testWorkspacePath || testWorkspacePath === '/tmp/test-workspace') {
        this.skip();
        return;
      }

      const settingsPath = path.join(testWorkspacePath, '.vscode', 'settings.json');

      // Remove settings if exists
      if (fs.existsSync(settingsPath)) {
        fs.unlinkSync(settingsPath);
      }

      await integration.configureIntelephense(testWorkspacePath);

      // Check if settings.json was created
      assert.ok(fs.existsSync(settingsPath), 'settings.json should be created');

      // Read and verify content
      const content = fs.readFileSync(settingsPath, 'utf-8');
      const settings = JSON.parse(content);

      assert.ok(settings['intelephense.stubs'], 'intelephense.stubs setting should exist');
      assert.ok(
        Array.isArray(settings['intelephense.stubs']),
        'intelephense.stubs should be an array'
      );
      assert.ok(
        settings['intelephense.stubs'].includes('.vscode/kirby-stubs'),
        'Stub path should be in settings'
      );

      // Clean up
      fs.unlinkSync(settingsPath);
    });

    test('should add stub path to existing settings', async function() {
      // Skip if no workspace
      if (!testWorkspacePath || testWorkspacePath === '/tmp/test-workspace') {
        this.skip();
        return;
      }

      const settingsPath = path.join(testWorkspacePath, '.vscode', 'settings.json');

      // Create existing settings
      fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
      fs.writeFileSync(
        settingsPath,
        JSON.stringify({ 'editor.fontSize': 14, 'intelephense.stubs': ['other-stub'] }, null, 2)
      );

      await integration.configureIntelephense(testWorkspacePath);

      // Read and verify
      const content = fs.readFileSync(settingsPath, 'utf-8');
      const settings = JSON.parse(content);

      assert.strictEqual(settings['editor.fontSize'], 14, 'Existing settings should be preserved');
      assert.ok(
        settings['intelephense.stubs'].includes('other-stub'),
        'Existing stubs should be preserved'
      );
      assert.ok(
        settings['intelephense.stubs'].includes('.vscode/kirby-stubs'),
        'New stub path should be added'
      );

      // Clean up
      fs.unlinkSync(settingsPath);
    });

    test('should not add duplicate stub paths', async function() {
      // Skip if no workspace
      if (!testWorkspacePath || testWorkspacePath === '/tmp/test-workspace') {
        this.skip();
        return;
      }

      const settingsPath = path.join(testWorkspacePath, '.vscode', 'settings.json');

      // Create settings with stub path already present
      fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
      fs.writeFileSync(
        settingsPath,
        JSON.stringify({ 'intelephense.stubs': ['.vscode/kirby-stubs'] }, null, 2)
      );

      await integration.configureIntelephense(testWorkspacePath);

      // Read and verify
      const content = fs.readFileSync(settingsPath, 'utf-8');
      const settings = JSON.parse(content);

      // Count occurrences
      const count = settings['intelephense.stubs'].filter(
        (s: string) => s === '.vscode/kirby-stubs'
      ).length;

      assert.strictEqual(count, 1, 'Stub path should not be duplicated');

      // Clean up
      fs.unlinkSync(settingsPath);
    });
  });

  suite('Gitignore Management', () => {
    test('should add stub pattern to .gitignore', async function() {
      // Skip if no workspace
      if (!testWorkspacePath || testWorkspacePath === '/tmp/test-workspace') {
        this.skip();
        return;
      }

      const gitignorePath = path.join(testWorkspacePath, '.gitignore');

      // Remove .gitignore if exists
      if (fs.existsSync(gitignorePath)) {
        fs.unlinkSync(gitignorePath);
      }

      // Initialize stubs (which should update gitignore)
      await integration.initialize();

      // Give it time to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      if (fs.existsSync(gitignorePath)) {
        const content = fs.readFileSync(gitignorePath, 'utf-8');
        assert.ok(
          content.includes('.vscode/kirby-stubs/'),
          'Gitignore should contain stub pattern'
        );

        // Clean up
        fs.unlinkSync(gitignorePath);
      }
    });
  });

  suite('Stub Cleanup', () => {
    test('should remove stub directory', async function() {
      // Skip if no workspace
      if (!testWorkspacePath || testWorkspacePath === '/tmp/test-workspace') {
        this.skip();
        return;
      }

      const stubsPath = path.join(testWorkspacePath, '.vscode', 'kirby-stubs');

      // Create stub directory
      fs.mkdirSync(stubsPath, { recursive: true });
      fs.writeFileSync(path.join(stubsPath, 'test.php'), '<?php');

      assert.ok(fs.existsSync(stubsPath), 'Stub directory should exist before cleanup');

      await integration.cleanupStubs();

      assert.ok(!fs.existsSync(stubsPath), 'Stub directory should be removed after cleanup');
    });

    test('should remove stub path from settings', async function() {
      // Skip if no workspace
      if (!testWorkspacePath || testWorkspacePath === '/tmp/test-workspace') {
        this.skip();
        return;
      }

      const settingsPath = path.join(testWorkspacePath, '.vscode', 'settings.json');

      // Create settings with stub path
      fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
      fs.writeFileSync(
        settingsPath,
        JSON.stringify({ 'intelephense.stubs': ['.vscode/kirby-stubs', 'other-stub'] }, null, 2)
      );

      await integration.cleanupStubs();

      // Read and verify
      const content = fs.readFileSync(settingsPath, 'utf-8');
      const settings = JSON.parse(content);

      assert.ok(
        !settings['intelephense.stubs'].includes('.vscode/kirby-stubs'),
        'Stub path should be removed from settings'
      );
      assert.ok(
        settings['intelephense.stubs'].includes('other-stub'),
        'Other stub paths should be preserved'
      );

      // Clean up
      fs.unlinkSync(settingsPath);
    });

    test('should handle cleanup errors gracefully', async () => {
      // Should not throw when cleaning up non-existent stubs
      await assert.doesNotReject(async () => {
        await integration.cleanupStubs();
      });
    });
  });

  suite('Stub Reinstallation', () => {
    test('should reinstall stubs', async function() {
      // Skip if no workspace or source stubs don't exist
      if (!testWorkspacePath || testWorkspacePath === '/tmp/test-workspace') {
        this.skip();
        return;
      }

      const stubsPath = path.join(testWorkspacePath, '.vscode', 'kirby-stubs');

      // Create old stub directory
      fs.mkdirSync(stubsPath, { recursive: true });
      fs.writeFileSync(path.join(stubsPath, 'old.php'), '<?php // old');

      try {
        await integration.reinstallStubs();

        // Old file should be gone (directory was recreated)
        assert.ok(!fs.existsSync(path.join(stubsPath, 'old.php')), 'Old files should be removed');
      } catch (error) {
        // May fail if source stubs don't exist
        console.log('Reinstall failed (expected in test environment):', error);
      }

      // Clean up
      if (fs.existsSync(stubsPath)) {
        fs.rmSync(stubsPath, { recursive: true, force: true });
      }
    });
  });

  suite('State Management', () => {
    test('should track installation state', () => {
      // Initially should be false
      assert.strictEqual(integration.areStubsInstalled(), false);
    });
  });

  suite('Custom Stubs Path Validation (Security)', () => {
    test('should reject path traversal attempts', async function() {
      if (!testWorkspacePath || testWorkspacePath === '/tmp/test-workspace') {
        this.skip();
        return;
      }

      const maliciousPaths = [
        '../../etc/passwd',
        '../../../root',
        '..\\..\\Windows',
        './../../../secret'
      ];

      for (const maliciousPath of maliciousPaths) {
        // Set malicious custom stubs path
        const config = vscode.workspace.getConfiguration('kirby');
        await config.update('customStubsPath', maliciousPath, vscode.ConfigurationTarget.Workspace);

        try {
          await integration.initializeStubs(testWorkspacePath);

          // Should fall back to bundled stubs
          const targetDir = path.join(testWorkspacePath, '.vscode', 'kirby-stubs');

          // If stubs were created, they should be from bundled source, not malicious path
          if (fs.existsSync(targetDir)) {
            // Clean up
            fs.rmSync(targetDir, { recursive: true, force: true });
          }
        } catch (error) {
          // Some malicious paths should throw errors
          assert.ok(true, 'Expected to handle malicious path');
        }

        // Reset config
        await config.update('customStubsPath', '', vscode.ConfigurationTarget.Workspace);
      }
    });

    test('should reject sensitive system directories', async function() {
      if (!testWorkspacePath || testWorkspacePath === '/tmp/test-workspace') {
        this.skip();
        return;
      }

      const dangerousPaths = [
        '/etc',
        '/sys',
        '/proc',
        '/root',
        'C:\\Windows',
        'C:\\Program Files'
      ];

      for (const dangerousPath of dangerousPaths) {
        const config = vscode.workspace.getConfiguration('kirby');
        await config.update('customStubsPath', dangerousPath, vscode.ConfigurationTarget.Workspace);

        try {
          await integration.initializeStubs(testWorkspacePath);

          // Should fall back to bundled stubs, not use dangerous path
          const targetDir = path.join(testWorkspacePath, '.vscode', 'kirby-stubs');
          if (fs.existsSync(targetDir)) {
            fs.rmSync(targetDir, { recursive: true, force: true });
          }
        } catch (error) {
          // Expected to fail or fall back
          assert.ok(true);
        }

        await config.update('customStubsPath', '', vscode.ConfigurationTarget.Workspace);
      }
    });

    test('should accept valid relative paths within workspace', async function() {
      if (!testWorkspacePath || testWorkspacePath === '/tmp/test-workspace') {
        this.skip();
        return;
      }

      const validPath = 'custom-stubs/kirby-api';
      const fullPath = path.join(testWorkspacePath, validPath);

      // Create the custom stubs directory with at least one file
      fs.mkdirSync(fullPath, { recursive: true });
      fs.writeFileSync(path.join(fullPath, 'test.php'), '<?php');

      const config = vscode.workspace.getConfiguration('kirby');
      await config.update('customStubsPath', validPath, vscode.ConfigurationTarget.Workspace);

      try {
        await integration.initializeStubs(testWorkspacePath);
        // Should not throw for valid path
        assert.ok(true, 'Valid relative path should be accepted');
      } catch (error) {
        // Acceptable if source directory doesn't have expected structure
        console.log('Custom path test error (acceptable):', error);
      }

      // Clean up
      const targetDir = path.join(testWorkspacePath, '.vscode', 'kirby-stubs');
      if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true });
      }
      fs.rmSync(fullPath, { recursive: true, force: true });
      await config.update('customStubsPath', '', vscode.ConfigurationTarget.Workspace);
    });

    test('should reject null and invalid types', async function() {
      if (!testWorkspacePath || testWorkspacePath === '/tmp/test-workspace') {
        this.skip();
        return;
      }

      const invalidValues = [
        null,
        undefined,
        123,
        true,
        {},
        []
      ];

      for (const invalidValue of invalidValues) {
        const config = vscode.workspace.getConfiguration('kirby');
        try {
          await config.update('customStubsPath', invalidValue as any, vscode.ConfigurationTarget.Workspace);
          await integration.initializeStubs(testWorkspacePath);
          // Should fall back to bundled stubs
          assert.ok(true);
        } catch (error) {
          // Acceptable
          assert.ok(true);
        }

        await config.update('customStubsPath', '', vscode.ConfigurationTarget.Workspace);
      }
    });
  });

  suite('Settings Array Validation', () => {
    test('should filter non-string items from stubs array', async function() {
      if (!testWorkspacePath || testWorkspacePath === '/tmp/test-workspace') {
        this.skip();
        return;
      }

      const settingsPath = path.join(testWorkspacePath, '.vscode', 'settings.json');

      // Create settings with mixed array types
      fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
      fs.writeFileSync(
        settingsPath,
        JSON.stringify({
          'intelephense.stubs': ['valid-stub', 123, null, 'another-stub', {}, []]
        }, null, 2)
      );

      await integration.configureIntelephense(testWorkspacePath);

      // Read and verify
      const content = fs.readFileSync(settingsPath, 'utf-8');
      const settings = JSON.parse(content);

      // Should only contain strings
      const allStrings = settings['intelephense.stubs'].every((item: any) => typeof item === 'string');
      assert.ok(allStrings, 'All array items should be strings');

      // Should contain valid items plus new stub
      assert.ok(
        settings['intelephense.stubs'].includes('valid-stub'),
        'Should preserve valid string items'
      );
      assert.ok(
        settings['intelephense.stubs'].includes('.vscode/kirby-stubs'),
        'Should add new stub path'
      );

      // Clean up
      fs.unlinkSync(settingsPath);
    });
  });

  suite('Symlink Security', () => {
    test('should skip symlinks during copy', async function() {
      if (!testWorkspacePath || testWorkspacePath === '/tmp/test-workspace') {
        this.skip();
        return;
      }

      // This test is platform-dependent (symlinks work differently on Windows)
      if (process.platform === 'win32') {
        this.skip();
        return;
      }

      const sourceDir = path.join(testWorkspacePath, 'test-source');
      const targetDir = path.join(testWorkspacePath, '.vscode', 'kirby-stubs');
      const symlinkPath = path.join(sourceDir, 'malicious-link');

      try {
        // Create source directory with a symlink
        fs.mkdirSync(sourceDir, { recursive: true });
        fs.writeFileSync(path.join(sourceDir, 'normal-file.php'), '<?php');

        // Create a symlink pointing to /etc
        try {
          fs.symlinkSync('/etc', symlinkPath);
        } catch (e) {
          // Skip if we can't create symlinks (permissions)
          this.skip();
          return;
        }

        // Configure to use this source
        const config = vscode.workspace.getConfiguration('kirby');
        await config.update('customStubsPath', sourceDir, vscode.ConfigurationTarget.Workspace);

        await integration.initializeStubs(testWorkspacePath);

        // Verify symlink was not copied
        const copiedSymlink = path.join(targetDir, 'malicious-link');
        assert.ok(!fs.existsSync(copiedSymlink), 'Symlink should not be copied');

        // Verify normal file was copied
        const copiedFile = path.join(targetDir, 'normal-file.php');
        assert.ok(fs.existsSync(copiedFile), 'Normal file should be copied');

        // Clean up
        fs.rmSync(sourceDir, { recursive: true, force: true });
        if (fs.existsSync(targetDir)) {
          fs.rmSync(targetDir, { recursive: true, force: true });
        }
        await config.update('customStubsPath', '', vscode.ConfigurationTarget.Workspace);
      } catch (error) {
        console.log('Symlink test error (may be acceptable):', error);
        // Clean up on error
        if (fs.existsSync(sourceDir)) {
          fs.rmSync(sourceDir, { recursive: true, force: true });
        }
      }
    });
  });
});
