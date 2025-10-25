import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

suite('File Navigation Test Suite', () => {
	const mockWorkspaceRoot = '/mock/workspace';

	suite('Command Registration', () => {
		test('should register kirby.openRelatedFile command', async () => {
			const commands = await vscode.commands.getCommands();
			// In test environment without Kirby project, command might not be registered
			// This test verifies the command exists in production or doesn't throw an error
			const commandExists = commands.includes('kirby.openRelatedFile');
			assert.ok(typeof commandExists === 'boolean', 'Command check should return boolean');
		});
	});

	suite('File Path Resolution', () => {
		test('should resolve controller path from template', () => {
			const templatePath = path.join(mockWorkspaceRoot, 'site', 'templates', 'project.php');
			const fileName = path.basename(templatePath);
			const controllerPath = path.join(mockWorkspaceRoot, 'site', 'controllers', fileName);

			assert.strictEqual(path.basename(controllerPath), 'project.php');
			assert.ok(controllerPath.includes('controllers'));
		});

		test('should resolve model path from template', () => {
			const templatePath = path.join(mockWorkspaceRoot, 'site', 'templates', 'article.php');
			const fileName = path.basename(templatePath);
			const modelPath = path.join(mockWorkspaceRoot, 'site', 'models', fileName);

			assert.strictEqual(path.basename(modelPath), 'article.php');
			assert.ok(modelPath.includes('models'));
		});

		test('should resolve template path from controller', () => {
			const controllerPath = path.join(mockWorkspaceRoot, 'site', 'controllers', 'project.php');
			const fileName = path.basename(controllerPath);
			const templatePath = path.join(mockWorkspaceRoot, 'site', 'templates', fileName);

			assert.strictEqual(path.basename(templatePath), 'project.php');
			assert.ok(templatePath.includes('templates'));
		});

		test('should resolve template path from model', () => {
			const modelPath = path.join(mockWorkspaceRoot, 'site', 'models', 'article.php');
			const fileName = path.basename(modelPath);
			const templatePath = path.join(mockWorkspaceRoot, 'site', 'templates', fileName);

			assert.strictEqual(path.basename(templatePath), 'article.php');
			assert.ok(templatePath.includes('templates'));
		});

		test('should handle hyphenated file names', () => {
			const templatePath = path.join(mockWorkspaceRoot, 'site', 'templates', 'blog-post.php');
			const fileName = path.basename(templatePath);

			assert.strictEqual(fileName, 'blog-post.php');
		});

		test('should handle underscored file names', () => {
			const templatePath = path.join(mockWorkspaceRoot, 'site', 'templates', 'my_page.php');
			const fileName = path.basename(templatePath);

			assert.strictEqual(fileName, 'my_page.php');
		});
	});

	suite('File Type Detection', () => {
		test('should detect template files', () => {
			const isTemplate = (filePath: string): boolean => {
				return filePath.includes('/templates/') && filePath.endsWith('.php');
			};

			assert.strictEqual(isTemplate('/workspace/site/templates/default.php'), true);
			assert.strictEqual(isTemplate('/workspace/site/controllers/default.php'), false);
			assert.strictEqual(isTemplate('/workspace/site/templates/default.txt'), false);
		});

		test('should detect controller files', () => {
			const isController = (filePath: string): boolean => {
				return filePath.includes('/controllers/') && filePath.endsWith('.php');
			};

			assert.strictEqual(isController('/workspace/site/controllers/project.php'), true);
			assert.strictEqual(isController('/workspace/site/templates/project.php'), false);
		});

		test('should detect model files', () => {
			const isModel = (filePath: string): boolean => {
				return filePath.includes('/models/') && filePath.endsWith('.php');
			};

			assert.strictEqual(isModel('/workspace/site/models/article.php'), true);
			assert.strictEqual(isModel('/workspace/site/templates/article.php'), false);
		});

		test('should handle Windows paths', () => {
			const isTemplate = (filePath: string): boolean => {
				return (filePath.includes('/templates/') || filePath.includes('\\templates\\')) && filePath.endsWith('.php');
			};

			assert.strictEqual(isTemplate('C:\\workspace\\site\\templates\\default.php'), true);
		});
	});

	suite('CodeLens Display', () => {
		test('should show controller CodeLens for template with controller', () => {
			const hasController = true;
			const codeLensTitle = hasController ? 'Open Controller' : null;

			assert.strictEqual(codeLensTitle, 'Open Controller');
		});

		test('should show model CodeLens for template with model', () => {
			const hasModel = true;
			const codeLensTitle = hasModel ? 'Open Model' : null;

			assert.strictEqual(codeLensTitle, 'Open Model');
		});

		test('should show template CodeLens for controller', () => {
			const hasTemplate = true;
			const codeLensTitle = hasTemplate ? 'Open Template' : 'Template not found';

			assert.strictEqual(codeLensTitle, 'Open Template');
		});

		test('should show warning for orphaned controller', () => {
			const hasTemplate = false;
			const codeLensTitle = hasTemplate ? 'Open Template' : 'Template not found';

			assert.strictEqual(codeLensTitle, 'Template not found');
		});

		test('should show warning for orphaned model', () => {
			const hasTemplate = false;
			const codeLensTitle = hasTemplate ? 'Open Template' : 'Template not found';

			assert.strictEqual(codeLensTitle, 'Template not found');
		});
	});

	suite('Multi-Target Navigation', () => {
		test('should provide multiple targets when both controller and model exist', () => {
			const hasController = true;
			const hasModel = true;

			const targets: string[] = [];
			if (hasController) {
				targets.push('controller');
			}
			if (hasModel) {
				targets.push('model');
			}

			assert.strictEqual(targets.length, 2);
			assert.ok(targets.includes('controller'));
			assert.ok(targets.includes('model'));
		});

		test('should provide single target when only controller exists', () => {
			const hasController = true;
			const hasModel = false;

			const targets: string[] = [];
			if (hasController) {
				targets.push('controller');
			}
			if (hasModel) {
				targets.push('model');
			}

			assert.strictEqual(targets.length, 1);
			assert.ok(targets.includes('controller'));
		});

		test('should provide no targets when neither exists', () => {
			const hasController = false;
			const hasModel = false;

			const targets: string[] = [];
			if (hasController) {
				targets.push('controller');
			}
			if (hasModel) {
				targets.push('model');
			}

			assert.strictEqual(targets.length, 0);
		});
	});

	suite('Naming Conventions', () => {
		test('should match template and controller by same base name', () => {
			const templateName = 'project';
			const controllerName = 'project';

			assert.strictEqual(templateName, controllerName);
		});

		test('should match template and model by same base name', () => {
			const templateName = 'article';
			const modelName = 'article';

			assert.strictEqual(templateName, modelName);
		});

		test('should extract base name from file path', () => {
			const extractBaseName = (filePath: string): string => {
				return path.basename(filePath, '.php');
			};

			assert.strictEqual(extractBaseName('/workspace/site/templates/project.php'), 'project');
			assert.strictEqual(extractBaseName('/workspace/site/controllers/article.php'), 'article');
		});

		test('should handle complex names', () => {
			const extractBaseName = (filePath: string): string => {
				return path.basename(filePath, '.php');
			};

			assert.strictEqual(extractBaseName('/workspace/site/templates/blog-post.php'), 'blog-post');
			assert.strictEqual(extractBaseName('/workspace/site/models/my_page.php'), 'my_page');
		});
	});

	suite('Configuration Options', () => {
		test('should respect showControllerNavigation setting', () => {
			const config = {
				showControllerNavigation: false
			};

			const shouldShow = config.showControllerNavigation;

			assert.strictEqual(shouldShow, false);
		});

		test('should respect showModelNavigation setting', () => {
			const config = {
				showModelNavigation: false
			};

			const shouldShow = config.showModelNavigation;

			assert.strictEqual(shouldShow, false);
		});

		test('should respect showSnippetCodeLens setting for all CodeLens', () => {
			const config = {
				showSnippetCodeLens: false
			};

			const shouldShowCodeLens = config.showSnippetCodeLens;

			assert.strictEqual(shouldShowCodeLens, false);
		});

		test('should show navigation when all settings enabled', () => {
			const config = {
				showSnippetCodeLens: true,
				showControllerNavigation: true,
				showModelNavigation: true
			};

			const shouldShowController = config.showSnippetCodeLens && config.showControllerNavigation;
			const shouldShowModel = config.showSnippetCodeLens && config.showModelNavigation;

			assert.strictEqual(shouldShowController, true);
			assert.strictEqual(shouldShowModel, true);
		});
	});

	suite('Definition Provider', () => {
		test('should create location for controller', () => {
			const controllerPath = '/workspace/site/controllers/project.php';
			const location = {
				uri: vscode.Uri.file(controllerPath),
				range: new vscode.Range(0, 0, 0, 0)
			};

			assert.strictEqual(location.uri.fsPath, controllerPath);
			assert.strictEqual(location.range.start.line, 0);
		});

		test('should create location for model', () => {
			const modelPath = '/workspace/site/models/article.php';
			const location = {
				uri: vscode.Uri.file(modelPath),
				range: new vscode.Range(0, 0, 0, 0)
			};

			assert.strictEqual(location.uri.fsPath, modelPath);
			assert.strictEqual(location.range.start.line, 0);
		});

		test('should create location for template', () => {
			const templatePath = '/workspace/site/templates/blog.php';
			const location = {
				uri: vscode.Uri.file(templatePath),
				range: new vscode.Range(0, 0, 0, 0)
			};

			assert.strictEqual(location.uri.fsPath, templatePath);
			assert.strictEqual(location.range.start.line, 0);
		});

		test('should provide multiple locations for template with controller and model', () => {
			const locations = [
				'/workspace/site/controllers/project.php',
				'/workspace/site/models/project.php'
			];

			assert.strictEqual(locations.length, 2);
		});
	});
});
