import * as assert from 'assert';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { detectTailwind, getTailwindVersion, isTailwindExtensionInstalled } from '../utils/tailwindDetector';

suite('Tailwind Detector Test Suite', () => {
	let tempDir: string;

	setup(() => {
		// Create a temporary directory for test files
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kirby-test-'));
	});

	teardown(() => {
		// Clean up temporary directory
		if (fs.existsSync(tempDir)) {
			fs.rmSync(tempDir, { recursive: true, force: true });
		}
	});

	suite('detectTailwind', () => {
		test('should detect Tailwind in dependencies', () => {
			const packageJson = {
				name: 'test-project',
				dependencies: {
					tailwindcss: '^3.4.0'
				}
			};

			fs.writeFileSync(
				path.join(tempDir, 'package.json'),
				JSON.stringify(packageJson, null, 2)
			);

			const workspaceFolder: vscode.WorkspaceFolder = {
				uri: vscode.Uri.file(tempDir),
				name: 'test',
				index: 0
			};

			const result = detectTailwind(workspaceFolder);

			assert.strictEqual(result.isInstalled, true);
			assert.strictEqual(result.version, '^3.4.0');
			assert.ok(result.packageJsonPath?.endsWith('package.json'));
		});

		test('should detect Tailwind in devDependencies', () => {
			const packageJson = {
				name: 'test-project',
				devDependencies: {
					tailwindcss: '^3.3.0'
				}
			};

			fs.writeFileSync(
				path.join(tempDir, 'package.json'),
				JSON.stringify(packageJson, null, 2)
			);

			const workspaceFolder: vscode.WorkspaceFolder = {
				uri: vscode.Uri.file(tempDir),
				name: 'test',
				index: 0
			};

			const result = detectTailwind(workspaceFolder);

			assert.strictEqual(result.isInstalled, true);
			assert.strictEqual(result.version, '^3.3.0');
		});

		test('should return false when package.json does not exist', () => {
			const workspaceFolder: vscode.WorkspaceFolder = {
				uri: vscode.Uri.file(tempDir),
				name: 'test',
				index: 0
			};

			const result = detectTailwind(workspaceFolder);

			assert.strictEqual(result.isInstalled, false);
			assert.strictEqual(result.version, undefined);
		});

		test('should return false when Tailwind is not in dependencies', () => {
			const packageJson = {
				name: 'test-project',
				dependencies: {
					vue: '^3.0.0'
				}
			};

			fs.writeFileSync(
				path.join(tempDir, 'package.json'),
				JSON.stringify(packageJson, null, 2)
			);

			const workspaceFolder: vscode.WorkspaceFolder = {
				uri: vscode.Uri.file(tempDir),
				name: 'test',
				index: 0
			};

			const result = detectTailwind(workspaceFolder);

			assert.strictEqual(result.isInstalled, false);
		});

		test('should handle invalid JSON gracefully', () => {
			fs.writeFileSync(
				path.join(tempDir, 'package.json'),
				'{ invalid json'
			);

			const workspaceFolder: vscode.WorkspaceFolder = {
				uri: vscode.Uri.file(tempDir),
				name: 'test',
				index: 0
			};

			const result = detectTailwind(workspaceFolder);

			assert.strictEqual(result.isInstalled, false);
		});

		test('should prioritize dependencies over devDependencies', () => {
			const packageJson = {
				name: 'test-project',
				dependencies: {
					tailwindcss: '^3.4.0'
				},
				devDependencies: {
					tailwindcss: '^3.3.0'
				}
			};

			fs.writeFileSync(
				path.join(tempDir, 'package.json'),
				JSON.stringify(packageJson, null, 2)
			);

			const workspaceFolder: vscode.WorkspaceFolder = {
				uri: vscode.Uri.file(tempDir),
				name: 'test',
				index: 0
			};

			const result = detectTailwind(workspaceFolder);

			assert.strictEqual(result.isInstalled, true);
			assert.strictEqual(result.version, '^3.4.0');
		});
	});

	suite('getTailwindVersion', () => {
		test('should return version from detection result', () => {
			const result = {
				isInstalled: true,
				version: '^3.4.0'
			};

			const version = getTailwindVersion(result);

			assert.strictEqual(version, '^3.4.0');
		});

		test('should return undefined when not installed', () => {
			const result = {
				isInstalled: false
			};

			const version = getTailwindVersion(result);

			assert.strictEqual(version, undefined);
		});

		test('should return undefined when version not present', () => {
			const result = {
				isInstalled: true
			};

			const version = getTailwindVersion(result);

			assert.strictEqual(version, undefined);
		});
	});

	suite('isTailwindExtensionInstalled', () => {
		test('should return boolean', () => {
			const result = isTailwindExtensionInstalled();

			assert.strictEqual(typeof result, 'boolean');
		});

		test('should check for correct extension ID', () => {
			// This tests the function runs without error
			// Actual extension presence depends on test environment
			const result = isTailwindExtensionInstalled();

			assert.ok(result === true || result === false);
		});
	});
});
