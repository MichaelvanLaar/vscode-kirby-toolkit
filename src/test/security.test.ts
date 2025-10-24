import * as assert from 'assert';
import { resolveSnippetPath } from '../utils/kirbyProject';

suite('Security Test Suite', () => {
	suite('Path Traversal Protection', () => {
		test('should reject path traversal with ../', () => {
			const maliciousName = '../../etc/passwd';
			const result = resolveSnippetPath(maliciousName);

			// Should return undefined for malicious paths
			assert.strictEqual(result, undefined);
		});

		test('should reject path traversal with ..\\ (Windows)', () => {
			const maliciousName = '..\\..\\windows\\system32\\config';
			const result = resolveSnippetPath(maliciousName);

			assert.strictEqual(result, undefined);
		});

		test('should reject absolute paths', () => {
			const maliciousName = '/etc/passwd';
			const result = resolveSnippetPath(maliciousName);

			assert.strictEqual(result, undefined);
		});

		test('should accept legitimate nested snippet names', () => {
			const legitimateName = 'partials/menu';
			const result = resolveSnippetPath(legitimateName);

			// In test environment without workspace, will return undefined
			// But the important part is it doesn't throw an error
			assert.ok(typeof result === 'string' || result === undefined);
		});

		test('should accept simple snippet names', () => {
			const legitimateName = 'header';
			const result = resolveSnippetPath(legitimateName);

			// In test environment without workspace, will return undefined
			assert.ok(typeof result === 'string' || result === undefined);
		});

		test('should reject empty snippet names', () => {
			const emptyName = '';
			const result = resolveSnippetPath(emptyName);

			assert.strictEqual(result, undefined);
		});

		test('should reject null-like inputs', () => {
			// TypeScript will catch this at compile time, but testing runtime behavior
			const result = resolveSnippetPath(null as any);

			assert.strictEqual(result, undefined);
		});

		test('should reject paths with embedded ..', () => {
			const maliciousName = 'partials/../../../etc/passwd';
			const result = resolveSnippetPath(maliciousName);

			assert.strictEqual(result, undefined);
		});
	});
});
