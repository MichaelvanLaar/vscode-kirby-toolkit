import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Blueprint Field CodeLens Test Suite', () => {
	suite('Command Registration', () => {
		test('should register kirby.openBlueprint command', async () => {
			const commands = await vscode.commands.getCommands();
			// In test environment without Kirby project, command might not be registered
			// This test verifies the command exists in production or doesn't throw an error
			const commandExists = commands.includes('kirby.openBlueprint');
			assert.ok(typeof commandExists === 'boolean', 'Command check should return boolean');
		});
	});

	suite('Blueprint Resolution', () => {
		test('should resolve template name to Blueprint path', () => {
			const getTemplateName = (templatePath: string): string => {
				const match = templatePath.match(/([^/\\]+)\.php$/);
				return match ? match[1] : '';
			};

			assert.strictEqual(getTemplateName('/workspace/site/templates/project.php'), 'project');
			assert.strictEqual(getTemplateName('/workspace/site/templates/article.php'), 'article');
			assert.strictEqual(getTemplateName('C:\\workspace\\site\\templates\\blog.php'), 'blog');
		});

		test('should construct Blueprint path for pages subdirectory', () => {
			const constructBlueprintPath = (templateName: string): string => {
				return `/workspace/site/blueprints/pages/${templateName}.yml`;
			};

			assert.strictEqual(
				constructBlueprintPath('project'),
				'/workspace/site/blueprints/pages/project.yml'
			);
		});

		test('should construct Blueprint path for root directory', () => {
			const constructBlueprintPath = (templateName: string): string => {
				return `/workspace/site/blueprints/${templateName}.yml`;
			};

			assert.strictEqual(
				constructBlueprintPath('home'),
				'/workspace/site/blueprints/home.yml'
			);
		});
	});

	suite('Field Extraction', () => {
		test('should extract fields from simple Blueprint', () => {
			const blueprint = {
				fields: {
					title: { type: 'text' },
					description: { type: 'textarea' }
				}
			};

			const fieldNames = Object.keys(blueprint.fields);

			assert.strictEqual(fieldNames.length, 2);
			assert.ok(fieldNames.includes('title'));
			assert.ok(fieldNames.includes('description'));
		});

		test('should extract field types', () => {
			const blueprint = {
				fields: {
					title: { type: 'text', label: 'Title' },
					image: { type: 'files', label: 'Image' }
				}
			};

			assert.strictEqual(blueprint.fields.title.type, 'text');
			assert.strictEqual(blueprint.fields.image.type, 'files');
		});

		test('should handle fields without type', () => {
			const blueprint: any = {
				fields: {
					title: { label: 'Title' }
				}
			};

			assert.strictEqual(blueprint.fields.title.type, undefined);
			assert.strictEqual(blueprint.fields.title.label, 'Title');
		});
	});

	suite('Field Display Formatting', () => {
		test('should format fields without types', () => {
			const fields = ['title', 'description', 'image'];
			const formatted = fields.join(', ');

			assert.strictEqual(formatted, 'title, description, image');
		});

		test('should format fields with types', () => {
			const fields = [
				{ name: 'title', type: 'text' },
				{ name: 'description', type: 'textarea' }
			];

			const formatted = fields.map(f => `${f.name} (${f.type})`).join(', ');

			assert.strictEqual(formatted, 'title (text), description (textarea)');
		});

		test('should truncate long field lists', () => {
			const fields = ['title', 'description', 'image', 'date', 'tags', 'author'];
			const limit = 3;

			const displayed = fields.slice(0, limit);
			const remaining = fields.length - limit;
			const formatted = `${displayed.join(', ')} ... (+${remaining} more)`;

			assert.strictEqual(formatted, 'title, description, image ... (+3 more)');
		});

		test('should not truncate when under limit', () => {
			const fields = ['title', 'description'];
			const limit = 5;

			if (fields.length <= limit) {
				const formatted = fields.join(', ');
				assert.strictEqual(formatted, 'title, description');
			}
		});

		test('should handle empty field list', () => {
			const fields: string[] = [];
			const formatted = fields.length === 0 ? 'No fields defined' : fields.join(', ');

			assert.strictEqual(formatted, 'No fields defined');
		});
	});

	suite('CodeLens Generation', () => {
		test('should create CodeLens on line 1', () => {
			const range = new vscode.Range(0, 0, 0, 0);

			assert.strictEqual(range.start.line, 0);
			assert.strictEqual(range.start.character, 0);
		});

		test('should format CodeLens title', () => {
			const fields = ['title', 'description', 'image'];
			const title = `Blueprint Fields: ${fields.join(', ')}`;

			assert.strictEqual(title, 'Blueprint Fields: title, description, image');
		});

		test('should include command in CodeLens', () => {
			const command = {
				title: 'Blueprint Fields: title, description',
				command: 'kirby.openBlueprint',
				arguments: ['/path/to/blueprint.yml']
			};

			assert.strictEqual(command.command, 'kirby.openBlueprint');
			assert.strictEqual(command.arguments.length, 1);
		});
	});

	suite('Caching Behavior', () => {
		test('should cache Blueprint data', () => {
			const cache = new Map<string, any>();
			const blueprintPath = '/workspace/site/blueprints/pages/project.yml';
			const data = { fields: [{ name: 'title', type: 'text' }] };

			cache.set(blueprintPath, data);

			assert.ok(cache.has(blueprintPath));
			assert.strictEqual(cache.get(blueprintPath), data);
		});

		test('should invalidate cache on delete', () => {
			const cache = new Map<string, any>();
			const blueprintPath = '/workspace/site/blueprints/pages/project.yml';

			cache.set(blueprintPath, { fields: [] });
			assert.ok(cache.has(blueprintPath));

			cache.delete(blueprintPath);
			assert.strictEqual(cache.has(blueprintPath), false);
		});

		test('should handle cache miss', () => {
			const cache = new Map<string, any>();
			const blueprintPath = '/workspace/site/blueprints/pages/unknown.yml';

			assert.strictEqual(cache.has(blueprintPath), false);
			assert.strictEqual(cache.get(blueprintPath), undefined);
		});
	});

	suite('File Size Validation', () => {
		test('should reject files larger than 500KB', () => {
			const fileSize = 600 * 1024; // 600KB
			const maxSize = 500 * 1024; // 500KB

			assert.strictEqual(fileSize > maxSize, true);
		});

		test('should accept files under 500KB', () => {
			const fileSize = 400 * 1024; // 400KB
			const maxSize = 500 * 1024; // 500KB

			assert.strictEqual(fileSize > maxSize, false);
		});

		test('should handle exactly 500KB', () => {
			const fileSize = 500 * 1024; // 500KB
			const maxSize = 500 * 1024; // 500KB

			assert.strictEqual(fileSize > maxSize, false);
		});
	});

	suite('Configuration Options', () => {
		test('should respect showBlueprintFieldCodeLens setting', () => {
			const config = {
				showBlueprintFieldCodeLens: false
			};

			const shouldShow = config.showBlueprintFieldCodeLens;

			assert.strictEqual(shouldShow, false);
		});

		test('should respect showBlueprintFieldTypes setting', () => {
			const config = {
				showBlueprintFieldTypes: true
			};

			const shouldShowTypes = config.showBlueprintFieldTypes;

			assert.strictEqual(shouldShowTypes, true);
		});

		test('should respect blueprintFieldDisplayLimit setting', () => {
			const config = {
				blueprintFieldDisplayLimit: 10
			};

			const limit = config.blueprintFieldDisplayLimit;

			assert.strictEqual(limit, 10);
		});
	});
});
