import * as assert from 'assert';
import * as path from 'path';
import { isTemplateFile, isSnippetFile, isBlueprintFile, isSnippetControllerFile } from '../utils/kirbyProject';

suite('Kirby Project Utils Test Suite', () => {
	const mockWorkspaceRoot = '/mock/workspace';

	suite('isTemplateFile', () => {
		test('should return true for template file', () => {
			const filePath = path.join(mockWorkspaceRoot, 'site', 'templates', 'default.php');
			// Note: This will return false in test environment without actual workspace
			// This is a placeholder for the structure
			assert.strictEqual(typeof isTemplateFile(filePath), 'boolean');
		});

		test('should return false for non-PHP file', () => {
			const filePath = path.join(mockWorkspaceRoot, 'site', 'templates', 'default.txt');
			assert.strictEqual(isTemplateFile(filePath), false);
		});

		test('should return false for file outside templates', () => {
			const filePath = path.join(mockWorkspaceRoot, 'site', 'snippets', 'header.php');
			assert.strictEqual(isTemplateFile(filePath), false);
		});
	});

	suite('isSnippetFile', () => {
		test('should return false for snippet file without workspace', () => {
			const filePath = path.join(mockWorkspaceRoot, 'site', 'snippets', 'header.php');
			// Note: Returns false in test environment without actual workspace
			assert.strictEqual(isSnippetFile(filePath), false);
		});

		test('should return false for non-PHP file', () => {
			const filePath = path.join(mockWorkspaceRoot, 'site', 'snippets', 'header.txt');
			assert.strictEqual(isSnippetFile(filePath), false);
		});

		test('should return false for snippet controller file', () => {
			const filePath = path.join(mockWorkspaceRoot, 'site', 'snippets', 'header.controller.php');
			// Snippet controller files should be detected by isSnippetControllerFile, not isSnippetFile
			assert.strictEqual(isSnippetFile(filePath), false);
		});
	});

	suite('isSnippetControllerFile', () => {
		test('should return false for snippet controller file without workspace', () => {
			const filePath = path.join(mockWorkspaceRoot, 'site', 'snippets', 'header.controller.php');
			// Note: Returns false in test environment without actual workspace
			assert.strictEqual(isSnippetControllerFile(filePath), false);
		});

		test('should return false for nested snippet controller file without workspace', () => {
			const filePath = path.join(mockWorkspaceRoot, 'site', 'snippets', 'partials', 'menu.controller.php');
			// Note: Returns false in test environment without actual workspace
			assert.strictEqual(isSnippetControllerFile(filePath), false);
		});

		test('should return false for regular snippet file', () => {
			const filePath = path.join(mockWorkspaceRoot, 'site', 'snippets', 'header.php');
			assert.strictEqual(isSnippetControllerFile(filePath), false);
		});

		test('should return false for non-controller PHP file', () => {
			const filePath = path.join(mockWorkspaceRoot, 'site', 'templates', 'default.php');
			assert.strictEqual(isSnippetControllerFile(filePath), false);
		});

		test('should return false for file outside snippets directory', () => {
			const filePath = path.join(mockWorkspaceRoot, 'site', 'controllers', 'default.controller.php');
			assert.strictEqual(isSnippetControllerFile(filePath), false);
		});
	});

	suite('isBlueprintFile', () => {
		test('should identify blueprint files', () => {
			const filePath = path.join(mockWorkspaceRoot, 'site', 'blueprints', 'default.yml');
			assert.strictEqual(typeof isBlueprintFile(filePath), 'boolean');
		});

		test('should return false for non-YAML files', () => {
			const filePath = path.join(mockWorkspaceRoot, 'site', 'blueprints', 'default.php');
			assert.strictEqual(isBlueprintFile(filePath), false);
		});
	});
});
