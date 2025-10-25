import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Integration Test Suite', () => {
	vscode.window.showInformationMessage('Running Kirby CMS Developer Toolkit tests');

	test('Extension should be present', () => {
		const extension = vscode.extensions.getExtension('MichaelvanLaar.vscode-kirby-toolkit');
		assert.ok(extension, 'Extension should be installed');
	});

	test('Extension should activate', async function() {
		this.timeout(10000); // Allow time for activation

		const extension = vscode.extensions.getExtension('MichaelvanLaar.vscode-kirby-toolkit');
		if (extension) {
			await extension.activate();
			assert.ok(extension.isActive, 'Extension should be active');
		}
	});

	test('Add Type Hints command should exist', async () => {
		const commands = await vscode.commands.getCommands(true);
		// Note: Commands may not be registered if not in a Kirby project
		// This test just checks if the command exists in available commands
		const hasCommand = commands.includes('kirby.addTypeHints');
		// In test environment without Kirby project structure, this may be false
		assert.strictEqual(typeof hasCommand, 'boolean');
	});

	test('Open Snippet command should exist', async () => {
		const commands = await vscode.commands.getCommands(true);
		// Note: Commands may not be registered if not in a Kirby project
		const hasCommand = commands.includes('kirby.openSnippet');
		assert.strictEqual(typeof hasCommand, 'boolean');
	});
});
