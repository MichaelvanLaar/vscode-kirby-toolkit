import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import {
  isSnippetControllerFile,
  resolveSnippetControllerPath,
  snippetControllerExists,
  getSnippetNameFromController,
  resolveSnippetFromController,
  getSnippetNameFromPath,
  isSnippetControllerPluginInstalled,
  clearSnippetControllerPluginCache
} from '../utils/kirbyProject';

suite('Snippet Controller Test Suite', () => {
  let testWorkspace: string;

  setup(() => {
    // Create a temporary test workspace
    testWorkspace = fs.mkdtempSync(path.join(os.tmpdir(), 'kirby-test-'));

    // Create basic Kirby directory structure
    const siteDir = path.join(testWorkspace, 'site');
    const snippetsDir = path.join(siteDir, 'snippets');
    const pluginsDir = path.join(siteDir, 'plugins');

    fs.mkdirSync(siteDir, { recursive: true });
    fs.mkdirSync(snippetsDir, { recursive: true });
    fs.mkdirSync(pluginsDir, { recursive: true });
  });

  teardown(() => {
    // Clean up test workspace
    if (fs.existsSync(testWorkspace)) {
      fs.rmSync(testWorkspace, { recursive: true, force: true });
    }
    clearSnippetControllerPluginCache();
  });

  suite('isSnippetControllerFile', () => {
    test('should return true for controller file in snippets directory', () => {
      const filePath = path.join(testWorkspace, 'site', 'snippets', 'header.controller.php');
      assert.strictEqual(isSnippetControllerFile(filePath), true);
    });

    test('should return true for nested controller file', () => {
      const filePath = path.join(testWorkspace, 'site', 'snippets', 'partials', 'menu.controller.php');
      assert.strictEqual(isSnippetControllerFile(filePath), true);
    });

    test('should return false for regular snippet file', () => {
      const filePath = path.join(testWorkspace, 'site', 'snippets', 'header.php');
      assert.strictEqual(isSnippetControllerFile(filePath), false);
    });

    test('should return false for controller outside snippets directory', () => {
      const filePath = path.join(testWorkspace, 'site', 'templates', 'default.controller.php');
      assert.strictEqual(isSnippetControllerFile(filePath), false);
    });

    test('should return false for non-PHP file', () => {
      const filePath = path.join(testWorkspace, 'site', 'snippets', 'header.controller.txt');
      assert.strictEqual(isSnippetControllerFile(filePath), false);
    });
  });

  suite('resolveSnippetControllerPath', () => {
    test('should resolve path for simple snippet name', () => {
      const controllerPath = resolveSnippetControllerPath('header');
      assert.ok(controllerPath);
      assert.ok(controllerPath.endsWith('site/snippets/header.controller.php'));
    });

    test('should resolve path for nested snippet name', () => {
      const controllerPath = resolveSnippetControllerPath('partials/menu');
      assert.ok(controllerPath);
      assert.ok(controllerPath.includes('site/snippets/partials/menu.controller.php'));
    });

    test('should return undefined for path traversal attempt', () => {
      const controllerPath = resolveSnippetControllerPath('../../../etc/passwd');
      assert.strictEqual(controllerPath, undefined);
    });

    test('should return undefined for absolute path', () => {
      const controllerPath = resolveSnippetControllerPath('/etc/passwd');
      assert.strictEqual(controllerPath, undefined);
    });

    test('should return undefined for empty snippet name', () => {
      const controllerPath = resolveSnippetControllerPath('');
      assert.strictEqual(controllerPath, undefined);
    });
  });

  suite('snippetControllerExists', () => {
    test('should return true when controller file exists', () => {
      const snippetsDir = path.join(testWorkspace, 'site', 'snippets');
      const controllerPath = path.join(snippetsDir, 'header.controller.php');
      fs.writeFileSync(controllerPath, '<?php // Test controller');

      const exists = snippetControllerExists('header');
      assert.strictEqual(exists, true);
    });

    test('should return false when controller file does not exist', () => {
      const exists = snippetControllerExists('nonexistent');
      assert.strictEqual(exists, false);
    });

    test('should return true for nested controller that exists', () => {
      const snippetsDir = path.join(testWorkspace, 'site', 'snippets');
      const nestedDir = path.join(snippetsDir, 'partials');
      fs.mkdirSync(nestedDir, { recursive: true });
      const controllerPath = path.join(nestedDir, 'menu.controller.php');
      fs.writeFileSync(controllerPath, '<?php // Test controller');

      const exists = snippetControllerExists('partials/menu');
      assert.strictEqual(exists, true);
    });

    test('should return false for path traversal attempt', () => {
      const exists = snippetControllerExists('../../../etc/passwd');
      assert.strictEqual(exists, false);
    });
  });

  suite('getSnippetNameFromController', () => {
    test('should extract snippet name from controller path', () => {
      const controllerPath = path.join(testWorkspace, 'site', 'snippets', 'header.controller.php');
      const snippetName = getSnippetNameFromController(controllerPath);
      assert.strictEqual(snippetName, 'header');
    });

    test('should extract snippet name from nested controller path', () => {
      const controllerPath = path.join(testWorkspace, 'site', 'snippets', 'partials', 'menu.controller.php');
      const snippetName = getSnippetNameFromController(controllerPath);
      assert.strictEqual(snippetName, 'partials/menu');
    });

    test('should return undefined for non-controller file', () => {
      const snippetPath = path.join(testWorkspace, 'site', 'snippets', 'header.php');
      const snippetName = getSnippetNameFromController(snippetPath);
      assert.strictEqual(snippetName, undefined);
    });

    test('should return undefined for controller outside snippets directory', () => {
      const controllerPath = path.join(testWorkspace, 'site', 'templates', 'default.controller.php');
      const snippetName = getSnippetNameFromController(controllerPath);
      assert.strictEqual(snippetName, undefined);
    });
  });

  suite('resolveSnippetFromController', () => {
    test('should resolve snippet path from controller path', () => {
      const controllerPath = path.join(testWorkspace, 'site', 'snippets', 'header.controller.php');
      const snippetPath = resolveSnippetFromController(controllerPath);
      assert.ok(snippetPath);
      assert.ok(snippetPath.endsWith('site/snippets/header.php'));
    });

    test('should resolve nested snippet path from controller path', () => {
      const controllerPath = path.join(testWorkspace, 'site', 'snippets', 'partials', 'menu.controller.php');
      const snippetPath = resolveSnippetFromController(controllerPath);
      assert.ok(snippetPath);
      assert.ok(snippetPath.includes('site/snippets/partials/menu.php'));
    });

    test('should return undefined for non-controller file', () => {
      const snippetFilePath = path.join(testWorkspace, 'site', 'snippets', 'header.php');
      const snippetPath = resolveSnippetFromController(snippetFilePath);
      assert.strictEqual(snippetPath, undefined);
    });
  });

  suite('getSnippetNameFromPath', () => {
    test('should extract snippet name from snippet path', () => {
      const snippetPath = path.join(testWorkspace, 'site', 'snippets', 'header.php');
      const snippetName = getSnippetNameFromPath(snippetPath);
      assert.strictEqual(snippetName, 'header');
    });

    test('should extract snippet name from nested snippet path', () => {
      const snippetPath = path.join(testWorkspace, 'site', 'snippets', 'partials', 'menu.php');
      const snippetName = getSnippetNameFromPath(snippetPath);
      assert.strictEqual(snippetName, 'partials/menu');
    });

    test('should return undefined for non-snippet file', () => {
      const templatePath = path.join(testWorkspace, 'site', 'templates', 'default.php');
      const snippetName = getSnippetNameFromPath(templatePath);
      assert.strictEqual(snippetName, undefined);
    });

    test('should return undefined for controller file', () => {
      const controllerPath = path.join(testWorkspace, 'site', 'snippets', 'header.controller.php');
      const snippetName = getSnippetNameFromPath(controllerPath);
      assert.strictEqual(snippetName, undefined);
    });
  });

  suite('Plugin Detection', () => {
    test('should detect plugin via composer.json', () => {
      const composerPath = path.join(testWorkspace, 'composer.json');
      const composerContent = {
        require: {
          'lukaskleinschmidt/kirby-snippet-controller': '^1.0'
        }
      };
      fs.writeFileSync(composerPath, JSON.stringify(composerContent, null, 2));

      clearSnippetControllerPluginCache();
      const detected = isSnippetControllerPluginInstalled();
      assert.strictEqual(detected, true);
    });

    test('should detect plugin via site/plugins directory', () => {
      const pluginDir = path.join(testWorkspace, 'site', 'plugins', 'kirby-snippet-controller');
      fs.mkdirSync(pluginDir, { recursive: true });
      fs.writeFileSync(path.join(pluginDir, 'index.php'), '<?php // Plugin');

      clearSnippetControllerPluginCache();
      const detected = isSnippetControllerPluginInstalled();
      assert.strictEqual(detected, true);
    });

    test('should return false when plugin is not installed', () => {
      clearSnippetControllerPluginCache();
      const detected = isSnippetControllerPluginInstalled();
      assert.strictEqual(detected, false);
    });

    test('should cache detection result', () => {
      // First call
      clearSnippetControllerPluginCache();
      const first = isSnippetControllerPluginInstalled();

      // Add plugin
      const pluginDir = path.join(testWorkspace, 'site', 'plugins', 'kirby-snippet-controller');
      fs.mkdirSync(pluginDir, { recursive: true });

      // Second call should still return cached result
      const second = isSnippetControllerPluginInstalled();
      assert.strictEqual(first, second);

      // After clearing cache, should detect plugin
      clearSnippetControllerPluginCache();
      const third = isSnippetControllerPluginInstalled();
      assert.strictEqual(third, true);
    });
  });

  suite('Security Tests', () => {
    test('should prevent path traversal in resolveSnippetControllerPath', () => {
      const maliciousNames = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32',
        'partials/../../templates/default',
        '/etc/passwd',
        'C:\\Windows\\System32'
      ];

      for (const name of maliciousNames) {
        const result = resolveSnippetControllerPath(name);
        assert.strictEqual(
          result,
          undefined,
          `Path traversal not prevented for: ${name}`
        );
      }
    });

    test('should ensure resolved paths stay within snippets directory', () => {
      const validNames = ['header', 'partials/menu', 'components/card/item'];

      for (const name of validNames) {
        const result = resolveSnippetControllerPath(name);
        assert.ok(result, `Failed to resolve valid name: ${name}`);
        assert.ok(
          result.includes('site/snippets'),
          `Path not in snippets directory: ${result}`
        );
        assert.ok(
          !result.includes('..'),
          `Path contains traversal: ${result}`
        );
      }
    });

    test('should reject invalid snippet names', () => {
      const invalidNames = ['', null, undefined, '../test', '/absolute/path'];

      for (const name of invalidNames) {
        const result = resolveSnippetControllerPath(name as any);
        assert.strictEqual(
          result,
          undefined,
          `Invalid name not rejected: ${name}`
        );
      }
    });
  });
});
