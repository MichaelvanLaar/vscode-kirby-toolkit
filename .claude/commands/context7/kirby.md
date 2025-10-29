---
name: Context7: Kirby
description: Pull Kirby CMS documentation for context
category: Context7
tags: [context7, kirby, documentation]
---

You are working on a project that integrates with Kirby CMS. The user wants additional context from official Kirby documentation.

**Task:**
1. Use the Context7 MCP tool to fetch documentation from:
   - https://context7.com/websites/getkirby

2. If the user provided a specific topic (e.g., "blueprints", "templates", "fields", "pages"), focus your query on that topic.

3. If no topic was provided, fetch general Kirby CMS documentation that's relevant to the current task or conversation.

4. After retrieving the documentation, briefly summarize what context you've loaded (e.g., "Loaded Kirby CMS docs for Blueprint structure and field types").

5. Continue with the original task/conversation using this additional context.

**Context7 Usage:**
- Use `resolve-library-id` to find the correct library ID if needed
- Use `get-library-docs` with the resolved library ID
- Set appropriate token limits based on the scope (5000-10000 tokens for specific topics, 3000-5000 for general context)

**Note:** This command is designed to be used when:
- Working with Kirby-specific features (Blueprints, templates, controllers, models)
- Troubleshooting Kirby integration issues
- Implementing features that interact with Kirby CMS structures
- Verifying Kirby conventions or best practices
