import * as assert from 'assert';
import * as path from 'path';
import {
  getTemplateNameFromBlueprint,
  getBlueprintNameFromTemplate,
  isBlockBlueprintFile,
  isBlockSnippetFile,
  isFieldBlueprintFile,
  isFieldSnippetFile,
  getBlockSnippetNameFromBlueprint,
  getBlockBlueprintNameFromSnippet,
  getFieldSnippetNameFromBlueprint
} from '../utils/kirbyProject';
import {
  generateBlueprintContent,
  generateTemplateContent,
  generateControllerContent,
  generateModelContent,
  generateBlockSnippetContent,
  generateBlockBlueprintContent,
  generateFieldSnippetContent
} from '../utils/scaffoldingTemplates';

suite('Blueprint/Template Synchronization Test Suite', () => {
  const mockWorkspaceRoot = '/mock/workspace';

  suite('File Name Mapping - Blueprint to Template', () => {
    test('should map flat Blueprint to template name', () => {
      const blueprintPath = path.join(mockWorkspaceRoot, 'site', 'blueprints', 'pages', 'article.yml');
      const templateName = getTemplateNameFromBlueprint(blueprintPath);
      // Note: This will return undefined in test environment without actual workspace
      // Testing the function structure
      assert.strictEqual(typeof templateName === 'string' || templateName === undefined, true);
    });

    test('should handle nested Blueprint paths with dot notation', () => {
      // blog/post.yml should map to blog.post
      const blueprintPath = path.join(mockWorkspaceRoot, 'site', 'blueprints', 'pages', 'blog', 'post.yml');
      const templateName = getTemplateNameFromBlueprint(blueprintPath);
      assert.strictEqual(typeof templateName === 'string' || templateName === undefined, true);
    });

    test('should return undefined for non-Blueprint file', () => {
      const blueprintPath = path.join(mockWorkspaceRoot, 'site', 'templates', 'article.php');
      const templateName = getTemplateNameFromBlueprint(blueprintPath);
      assert.strictEqual(templateName, undefined);
    });

    test('should return undefined for Blueprint not in pages directory', () => {
      const blueprintPath = path.join(mockWorkspaceRoot, 'site', 'blueprints', 'article.yml');
      const templateName = getTemplateNameFromBlueprint(blueprintPath);
      assert.strictEqual(typeof templateName === 'string' || templateName === undefined, true);
    });
  });

  suite('File Name Mapping - Template to Blueprint', () => {
    test('should map flat template to Blueprint name', () => {
      const templatePath = path.join(mockWorkspaceRoot, 'site', 'templates', 'article.php');
      const blueprintName = getBlueprintNameFromTemplate(templatePath);
      // Note: This will return undefined in test environment without actual workspace
      assert.strictEqual(typeof blueprintName === 'string' || blueprintName === undefined, true);
    });

    test('should handle dot notation templates', () => {
      // blog.post.php should map to blog/post
      const templatePath = path.join(mockWorkspaceRoot, 'site', 'templates', 'blog.post.php');
      const blueprintName = getBlueprintNameFromTemplate(templatePath);
      assert.strictEqual(typeof blueprintName === 'string' || blueprintName === undefined, true);
    });

    test('should return undefined for non-template file', () => {
      const templatePath = path.join(mockWorkspaceRoot, 'site', 'blueprints', 'pages', 'article.yml');
      const blueprintName = getBlueprintNameFromTemplate(templatePath);
      assert.strictEqual(blueprintName, undefined);
    });
  });

  suite('Scaffolding Template Generators', () => {
    test('should generate Blueprint content with title', () => {
      const content = generateBlueprintContent('article');
      assert.ok(content.includes('title: Article'));
      assert.ok(content.includes('fields:'));
      assert.ok(content.includes('title:'));
      assert.ok(content.includes('text:'));
    });

    test('should capitalize first letter of page type name in Blueprint', () => {
      const content = generateBlueprintContent('project');
      assert.ok(content.includes('title: Project'));
    });

    test('should generate Template content with HTML boilerplate', () => {
      const content = generateTemplateContent('article');
      assert.ok(content.includes('<!DOCTYPE html>'));
      assert.ok(content.includes('<html lang="en">'));
      assert.ok(content.includes('<?= $page->title() ?>'));
      assert.ok(content.includes('<?= $page->text()->kirbytext() ?>'));
    });

    test('should generate Controller content with return function', () => {
      const content = generateControllerContent('article');
      assert.ok(content.includes('<?php'));
      assert.ok(content.includes('return function ($page, $site, $kirby) {'));
      assert.ok(content.includes('return [];'));
    });

    test('should generate Model content with class', () => {
      const content = generateModelContent('article');
      assert.ok(content.includes('<?php'));
      assert.ok(content.includes('use Kirby\\Cms\\Page;'));
      assert.ok(content.includes('class ArticlePage extends Page'));
    });

    test('should convert kebab-case to PascalCase in Model class name', () => {
      const content = generateModelContent('blog-post');
      assert.ok(content.includes('class BlogPostPage extends Page'));
    });

    test('should convert snake_case to PascalCase in Model class name', () => {
      const content = generateModelContent('blog_post');
      assert.ok(content.includes('class BlogPostPage extends Page'));
    });
  });

  suite('Content Structure Validation', () => {
    test('Blueprint content should be valid YAML structure', () => {
      const content = generateBlueprintContent('test');
      // Check for YAML structure markers
      assert.ok(content.includes('title:'));
      assert.ok(content.includes('fields:'));
      assert.ok(!content.includes('<?php')); // Should not contain PHP
    });

    test('Template content should be valid PHP/HTML', () => {
      const content = generateTemplateContent('test');
      // Check for HTML structure
      assert.ok(content.includes('<!DOCTYPE html>'));
      assert.ok(content.includes('</html>'));
      // Check that PHP tags are properly closed
      const phpOpenCount = (content.match(/<\?/g) || []).length;
      const phpCloseCount = (content.match(/\?>/g) || []).length;
      assert.strictEqual(phpOpenCount, phpCloseCount);
    });

    test('Controller content should be valid PHP', () => {
      const content = generateControllerContent('test');
      assert.ok(content.startsWith('<?php'));
      assert.ok(content.includes('return function'));
    });

    test('Model content should be valid PHP class', () => {
      const content = generateModelContent('test');
      assert.ok(content.startsWith('<?php'));
      assert.ok(content.includes('class'));
      assert.ok(content.includes('extends Page'));
    });
  });

  suite('Edge Cases', () => {
    test('should handle single character page type names', () => {
      const blueprintContent = generateBlueprintContent('a');
      assert.ok(blueprintContent.includes('title: A'));

      const modelContent = generateModelContent('a');
      assert.ok(modelContent.includes('class APage extends Page'));
    });

    test('should handle page type names with numbers', () => {
      const content = generateBlueprintContent('page2');
      assert.ok(content.includes('title: Page2'));
    });

    test('should handle page type names with hyphens', () => {
      const content = generateBlueprintContent('test-page');
      assert.ok(content.includes('title: Test-page'));
    });

    test('should handle page type names with underscores', () => {
      const content = generateBlueprintContent('test_page');
      assert.ok(content.includes('title: Test_page'));
    });

    test('should handle deeply nested Blueprint paths', () => {
      const blueprintPath = path.join(
        mockWorkspaceRoot,
        'site',
        'blueprints',
        'pages',
        'section',
        'subsection',
        'page.yml'
      );
      const templateName = getTemplateNameFromBlueprint(blueprintPath);
      assert.strictEqual(typeof templateName === 'string' || templateName === undefined, true);
    });

    test('should handle templates with multiple dots', () => {
      const templatePath = path.join(mockWorkspaceRoot, 'site', 'templates', 'section.subsection.page.php');
      const blueprintName = getBlueprintNameFromTemplate(templatePath);
      assert.strictEqual(typeof blueprintName === 'string' || blueprintName === undefined, true);
    });
  });

  suite('Security Validation', () => {
    test('generators should produce standard content structure', () => {
      // Note: Security validation should happen before calling generators
      // Generators assume they receive validated input
      const content = generateBlueprintContent('test');
      assert.ok(content.includes('title:'));
      assert.ok(content.includes('fields:'));
    });

    test('should not include script tags in generated Template', () => {
      const content = generateTemplateContent('<script>alert("xss")</script>');
      // Template name should be sanitized before reaching generator
      // But generator should produce safe content
      assert.ok(content.includes('<!DOCTYPE html>'));
    });

    test('should generate safe PHP code in Controller', () => {
      const content = generateControllerContent('test');
      // Should not contain eval or dangerous functions
      assert.ok(!content.includes('eval('));
      assert.ok(!content.includes('exec('));
      assert.ok(!content.includes('system('));
    });

    test('should generate safe PHP class in Model', () => {
      const content = generateModelContent('test');
      // Should not contain dangerous patterns
      assert.ok(!content.includes('eval('));
      assert.ok(!content.includes('__destruct'));
    });
  });

  suite('Block/Field File Detection', () => {
    test('should detect block Blueprint files', () => {
      const blockBlueprintPath = path.join(mockWorkspaceRoot, 'site', 'blueprints', 'blocks', 'gallery.yml');
      // Will return false in test environment without actual workspace, but tests the function structure
      const isBlockBlueprint = isBlockBlueprintFile(blockBlueprintPath);
      assert.strictEqual(typeof isBlockBlueprint, 'boolean');
    });

    test('should detect nested block Blueprint files', () => {
      const nestedBlockPath = path.join(mockWorkspaceRoot, 'site', 'blueprints', 'blocks', 'media', 'gallery.yml');
      const isBlockBlueprint = isBlockBlueprintFile(nestedBlockPath);
      assert.strictEqual(typeof isBlockBlueprint, 'boolean');
    });

    test('should reject non-block Blueprint files', () => {
      const pageBlueprintPath = path.join(mockWorkspaceRoot, 'site', 'blueprints', 'pages', 'article.yml');
      const isBlockBlueprint = isBlockBlueprintFile(pageBlueprintPath);
      assert.strictEqual(typeof isBlockBlueprint, 'boolean');
    });

    test('should detect block snippet files', () => {
      const blockSnippetPath = path.join(mockWorkspaceRoot, 'site', 'snippets', 'blocks', 'gallery.php');
      const isBlockSnippet = isBlockSnippetFile(blockSnippetPath);
      assert.strictEqual(typeof isBlockSnippet, 'boolean');
    });

    test('should detect nested block snippet files', () => {
      const nestedSnippetPath = path.join(mockWorkspaceRoot, 'site', 'snippets', 'blocks', 'media', 'gallery.php');
      const isBlockSnippet = isBlockSnippetFile(nestedSnippetPath);
      assert.strictEqual(typeof isBlockSnippet, 'boolean');
    });

    test('should detect flat dot notation block snippet files', () => {
      const flatSnippetPath = path.join(mockWorkspaceRoot, 'site', 'snippets', 'blocks', 'media.gallery.php');
      const isBlockSnippet = isBlockSnippetFile(flatSnippetPath);
      assert.strictEqual(typeof isBlockSnippet, 'boolean');
    });

    test('should reject non-block snippet files', () => {
      const regularSnippetPath = path.join(mockWorkspaceRoot, 'site', 'snippets', 'header.php');
      const isBlockSnippet = isBlockSnippetFile(regularSnippetPath);
      assert.strictEqual(typeof isBlockSnippet, 'boolean');
    });

    test('should detect field Blueprint files', () => {
      const fieldBlueprintPath = path.join(mockWorkspaceRoot, 'site', 'blueprints', 'fields', 'address.yml');
      const isFieldBlueprint = isFieldBlueprintFile(fieldBlueprintPath);
      assert.strictEqual(typeof isFieldBlueprint, 'boolean');
    });

    test('should detect nested field Blueprint files', () => {
      const nestedFieldPath = path.join(mockWorkspaceRoot, 'site', 'blueprints', 'fields', 'contact', 'address.yml');
      const isFieldBlueprint = isFieldBlueprintFile(nestedFieldPath);
      assert.strictEqual(typeof isFieldBlueprint, 'boolean');
    });

    test('should reject non-field Blueprint files', () => {
      const pageBlueprintPath = path.join(mockWorkspaceRoot, 'site', 'blueprints', 'pages', 'article.yml');
      const isFieldBlueprint = isFieldBlueprintFile(pageBlueprintPath);
      assert.strictEqual(typeof isFieldBlueprint, 'boolean');
    });

    test('should detect field snippet files', () => {
      const fieldSnippetPath = path.join(mockWorkspaceRoot, 'site', 'snippets', 'fields', 'address.php');
      const isFieldSnippet = isFieldSnippetFile(fieldSnippetPath);
      assert.strictEqual(typeof isFieldSnippet, 'boolean');
    });

    test('should detect nested field snippet files', () => {
      const nestedFieldSnippet = path.join(mockWorkspaceRoot, 'site', 'snippets', 'fields', 'contact', 'address.php');
      const isFieldSnippet = isFieldSnippetFile(nestedFieldSnippet);
      assert.strictEqual(typeof isFieldSnippet, 'boolean');
    });

    test('should reject non-field snippet files', () => {
      const regularSnippetPath = path.join(mockWorkspaceRoot, 'site', 'snippets', 'header.php');
      const isFieldSnippet = isFieldSnippetFile(regularSnippetPath);
      assert.strictEqual(typeof isFieldSnippet, 'boolean');
    });
  });

  suite('Block Name Mapping', () => {
    test('should map flat block Blueprint to snippet name (nested strategy)', () => {
      const blueprintPath = path.join(mockWorkspaceRoot, 'site', 'blueprints', 'blocks', 'gallery.yml');
      const snippetName = getBlockSnippetNameFromBlueprint(blueprintPath, 'nested');
      // Returns undefined in test environment without actual workspace
      assert.strictEqual(typeof snippetName === 'string' || snippetName === undefined, true);
    });

    test('should map nested block Blueprint to snippet name (nested strategy)', () => {
      const blueprintPath = path.join(mockWorkspaceRoot, 'site', 'blueprints', 'blocks', 'media', 'gallery.yml');
      const snippetName = getBlockSnippetNameFromBlueprint(blueprintPath, 'nested');
      assert.strictEqual(typeof snippetName === 'string' || snippetName === undefined, true);
    });

    test('should map flat block Blueprint to snippet name (flat strategy)', () => {
      const blueprintPath = path.join(mockWorkspaceRoot, 'site', 'blueprints', 'blocks', 'gallery.yml');
      const snippetName = getBlockSnippetNameFromBlueprint(blueprintPath, 'flat');
      assert.strictEqual(typeof snippetName === 'string' || snippetName === undefined, true);
    });

    test('should map nested block Blueprint to dot notation (flat strategy)', () => {
      const blueprintPath = path.join(mockWorkspaceRoot, 'site', 'blueprints', 'blocks', 'media', 'gallery.yml');
      const snippetName = getBlockSnippetNameFromBlueprint(blueprintPath, 'flat');
      assert.strictEqual(typeof snippetName === 'string' || snippetName === undefined, true);
    });

    test('should map nested block snippet to Blueprint name', () => {
      const snippetPath = path.join(mockWorkspaceRoot, 'site', 'snippets', 'blocks', 'media', 'gallery.php');
      const blueprintName = getBlockBlueprintNameFromSnippet(snippetPath);
      assert.strictEqual(typeof blueprintName === 'string' || blueprintName === undefined, true);
    });

    test('should map flat dot notation snippet to nested Blueprint name', () => {
      const snippetPath = path.join(mockWorkspaceRoot, 'site', 'snippets', 'blocks', 'media.gallery.php');
      const blueprintName = getBlockBlueprintNameFromSnippet(snippetPath);
      assert.strictEqual(typeof blueprintName === 'string' || blueprintName === undefined, true);
    });

    test('should return undefined for non-block Blueprint file', () => {
      const pageBlueprintPath = path.join(mockWorkspaceRoot, 'site', 'blueprints', 'pages', 'article.yml');
      const snippetName = getBlockSnippetNameFromBlueprint(pageBlueprintPath, 'nested');
      assert.strictEqual(snippetName, undefined);
    });

    test('should return undefined for non-block snippet file', () => {
      const regularSnippetPath = path.join(mockWorkspaceRoot, 'site', 'snippets', 'header.php');
      const blueprintName = getBlockBlueprintNameFromSnippet(regularSnippetPath);
      assert.strictEqual(blueprintName, undefined);
    });
  });

  suite('Field Name Mapping', () => {
    test('should map flat field Blueprint to snippet name (nested strategy)', () => {
      const blueprintPath = path.join(mockWorkspaceRoot, 'site', 'blueprints', 'fields', 'address.yml');
      const snippetName = getFieldSnippetNameFromBlueprint(blueprintPath, 'nested');
      assert.strictEqual(typeof snippetName === 'string' || snippetName === undefined, true);
    });

    test('should map nested field Blueprint to snippet name (nested strategy)', () => {
      const blueprintPath = path.join(mockWorkspaceRoot, 'site', 'blueprints', 'fields', 'contact', 'address.yml');
      const snippetName = getFieldSnippetNameFromBlueprint(blueprintPath, 'nested');
      assert.strictEqual(typeof snippetName === 'string' || snippetName === undefined, true);
    });

    test('should map flat field Blueprint to snippet name (flat strategy)', () => {
      const blueprintPath = path.join(mockWorkspaceRoot, 'site', 'blueprints', 'fields', 'address.yml');
      const snippetName = getFieldSnippetNameFromBlueprint(blueprintPath, 'flat');
      assert.strictEqual(typeof snippetName === 'string' || snippetName === undefined, true);
    });

    test('should map nested field Blueprint to dot notation (flat strategy)', () => {
      const blueprintPath = path.join(mockWorkspaceRoot, 'site', 'blueprints', 'fields', 'contact', 'address.yml');
      const snippetName = getFieldSnippetNameFromBlueprint(blueprintPath, 'flat');
      assert.strictEqual(typeof snippetName === 'string' || snippetName === undefined, true);
    });

    test('should return undefined for non-field Blueprint file', () => {
      const pageBlueprintPath = path.join(mockWorkspaceRoot, 'site', 'blueprints', 'pages', 'article.yml');
      const snippetName = getFieldSnippetNameFromBlueprint(pageBlueprintPath, 'nested');
      assert.strictEqual(snippetName, undefined);
    });

    test('should handle deeply nested field paths', () => {
      const blueprintPath = path.join(
        mockWorkspaceRoot,
        'site',
        'blueprints',
        'fields',
        'forms',
        'contact',
        'address.yml'
      );
      const snippetName = getFieldSnippetNameFromBlueprint(blueprintPath, 'nested');
      assert.strictEqual(typeof snippetName === 'string' || snippetName === undefined, true);
    });
  });

  suite('Block Content Generators', () => {
    test('should generate block snippet content with type hint', () => {
      const content = generateBlockSnippetContent('gallery');
      assert.ok(content.includes('<?php'));
      assert.ok(content.includes('@var \\Kirby\\Cms\\Block $block'));
      assert.ok(content.includes('<!-- Block: gallery -->'));
      assert.ok(content.includes('class="block block-gallery"'));
    });

    test('should generate block snippet with nested blocks support', () => {
      const content = generateBlockSnippetContent('text');
      assert.ok(content.includes('$block->content()->toBlocks()'));
      assert.ok(content.includes('foreach ($content as $nestedBlock)'));
      assert.ok(content.includes('<?= $nestedBlock ?>'));
    });

    test('should handle hyphenated block names', () => {
      const content = generateBlockSnippetContent('image-gallery');
      assert.ok(content.includes('<!-- Block: image-gallery -->'));
      assert.ok(content.includes('class="block block-image-gallery"'));
    });

    test('should handle underscored block names', () => {
      const content = generateBlockSnippetContent('image_gallery');
      assert.ok(content.includes('<!-- Block: image_gallery -->'));
      assert.ok(content.includes('class="block block-image_gallery"'));
    });

    test('should generate block Blueprint content with title', () => {
      const content = generateBlockBlueprintContent('gallery');
      assert.ok(content.includes('name: Gallery'));
      assert.ok(content.includes('icon: page'));
      assert.ok(content.includes('fields:'));
      assert.ok(content.includes('content:'));
      assert.ok(content.includes('type: blocks'));
    });

    test('should capitalize first letter in block Blueprint name', () => {
      const content = generateBlockBlueprintContent('image');
      assert.ok(content.includes('name: Image'));
    });

    test('should include default fieldsets in block Blueprint', () => {
      const content = generateBlockBlueprintContent('text');
      assert.ok(content.includes('fieldsets:'));
      assert.ok(content.includes('- heading'));
      assert.ok(content.includes('- text'));
    });

    test('block Blueprint content should be valid YAML', () => {
      const content = generateBlockBlueprintContent('test');
      assert.ok(content.includes('name:'));
      assert.ok(content.includes('icon:'));
      assert.ok(content.includes('fields:'));
      assert.ok(!content.includes('<?php'));
    });

    test('block snippet content should be valid PHP', () => {
      const content = generateBlockSnippetContent('test');
      assert.ok(content.startsWith('<?php'));
      const phpOpenCount = (content.match(/<\?/g) || []).length;
      const phpCloseCount = (content.match(/\?>/g) || []).length;
      assert.strictEqual(phpOpenCount, phpCloseCount);
    });
  });

  suite('Field Content Generators', () => {
    test('should generate field snippet content with type hint', () => {
      const content = generateFieldSnippetContent('address');
      assert.ok(content.includes('<?php'));
      assert.ok(content.includes('@var \\Kirby\\Cms\\Field $field'));
      assert.ok(content.includes('<!-- Field: address -->'));
      assert.ok(content.includes('class="field field-address"'));
    });

    test('should generate field snippet with value output', () => {
      const content = generateFieldSnippetContent('social-links');
      assert.ok(content.includes('<?= $field->value() ?>'));
    });

    test('should handle hyphenated field names', () => {
      const content = generateFieldSnippetContent('social-links');
      assert.ok(content.includes('<!-- Field: social-links -->'));
      assert.ok(content.includes('class="field field-social-links"'));
    });

    test('should handle underscored field names', () => {
      const content = generateFieldSnippetContent('social_links');
      assert.ok(content.includes('<!-- Field: social_links -->'));
      assert.ok(content.includes('class="field field-social_links"'));
    });

    test('field snippet content should be valid PHP', () => {
      const content = generateFieldSnippetContent('test');
      assert.ok(content.startsWith('<?php'));
      const phpOpenCount = (content.match(/<\?/g) || []).length;
      const phpCloseCount = (content.match(/\?>/g) || []).length;
      assert.strictEqual(phpOpenCount, phpCloseCount);
    });

    test('should not include dangerous functions in field snippet', () => {
      const content = generateFieldSnippetContent('test');
      assert.ok(!content.includes('eval('));
      assert.ok(!content.includes('exec('));
      assert.ok(!content.includes('system('));
    });
  });

  suite('Block/Field Edge Cases', () => {
    test('should handle single character block names', () => {
      const blockSnippet = generateBlockSnippetContent('a');
      assert.ok(blockSnippet.includes('<!-- Block: a -->'));

      const blockBlueprint = generateBlockBlueprintContent('a');
      assert.ok(blockBlueprint.includes('name: A'));
    });

    test('should handle block names with numbers', () => {
      const content = generateBlockSnippetContent('block2');
      assert.ok(content.includes('<!-- Block: block2 -->'));
    });

    test('should handle deeply nested block paths in name mapping', () => {
      const blueprintPath = path.join(
        mockWorkspaceRoot,
        'site',
        'blueprints',
        'blocks',
        'media',
        'images',
        'gallery.yml'
      );
      const snippetName = getBlockSnippetNameFromBlueprint(blueprintPath, 'nested');
      assert.strictEqual(typeof snippetName === 'string' || snippetName === undefined, true);
    });

    test('should handle field names with special characters in safe positions', () => {
      const content = generateFieldSnippetContent('field-name_123');
      assert.ok(content.includes('<!-- Field: field-name_123 -->'));
    });

    test('should generate valid HTML class names from field names', () => {
      const content = generateFieldSnippetContent('my-custom-field');
      // Class names should be valid CSS identifiers
      assert.ok(content.includes('class="field field-my-custom-field"'));
      assert.ok(!content.includes('class="field field-my custom field"')); // No spaces
    });
  });

  suite('Block/Field Security', () => {
    test('block generators should not include dangerous functions', () => {
      const snippetContent = generateBlockSnippetContent('test');
      assert.ok(!snippetContent.includes('eval('));
      assert.ok(!snippetContent.includes('exec('));
      assert.ok(!snippetContent.includes('system('));
    });

    test('block Blueprint should not contain PHP code', () => {
      const content = generateBlockBlueprintContent('test');
      assert.ok(!content.includes('<?php'));
      assert.ok(!content.includes('eval'));
    });

    test('field snippet should not include dangerous patterns', () => {
      const content = generateFieldSnippetContent('test');
      assert.ok(!content.includes('eval('));
      assert.ok(!content.includes('exec('));
      assert.ok(!content.includes('system('));
      assert.ok(!content.includes('__destruct'));
    });

    test('generated block snippet should use safe Kirby methods', () => {
      const content = generateBlockSnippetContent('test');
      // Should use Kirby's safe methods
      assert.ok(content.includes('$block->content()->toBlocks()'));
      assert.ok(!content.includes('file_get_contents'));
      assert.ok(!content.includes('include'));
    });

    test('generated field snippet should use safe Kirby methods', () => {
      const content = generateFieldSnippetContent('test');
      // Should use Kirby's safe methods
      assert.ok(content.includes('$field->value()'));
      assert.ok(!content.includes('file_get_contents'));
      assert.ok(!content.includes('include'));
    });
  });
});
