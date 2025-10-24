import * as vscode from 'vscode';

export interface SnippetCall {
  snippetName: string;
  range: vscode.Range;
  line: number;
}

/**
 * Finds all snippet() function calls in a document
 * @param document The document to search
 * @returns Array of snippet calls with their locations
 */
export function findSnippetCalls(document: vscode.TextDocument): SnippetCall[] {
  const snippetCalls: SnippetCall[] = [];
  const text = document.getText();

  // Regex to match snippet('name') or snippet("name") with optional data parameter
  // Captures the snippet name from either single or double quotes
  const snippetRegex = /snippet\s*\(\s*['"]([^'"]+)['"]/g;

  let match;
  while ((match = snippetRegex.exec(text)) !== null) {
    const snippetName = match[1];
    const matchStart = match.index;
    const matchEnd = matchStart + match[0].length;

    const startPos = document.positionAt(matchStart);
    const endPos = document.positionAt(matchEnd);
    const range = new vscode.Range(startPos, endPos);

    snippetCalls.push({
      snippetName,
      range,
      line: startPos.line
    });
  }

  return snippetCalls;
}

/**
 * Gets the snippet name at a specific position in the document
 * @param document The document
 * @param position The cursor position
 * @returns The snippet name if found, undefined otherwise
 */
export function getSnippetNameAtPosition(document: vscode.TextDocument, position: vscode.Position): string | undefined {
  const snippetCalls = findSnippetCalls(document);

  for (const call of snippetCalls) {
    if (call.range.contains(position)) {
      return call.snippetName;
    }
  }

  return undefined;
}
