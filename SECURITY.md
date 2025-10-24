# Security Policy

## Security Fixes in v0.1.0

This extension has undergone security review and hardening. The following security measures have been implemented:

### Path Traversal Protection

**Issue**: The snippet name parameter was not properly sanitized before being used in path construction.

**Fix**: Implemented multi-layer path traversal protection in `resolveSnippetPath()`:
- Sanitizes snippet names to remove path traversal sequences (`../`, `..\\`)
- Rejects absolute paths
- Validates that resolved paths stay within the `site/snippets/` directory
- Handles both Unix and Windows path separators

**Test Coverage**: Comprehensive security tests in `src/test/security.test.ts` verify protection against:
- Relative path traversal (`../../etc/passwd`)
- Windows path traversal (`..\\..\\windows\\system32`)
- Absolute paths (`/etc/passwd`)
- Embedded traversal sequences (`partials/../../../etc/passwd`)
- Empty and null inputs

### Race Condition Fix

**Issue**: File creation handler used arbitrary timeout (100ms) which could cause race conditions.

**Fix**: Replaced timeout with proper async/await pattern and added:
- Proper error handling with try-catch
- Content length validation to avoid overwriting existing files
- Graceful degradation if document can't be opened

### Dependency Security

All dependencies have been audited:
```bash
npm audit
# Result: found 0 vulnerabilities
```

## Reporting a Vulnerability

If you discover a security vulnerability in this extension, please report it by:

1. **Do NOT** open a public issue
2. Email the security details to the maintainer (contact via GitHub profile)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work on a fix as priority.

## Security Best Practices

When using this extension:

1. **Keep it updated**: Security fixes are released promptly
2. **Review configuration**: Check extension settings for your security requirements
3. **Limited scope**: Extension only operates within detected Kirby CMS projects
4. **No external communication**: Extension works entirely offline

## Audit History

- **2025-10-24**: Initial security audit and hardening (v0.1.0)
  - Path traversal protection implemented
  - Race condition fixed
  - Comprehensive test suite added (36 tests)
  - Zero dependencies vulnerabilities confirmed

## Security Features

- ✅ Input sanitization on all user-provided data
- ✅ Path validation with directory boundary checks
- ✅ No shell command execution
- ✅ No network requests
- ✅ Read-only file operations (except type-hint injection)
- ✅ Workspace-scoped operation (no global system access)
- ✅ Comprehensive automated testing
