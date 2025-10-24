import * as assert from 'assert';
import * as vscode from 'vscode';
import { generateTypeHintBlock, hasTypeHints } from '../providers/typeHintProvider';

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
});

/**
 * Helper function to create a mock document for testing
 */
async function createMockDocument(content: string): Promise<vscode.TextDocument> {
	// Create a unique temporary document to avoid state sharing
	const document = await vscode.workspace.openTextDocument({ content, language: 'php' });
	return document;
}
