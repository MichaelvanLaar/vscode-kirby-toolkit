---
name: Context7: VS Code
description: Pull VS Code Extension API docs and samples for context
category: Context7
tags: [context7, vscode, documentation]
---

You are working on a VS Code extension project. The user wants additional context from official VS Code documentation.

**Task:**
1. Use the Context7 MCP tool to fetch documentation from:
   - https://context7.com/microsoft/vscode-docs
   - https://context7.com/microsoft/vscode-extension-samples

2. If the user provided a specific topic (e.g., "FileSystemWatcher", "CodeLens", "configuration"), focus your query on that topic.

3. If no topic was provided, fetch general VS Code Extension API documentation that's relevant to the current task or conversation.

4. After retrieving the documentation, briefly summarize what context you've loaded (e.g., "Loaded VS Code Extension API docs for FileSystemWatcher and workspace configuration").

5. Continue with the original task/conversation using this additional context.

**Context7 Usage:**
- Use `resolve-library-id` to find the correct library IDs if needed
- Use `get-library-docs` with the resolved library IDs
- Set appropriate token limits based on the scope (5000-10000 tokens for specific topics, 3000-5000 for general context)

**Note:** This command is designed to be used when:
- Working with unfamiliar VS Code APIs
- Troubleshooting API-related issues
- Implementing new extension features that need API verification
- Checking for API changes or best practices
