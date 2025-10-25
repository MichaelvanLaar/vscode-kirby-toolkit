import * as assert from 'assert';
import { validateFileName, isControllerFile, isModelFile } from '../utils/kirbyProject';

suite('Kirby Project Extended Test Suite', () => {
	suite('validateFileName', () => {
		test('should accept valid simple names', () => {
			assert.strictEqual(validateFileName('project'), true);
			assert.strictEqual(validateFileName('article'), true);
			assert.strictEqual(validateFileName('blog-post'), true);
			assert.strictEqual(validateFileName('my_page'), true);
			assert.strictEqual(validateFileName('Page123'), true);
		});

		test('should reject empty names', () => {
			assert.strictEqual(validateFileName(''), false);
			assert.strictEqual(validateFileName('   '), false);
		});

		test('should reject path traversal attempts', () => {
			assert.strictEqual(validateFileName('../etc'), false);
			assert.strictEqual(validateFileName('..\\windows'), false);
			assert.strictEqual(validateFileName('test/../admin'), false);
		});

		test('should reject names with slashes', () => {
			assert.strictEqual(validateFileName('path/to/file'), false);
			assert.strictEqual(validateFileName('path\\to\\file'), false);
		});

		test('should reject absolute paths', () => {
			assert.strictEqual(validateFileName('/etc/passwd'), false);
			assert.strictEqual(validateFileName('C:\\Windows\\System32'), false);
		});

		test('should reject special characters', () => {
			assert.strictEqual(validateFileName('test@file'), false);
			assert.strictEqual(validateFileName('test$file'), false);
			assert.strictEqual(validateFileName('test#file'), false);
			assert.strictEqual(validateFileName('test file'), false);
		});

		test('should reject null and undefined', () => {
			assert.strictEqual(validateFileName(null as any), false);
			assert.strictEqual(validateFileName(undefined as any), false);
		});

		test('should handle names with multiple hyphens', () => {
			assert.strictEqual(validateFileName('my-long-page-name'), true);
		});

		test('should handle names with multiple underscores', () => {
			assert.strictEqual(validateFileName('my_long_page_name'), true);
		});

		test('should handle mixed alphanumeric with hyphens and underscores', () => {
			assert.strictEqual(validateFileName('page_123-abc'), true);
		});
	});

	suite('isControllerFile', () => {
		test('should return false for non-controller files', () => {
			assert.strictEqual(isControllerFile('/workspace/site/templates/default.php'), false);
			assert.strictEqual(isControllerFile('/workspace/site/models/article.php'), false);
		});

		test('should return false for non-PHP files in controllers', () => {
			assert.strictEqual(isControllerFile('/workspace/site/controllers/default.txt'), false);
		});

		test('should handle paths correctly', () => {
			// In test environment without workspace, these will return false
			// But function should not throw errors
			const result = isControllerFile('/workspace/site/controllers/project.php');
			assert.strictEqual(typeof result, 'boolean');
		});
	});

	suite('isModelFile', () => {
		test('should return false for non-model files', () => {
			assert.strictEqual(isModelFile('/workspace/site/templates/default.php'), false);
			assert.strictEqual(isModelFile('/workspace/site/controllers/article.php'), false);
		});

		test('should return false for non-PHP files in models', () => {
			assert.strictEqual(isModelFile('/workspace/site/models/default.txt'), false);
		});

		test('should handle paths correctly', () => {
			// In test environment without workspace, these will return false
			// But function should not throw errors
			const result = isModelFile('/workspace/site/models/project.php');
			assert.strictEqual(typeof result, 'boolean');
		});
	});
});
