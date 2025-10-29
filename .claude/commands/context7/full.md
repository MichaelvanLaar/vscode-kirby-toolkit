---
name: Context7: Full Context
description: Pull both VS Code and Kirby CMS documentation for comprehensive context
category: Context7
tags: [context7, vscode, kirby, documentation]
---

You are working on a VS Code extension for Kirby CMS development. The user wants comprehensive context from both VS Code Extension API and Kirby CMS documentation.

**Task:**
1. Use the Context7 MCP tool to fetch documentation from:
   - **VS Code:**
     - https://context7.com/microsoft/vscode-docs
     - https://context7.com/microsoft/vscode-extension-samples
   - **Kirby CMS:**
     - https://context7.com/websites/getkirby

2. If the user provided a specific topic (e.g., "blueprint validation", "template CodeLens"), fetch documentation relevant to that topic from both sources.

3. If no topic was provided, fetch general documentation from both sources that's relevant to the current task or conversation.

4. After retrieving the documentation, briefly summarize what context you've loaded from both sources (e.g., "Loaded VS Code Extension API docs for CodeLens providers and Kirby CMS docs for Blueprint structure").

5. Continue with the original task/conversation using this comprehensive context.

**Context7 Usage:**
- Use `resolve-library-id` to find the correct library IDs if needed
- Use `get-library-docs` with the resolved library IDs
- Balance token limits between both sources (3000-5000 tokens each for general context, more for specific topics)

**Note:** This command is designed to be used when:
- Working on complex features that bridge VS Code and Kirby CMS
- Implementing new functionality that requires deep understanding of both systems
- Troubleshooting issues that might involve both VS Code APIs and Kirby structures
- Starting work on a significant new feature where comprehensive context is valuable

**Warning:** This command will consume more tokens (~6000-15000) than individual context commands. Use it when the comprehensive context is truly needed.
