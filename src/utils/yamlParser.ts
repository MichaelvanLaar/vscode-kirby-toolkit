import * as yaml from 'js-yaml';

/**
 * Represents a parsed Blueprint field
 */
export interface BlueprintField {
  name: string;
  type?: string;
}

/**
 * Represents parsed Blueprint data
 */
export interface BlueprintData {
  fields: BlueprintField[];
  title?: string;
}

/**
 * Parses a Kirby Blueprint YAML string
 * @param content The YAML content as a string
 * @returns Parsed Blueprint data or null if parsing fails
 */
export function parseBlueprint(content: string): BlueprintData | null {
  try {
    const parsed = yaml.load(content);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    const data: BlueprintData = {
      fields: [],
      title: (parsed as { title?: string }).title
    };

    // Extract fields from the Blueprint
    data.fields = extractFieldNames(parsed);

    return data;
  } catch (error) {
    // Invalid YAML syntax
    return null;
  }
}

/**
 * Recursively extracts field names from a parsed Blueprint object
 * @param obj The parsed Blueprint object
 * @returns Array of field information
 */
export function extractFieldNames(obj: unknown): BlueprintField[] {
  const fields: BlueprintField[] = [];

  if (!obj || typeof obj !== 'object') {
    return fields;
  }

  const data = obj as Record<string, unknown>;

  // Direct fields section
  if (data.fields && typeof data.fields === 'object') {
    const fieldsObj = data.fields as Record<string, unknown>;
    for (const [name, fieldDef] of Object.entries(fieldsObj)) {
      const field: BlueprintField = { name };
      if (fieldDef && typeof fieldDef === 'object') {
        const def = fieldDef as Record<string, unknown>;
        if (typeof def.type === 'string') {
          field.type = def.type;
        }
      }
      fields.push(field);
    }
  }

  // Tabs structure
  if (data.tabs && typeof data.tabs === 'object') {
    const tabs = data.tabs as Record<string, unknown>;
    for (const tabContent of Object.values(tabs)) {
      fields.push(...extractFieldNames(tabContent));
    }
  }

  // Sections structure
  if (data.sections && typeof data.sections === 'object') {
    const sections = data.sections as Record<string, unknown>;
    for (const sectionContent of Object.values(sections)) {
      if (sectionContent && typeof sectionContent === 'object') {
        const section = sectionContent as Record<string, unknown>;
        // Sections can have fields directly
        if (section.fields) {
          fields.push(...extractFieldNames({ fields: section.fields }));
        }
      }
    }
  }

  // Columns structure (for layout)
  if (data.columns && typeof data.columns === 'object') {
    const columns = data.columns as Record<string, unknown>;
    for (const columnContent of Object.values(columns)) {
      fields.push(...extractFieldNames(columnContent));
    }
  }

  return fields;
}

/**
 * Formats field list for display in CodeLens
 * @param fields Array of fields
 * @param includeTypes Whether to include field types
 * @param limit Maximum number of fields to display before truncating
 * @returns Formatted string for display
 */
export function formatFieldsForDisplay(
  fields: BlueprintField[],
  includeTypes: boolean = false,
  limit: number = 5
): string {
  if (fields.length === 0) {
    return 'No fields defined';
  }

  const displayFields = fields.slice(0, limit);
  const fieldStrings = displayFields.map(f =>
    includeTypes && f.type ? `${f.name} (${f.type})` : f.name
  );

  let result = fieldStrings.join(', ');

  if (fields.length > limit) {
    result += ` ... (+${fields.length - limit} more)`;
  }

  return result;
}
