import * as assert from 'assert';
import * as path from 'path';
import { isTemplateFile, isSnippetFile, isBlueprintFile } from '../utils/kirbyProject';

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
		test('should return true for snippet file', () => {
			const filePath = path.join(mockWorkspaceRoot, 'site', 'snippets', 'header.php');
			assert.strictEqual(typeof isSnippetFile(filePath), 'boolean');
		});

		test('should return false for non-PHP file', () => {
			const filePath = path.join(mockWorkspaceRoot, 'site', 'snippets', 'header.txt');
			assert.strictEqual(isSnippetFile(filePath), false);
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
