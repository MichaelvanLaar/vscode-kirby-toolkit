import { isAutoInjectTypeHintsEnabled, getTypeHintVariables } from '../config/settings';

/**
 * Generates content for a Kirby Blueprint file
 */
export function generateBlueprintContent(pageTypeName: string): string {
  const title = pageTypeName.charAt(0).toUpperCase() + pageTypeName.slice(1);
  return `title: ${title}

fields:
  title:
    type: text
    label: Title
  text:
    type: textarea
    label: Text
`;
}

/**
 * Generates content for a Kirby Template file
 */
export function generateTemplateContent(pageTypeName: string): string {
  // Check if type hints should be included
  const autoInjectTypeHints = isAutoInjectTypeHintsEnabled();
  const variables = getTypeHintVariables();

  let content = '';

  // Add type hints if enabled
  if (autoInjectTypeHints && variables.length > 0) {
    content += '<?php\n/**\n';
    for (const variable of variables) {
      const type = getTypeForVariable(variable);
      content += ` * @var ${type} ${variable}\n`;
    }
    content += ' */\n?>\n';
  }

  // Add HTML boilerplate
  content += `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= $page->title() ?></title>
</head>
<body>
  <h1><?= $page->title() ?></h1>
  <div><?= $page->text()->kirbytext() ?></div>
</body>
</html>
`;

  return content;
}

/**
 * Generates content for a Kirby Controller file
 */
export function generateControllerContent(pageTypeName: string): string {
  return `<?php

return function ($page, $site, $kirby) {
  return [];
};
`;
}

/**
 * Generates content for a Kirby Model file
 */
export function generateModelContent(pageTypeName: string): string {
  // Convert page type name to PascalCase for class name
  const className = toPascalCase(pageTypeName) + 'Page';

  return `<?php

use Kirby\\Cms\\Page;

class ${className} extends Page
{
  // Add custom page methods here
}
`;
}

/**
 * Converts a kebab-case or snake_case string to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Gets the type for a variable (for type hints)
 */
function getTypeForVariable(variable: string): string {
  switch (variable) {
    case '$page':
      return '\\Kirby\\Cms\\Page';
    case '$site':
      return '\\Kirby\\Cms\\Site';
    case '$kirby':
      return '\\Kirby\\Cms\\App';
    default:
      return 'mixed';
  }
}

/**
 * Generates content for a Kirby block snippet file
 * @param blockName Name of the block (e.g., 'gallery', 'text')
 */
export function generateBlockSnippetContent(blockName: string): string {
  return `<?php
/**
 * @var \\Kirby\\Cms\\Block $block
 */
?>
<!-- Block: ${blockName} -->
<div class="block block-${blockName}">
  <?php if ($content = $block->content()->toBlocks()): ?>
    <?php foreach ($content as $nestedBlock): ?>
      <?= $nestedBlock ?>
    <?php endforeach ?>
  <?php endif ?>
</div>
`;
}

/**
 * Generates content for a Kirby block Blueprint file
 * @param blockName Name of the block (e.g., 'gallery', 'text')
 */
export function generateBlockBlueprintContent(blockName: string): string {
  const title = blockName.charAt(0).toUpperCase() + blockName.slice(1);
  return `name: ${title}
icon: page
fields:
  content:
    type: blocks
    fieldsets:
      - heading
      - text
`;
}

/**
 * Generates content for a Kirby field snippet file
 * @param fieldName Name of the field (e.g., 'address', 'social-links')
 */
export function generateFieldSnippetContent(fieldName: string): string {
  return `<?php
/**
 * @var \\Kirby\\Cms\\Field $field
 */
?>
<!-- Field: ${fieldName} -->
<div class="field field-${fieldName}">
  <?= $field->value() ?>
</div>
`;
}
