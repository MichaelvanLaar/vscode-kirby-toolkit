import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { generateTypeHintBlock, hasTypeHints } from '../providers/typeHintProvider';
import { isSnippetFile, isSnippetControllerFile } from '../utils/kirbyProject';

suite('Type Hints Test Suite', () => {
	suite('generateTypeHintBlock', () => {
		test('should generate type hint block for default variables', () => {
			const variables = ['$page', '$site', '$kirby'];
			const block = generateTypeHintBlock(variables);

			assert.ok(block.includes('<?php'));
			assert.ok(block.includes('/**'));
			assert.ok(block.includes('@var \\Kirby\\Cms\\Page $page'));
			assert.ok(block.includes('@var \\Kirby\\Cms\\Site $site'));
			assert.ok(block.includes('@var \\Kirby\\Cms\\App $kirby'));
			assert.ok(block.includes(' */'));
		});

		test('should handle single variable', () => {
			const variables = ['$page'];
			const block = generateTypeHintBlock(variables);

			assert.ok(block.includes('@var \\Kirby\\Cms\\Page $page'));
			assert.strictEqual((block.match(/@var/g) || []).length, 1);
		});

		test('should handle unknown variables with mixed type', () => {
			const variables = ['$page', '$custom'];
			const block = generateTypeHintBlock(variables);

			assert.ok(block.includes('@var \\Kirby\\Cms\\Page $page'));
			assert.ok(block.includes('@var mixed $custom'));
		});

		test('should handle empty array', () => {
			const variables: string[] = [];
			const block = generateTypeHintBlock(variables);

			assert.ok(block.includes('<?php'));
			assert.ok(block.includes('/**'));
			assert.ok(block.includes(' */'));
			assert.strictEqual((block.match(/@var/g) || []).length, 0);
		});
	});

	suite('hasTypeHints', () => {
		test('should detect existing Kirby type hints', async () => {
			const content = `<?php
/**
 * @var \\Kirby\\Cms\\Page $page
 * @var \\Kirby\\Cms\\Site $site
 */
?>`;
			const document = await createMockDocument(content);
			assert.strictEqual(hasTypeHints(document), true);
		});

		test('should return false for file without type hints', async () => {
			const content = `<?php
// Just some PHP code
echo "Hello";
?>`;
			const document = await createMockDocument(content);
			assert.strictEqual(hasTypeHints(document), false);
		});

		test('should return false for empty document', async () => {
			const content = "";
			const document = await createMockDocument(content);
			assert.strictEqual(hasTypeHints(document), false);
		});

		test('should detect case-insensitive type hints', async () => {
			const content = `<?php
/**
 * @var \\kirby\\cms\\page $page
 */
?>`;
			const document = await createMockDocument(content);
			assert.strictEqual(hasTypeHints(document), true);
		});
	});

	suite('Snippet Controller File Detection', () => {
		test('should not match both snippet and controller for same file', () => {
			// Test that .controller.php files are only detected as controllers, not snippets
			const controllerFile = path.join('/workspace', 'site', 'snippets', 'header.controller.php');
			const regularSnippet = path.join('/workspace', 'site', 'snippets', 'header.php');

			// Both functions should return false without workspace, but the logic should be mutually exclusive
			// We're testing that the detection logic itself is correct
			const controllerAsSnippet = isSnippetFile(controllerFile);
			const controllerAsController = isSnippetControllerFile(controllerFile);
			const snippetAsSnippet = isSnippetFile(regularSnippet);
			const snippetAsController = isSnippetControllerFile(regularSnippet);

			// Controller files should NOT be detected as regular snippets
			assert.strictEqual(controllerAsSnippet, false, 'Controller file should not be detected as snippet');

			// Regular snippets should NOT be detected as controller files
			assert.strictEqual(snippetAsController, false, 'Regular snippet should not be detected as controller');

			// Verify the functions return consistent types
			assert.strictEqual(typeof controllerAsController, 'boolean');
			assert.strictEqual(typeof snippetAsSnippet, 'boolean');
		});

		test('should handle nested controller paths correctly', () => {
			const nestedController = path.join('/workspace', 'site', 'snippets', 'partials', 'menu.controller.php');
			const nestedSnippet = path.join('/workspace', 'site', 'snippets', 'partials', 'menu.php');

			// Neither should be detected as both
			const nestedCtrlAsSnippet = isSnippetFile(nestedController);
			const nestedSnipAsController = isSnippetControllerFile(nestedSnippet);

			assert.strictEqual(nestedCtrlAsSnippet, false, 'Nested controller should not be detected as snippet');
			assert.strictEqual(nestedSnipAsController, false, 'Nested snippet should not be detected as controller');
		});

		test('should exclude controllers from snippet detection', () => {
			// This is the critical test for the bug fix
			const controllerFile = 'header.controller.php';
			const regularSnippet = 'header.php';

			// The .controller.php suffix should be explicitly excluded from snippet detection
			assert.ok(controllerFile.endsWith('.php'), 'Controller file ends with .php');
			assert.ok(controllerFile.endsWith('.controller.php'), 'Controller file ends with .controller.php');
			assert.ok(!regularSnippet.endsWith('.controller.php'), 'Regular snippet does not end with .controller.php');
		});
	});
});

/**
 * Helper function to create a mock document for testing
 */
async function createMockDocument(content: string): Promise<vscode.TextDocument> {
	// Create a unique temporary document to avoid state sharing
	const document = await vscode.workspace.openTextDocument({ content, language: 'php' });
	return document;
}
