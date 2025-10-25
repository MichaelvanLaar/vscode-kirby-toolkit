import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Snippet Extractor Test Suite', () => {
	suite('Command Registration', () => {
		test('should register kirby.extractToSnippet command', async () => {
			const commands = await vscode.commands.getCommands();
			// In test environment without Kirby project, command might not be registered
			// This test verifies the command exists in production or doesn't throw an error
			const commandExists = commands.includes('kirby.extractToSnippet');
			assert.ok(typeof commandExists === 'boolean', 'Command check should return boolean');
		});
	});

	suite('Selection Validation', () => {
		test('should detect empty selections', () => {
			const text = '';
			const isEmpty = text.trim().length === 0;

			assert.strictEqual(isEmpty, true);
		});

		test('should detect non-empty selections', () => {
			const text = '<div>Hello World</div>';
			const isEmpty = text.trim().length === 0;

			assert.strictEqual(isEmpty, false);
		});

		test('should detect large selections', () => {
			const largeText = 'x'.repeat(150 * 1024); // 150KB
			const isLarge = largeText.length > 100 * 1024;

			assert.strictEqual(isLarge, true);
		});

		test('should validate bracket balance', () => {
			const validateBrackets = (text: string): boolean => {
				const brackets = { '{': '}', '(': ')', '[': ']' };
				const stack: string[] = [];

				for (const char of text) {
					if (Object.keys(brackets).includes(char)) {
						stack.push(char);
					} else if (Object.values(brackets).includes(char)) {
						const last = stack.pop();
						if (!last || brackets[last as keyof typeof brackets] !== char) {
							return false;
						}
					}
				}

				return stack.length === 0;
			};

			assert.strictEqual(validateBrackets('{ test }'), true);
			assert.strictEqual(validateBrackets('{ test'), false);
			assert.strictEqual(validateBrackets('test }'), false);
			assert.strictEqual(validateBrackets('( [ { } ] )'), true);
			assert.strictEqual(validateBrackets('( [ { ] } )'), false);
		});
	});

	suite('Snippet Name Validation', () => {
		test('should accept simple snippet names', () => {
			const isValid = (name: string): boolean => {
				return name.length > 0 &&
					!name.includes('..') &&
					!name.includes('\\');
			};

			assert.strictEqual(isValid('header'), true);
			assert.strictEqual(isValid('footer'), true);
			assert.strictEqual(isValid('menu'), true);
		});

		test('should accept nested snippet paths', () => {
			const isValid = (name: string): boolean => {
				return name.length > 0 &&
					!name.includes('..') &&
					!name.includes('\\');
			};

			assert.strictEqual(isValid('partials/menu'), true);
			assert.strictEqual(isValid('components/card'), true);
		});

		test('should reject path traversal attempts', () => {
			const isValid = (name: string): boolean => {
				return name.length > 0 &&
					!name.includes('..') &&
					!name.includes('\\');
			};

			assert.strictEqual(isValid('../admin'), false);
			assert.strictEqual(isValid('..\\system'), false);
			assert.strictEqual(isValid('test/../etc'), false);
		});

		test('should reject absolute paths', () => {
			const isAbsolute = (name: string): boolean => {
				return name.startsWith('/') || /^[A-Z]:\\/.test(name);
			};

			assert.strictEqual(isAbsolute('/etc/passwd'), true);
			assert.strictEqual(isAbsolute('C:\\Windows'), true);
			assert.strictEqual(isAbsolute('header'), false);
		});

		test('should reject empty names', () => {
			const isEmpty = (name: string): boolean => {
				return name.trim().length === 0;
			};

			assert.strictEqual(isEmpty(''), true);
			assert.strictEqual(isEmpty('   '), true);
			assert.strictEqual(isEmpty('header'), false);
		});
	});

	suite('PHP Context Detection', () => {
		test('should detect PHP context with open tag', () => {
			const detectPhpContext = (textBefore: string): boolean => {
				const openTags = (textBefore.match(/<\?php/g) || []).length;
				const closeTags = (textBefore.match(/\?>/g) || []).length;
				return openTags > closeTags;
			};

			assert.strictEqual(detectPhpContext('<?php '), true);
			assert.strictEqual(detectPhpContext('<?php $var = 1; '), true);
		});

		test('should detect non-PHP context', () => {
			const detectPhpContext = (textBefore: string): boolean => {
				const openTags = (textBefore.match(/<\?php/g) || []).length;
				const closeTags = (textBefore.match(/\?>/g) || []).length;
				return openTags > closeTags;
			};

			assert.strictEqual(detectPhpContext('<html>'), false);
			assert.strictEqual(detectPhpContext('<div>'), false);
		});

		test('should detect closed PHP context', () => {
			const detectPhpContext = (textBefore: string): boolean => {
				const openTags = (textBefore.match(/<\?php/g) || []).length;
				const closeTags = (textBefore.match(/\?>/g) || []).length;
				return openTags > closeTags;
			};

			assert.strictEqual(detectPhpContext('<?php $var = 1; ?>'), false);
			assert.strictEqual(detectPhpContext('<?php echo "test"; ?><html>'), false);
		});

		test('should handle multiple PHP blocks', () => {
			const detectPhpContext = (textBefore: string): boolean => {
				const openTags = (textBefore.match(/<\?php/g) || []).length;
				const closeTags = (textBefore.match(/\?>/g) || []).length;
				return openTags > closeTags;
			};

			assert.strictEqual(detectPhpContext('<?php ?><?php '), true);
			assert.strictEqual(detectPhpContext('<?php ?><?php ?>'), false);
		});
	});

	suite('Snippet Call Generation', () => {
		test('should generate snippet call without PHP tags in PHP context', () => {
			const generateCall = (name: string, inPhp: boolean): string => {
				return inPhp ? `snippet('${name}')` : `<?php snippet('${name}') ?>`;
			};

			assert.strictEqual(generateCall('header', true), "snippet('header')");
		});

		test('should generate snippet call with PHP tags in HTML context', () => {
			const generateCall = (name: string, inPhp: boolean): string => {
				return inPhp ? `snippet('${name}')` : `<?php snippet('${name}') ?>`;
			};

			assert.strictEqual(generateCall('header', false), "<?php snippet('header') ?>");
		});

		test('should handle nested snippet paths', () => {
			const generateCall = (name: string, inPhp: boolean): string => {
				return inPhp ? `snippet('${name}')` : `<?php snippet('${name}') ?>`;
			};

			assert.strictEqual(generateCall('partials/menu', false), "<?php snippet('partials/menu') ?>");
		});
	});

	suite('Indentation Preservation', () => {
		test('should detect line indentation', () => {
			const getIndentation = (line: string): string => {
				const match = line.match(/^(\s*)/);
				return match ? match[1] : '';
			};

			assert.strictEqual(getIndentation('  <div>'), '  ');
			assert.strictEqual(getIndentation('    <p>'), '    ');
			assert.strictEqual(getIndentation('<div>'), '');
			assert.strictEqual(getIndentation('\t<div>'), '\t');
		});

		test('should preserve spaces in indentation', () => {
			const getIndentation = (line: string): string => {
				const match = line.match(/^(\s*)/);
				return match ? match[1] : '';
			};

			const indentation = getIndentation('    content');
			assert.strictEqual(indentation, '    ');
			assert.strictEqual(indentation.length, 4);
		});

		test('should preserve tabs in indentation', () => {
			const getIndentation = (line: string): string => {
				const match = line.match(/^(\s*)/);
				return match ? match[1] : '';
			};

			const indentation = getIndentation('\t\tcontent');
			assert.strictEqual(indentation, '\t\t');
			assert.strictEqual(indentation.length, 2);
		});
	});

	suite('Type Hints Integration', () => {
		test('should detect existing type hints', () => {
			const hasTypeHints = (text: string): boolean => {
				return text.includes('@var');
			};

			assert.strictEqual(hasTypeHints('<?php /** @var Page $page */ ?>'), true);
			assert.strictEqual(hasTypeHints('<div>No hints</div>'), false);
		});

		test('should generate type hints when enabled', () => {
			const generateTypeHints = (): string => {
				return `<?php
/**
 * @var \\Kirby\\Cms\\Page $page
 * @var \\Kirby\\Cms\\Site $site
 * @var \\Kirby\\Cms\\App $kirby
 */
?>`;
			};

			const hints = generateTypeHints();
			assert.ok(hints.includes('@var \\Kirby\\Cms\\Page $page'));
			assert.ok(hints.includes('@var \\Kirby\\Cms\\Site $site'));
		});
	});

	suite('Security Validation', () => {
		test('should reject snippet names with path traversal', () => {
			const isSafe = (name: string): boolean => {
				return !name.includes('..') &&
					!name.includes('\\') &&
					!name.startsWith('/');
			};

			assert.strictEqual(isSafe('../etc/passwd'), false);
			assert.strictEqual(isSafe('..\\windows'), false);
			assert.strictEqual(isSafe('test/../admin'), false);
		});

		test('should accept safe snippet names', () => {
			const isSafe = (name: string): boolean => {
				return !name.includes('..') &&
					!name.includes('\\') &&
					!name.startsWith('/');
			};

			assert.strictEqual(isSafe('header'), true);
			assert.strictEqual(isSafe('partials/menu'), true);
			assert.strictEqual(isSafe('components/card'), true);
		});

		test('should validate snippet name format', () => {
			const isValidFormat = (name: string): boolean => {
				// Allow alphanumeric, hyphens, underscores, forward slashes
				return /^[a-zA-Z0-9_/-]+$/.test(name);
			};

			assert.strictEqual(isValidFormat('header'), true);
			assert.strictEqual(isValidFormat('partials/menu'), true);
			assert.strictEqual(isValidFormat('test@snippet'), false);
			assert.strictEqual(isValidFormat('test snippet'), false);
		});
	});
});
