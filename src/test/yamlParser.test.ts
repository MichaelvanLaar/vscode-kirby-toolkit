import * as assert from 'assert';
import { parseBlueprint, extractFieldNames, formatFieldsForDisplay, BlueprintField } from '../utils/yamlParser';

suite('YAML Parser Test Suite', () => {
	suite('parseBlueprint', () => {
		test('should parse simple Blueprint with fields', () => {
			const yaml = `title: Project
fields:
  title:
    type: text
    label: Title
  description:
    type: textarea
    label: Description`;

			const result = parseBlueprint(yaml);

			assert.ok(result);
			assert.strictEqual(result.title, 'Project');
			assert.strictEqual(result.fields.length, 2);
			assert.strictEqual(result.fields[0].name, 'title');
			assert.strictEqual(result.fields[0].type, 'text');
			assert.strictEqual(result.fields[1].name, 'description');
			assert.strictEqual(result.fields[1].type, 'textarea');
		});

		test('should return null for invalid YAML', () => {
			const invalidYaml = 'this is not: valid: yaml:';
			const result = parseBlueprint(invalidYaml);

			assert.strictEqual(result, null);
		});

		test('should return null for empty string', () => {
			const result = parseBlueprint('');

			assert.strictEqual(result, null);
		});

		test('should handle Blueprint without title', () => {
			const yaml = `fields:
  title:
    type: text`;

			const result = parseBlueprint(yaml);

			assert.ok(result);
			assert.strictEqual(result.title, undefined);
			assert.strictEqual(result.fields.length, 1);
		});

		test('should handle Blueprint without fields', () => {
			const yaml = `title: Simple Page`;

			const result = parseBlueprint(yaml);

			assert.ok(result);
			assert.strictEqual(result.title, 'Simple Page');
			assert.strictEqual(result.fields.length, 0);
		});
	});

	suite('extractFieldNames', () => {
		test('should extract direct fields', () => {
			const obj = {
				fields: {
					title: { type: 'text' },
					description: { type: 'textarea' }
				}
			};

			const result = extractFieldNames(obj);

			assert.strictEqual(result.length, 2);
			assert.strictEqual(result[0].name, 'title');
			assert.strictEqual(result[0].type, 'text');
			assert.strictEqual(result[1].name, 'description');
			assert.strictEqual(result[1].type, 'textarea');
		});

		test('should extract fields from tabs structure', () => {
			const obj = {
				tabs: {
					content: {
						fields: {
							headline: { type: 'text' },
							body: { type: 'textarea' }
						}
					},
					meta: {
						fields: {
							author: { type: 'text' }
						}
					}
				}
			};

			const result = extractFieldNames(obj);

			assert.strictEqual(result.length, 3);
			assert.strictEqual(result[0].name, 'headline');
			assert.strictEqual(result[1].name, 'body');
			assert.strictEqual(result[2].name, 'author');
		});

		test('should extract fields from sections structure', () => {
			const obj = {
				sections: {
					main: {
						type: 'fields',
						fields: {
							title: { type: 'text' },
							text: { type: 'textarea' }
						}
					}
				}
			};

			const result = extractFieldNames(obj);

			assert.strictEqual(result.length, 2);
			assert.strictEqual(result[0].name, 'title');
			assert.strictEqual(result[1].name, 'text');
		});

		test('should extract fields from columns structure', () => {
			const obj = {
				columns: {
					left: {
						fields: {
							title: { type: 'text' }
						}
					},
					right: {
						fields: {
							image: { type: 'files' }
						}
					}
				}
			};

			const result = extractFieldNames(obj);

			assert.strictEqual(result.length, 2);
			assert.strictEqual(result[0].name, 'title');
			assert.strictEqual(result[1].name, 'image');
		});

		test('should handle nested tabs and sections', () => {
			const obj = {
				tabs: {
					content: {
						sections: {
							main: {
								fields: {
									title: { type: 'text' }
								}
							}
						}
					}
				}
			};

			const result = extractFieldNames(obj);

			assert.strictEqual(result.length, 1);
			assert.strictEqual(result[0].name, 'title');
		});

		test('should handle fields without type', () => {
			const obj = {
				fields: {
					title: { label: 'Title' }
				}
			};

			const result = extractFieldNames(obj);

			assert.strictEqual(result.length, 1);
			assert.strictEqual(result[0].name, 'title');
			assert.strictEqual(result[0].type, undefined);
		});

		test('should return empty array for null input', () => {
			const result = extractFieldNames(null);

			assert.strictEqual(result.length, 0);
		});

		test('should return empty array for non-object input', () => {
			const result = extractFieldNames('not an object');

			assert.strictEqual(result.length, 0);
		});
	});

	suite('formatFieldsForDisplay', () => {
		const fields: BlueprintField[] = [
			{ name: 'title', type: 'text' },
			{ name: 'description', type: 'textarea' },
			{ name: 'image', type: 'files' },
			{ name: 'date', type: 'date' },
			{ name: 'tags', type: 'tags' },
			{ name: 'author', type: 'users' }
		];

		test('should format fields without types', () => {
			const result = formatFieldsForDisplay(fields, false, 5);

			assert.strictEqual(result, 'title, description, image, date, tags ... (+1 more)');
		});

		test('should format fields with types', () => {
			const result = formatFieldsForDisplay(fields.slice(0, 3), true, 5);

			assert.strictEqual(result, 'title (text), description (textarea), image (files)');
		});

		test('should truncate fields exceeding limit', () => {
			const result = formatFieldsForDisplay(fields, false, 3);

			assert.strictEqual(result, 'title, description, image ... (+3 more)');
		});

		test('should not truncate when under limit', () => {
			const result = formatFieldsForDisplay(fields.slice(0, 2), false, 5);

			assert.strictEqual(result, 'title, description');
		});

		test('should handle empty field array', () => {
			const result = formatFieldsForDisplay([], false, 5);

			assert.strictEqual(result, 'No fields defined');
		});

		test('should handle fields without types when includeTypes is true', () => {
			const fieldsWithoutTypes: BlueprintField[] = [
				{ name: 'title' },
				{ name: 'description' }
			];

			const result = formatFieldsForDisplay(fieldsWithoutTypes, true, 5);

			assert.strictEqual(result, 'title, description');
		});

		test('should handle custom limit of 1', () => {
			const result = formatFieldsForDisplay(fields, false, 1);

			assert.strictEqual(result, 'title ... (+5 more)');
		});
	});
});
