# Design: Non-Functional Requirements

## Context

The Kirby CMS Developer Toolkit has been developed following implicit quality standards (e.g., "fast activation", "zero configuration", "non-intrusive"), but these have not been formally documented as measurable requirements. As the project scales:

- New contributors need clear quality guidelines
- Feature proposals lack standardized evaluation criteria
- Trade-off decisions (e.g., performance vs. feature richness) are made ad-hoc
- Cross-feature consistency is harder to maintain

**Key constraints:**
- NFRs must be measurable or objectively verifiable (avoid vague statements like "must be fast")
- NFRs should reflect existing project standards already proven in implemented features
- NFRs must be realistic for a VS Code extension context (not enterprise-grade requirements)
- NFRs should guide but not block innovation (allow exceptions with justification)

**Stakeholders:**
- Extension maintainers: Need clear quality standards for code review
- Contributors: Need guidelines for implementing new features
- Users: Benefit from consistent, high-quality experience across all features

## Goals / Non-Goals

**Goals:**
- Document measurable performance targets for common operations
- Establish architectural principles for maintainability and extensibility
- Define compatibility requirements with popular VS Code extensions
- Codify user experience principles that guide feature design
- Create evaluation framework for future feature proposals

**Non-Goals:**
- Retroactively modifying existing implemented features (unless they violate critical NFRs)
- Creating rigid rules that prevent experimentation
- Documenting tool-specific implementation details (e.g., specific TypeScript patterns)
- Defining security requirements (already covered in project.md Security Considerations)

## Decisions

### Decision 1: NFR Scope - Cross-Cutting Quality Attributes

**What:** Define NFRs as cross-cutting concerns that apply to ALL features, rather than feature-specific quality requirements.

**Why:**
- Ensures consistent user experience across the toolkit
- Prevents fragmentation (different performance standards per feature)
- Simplifies evaluation (one set of criteria for all proposals)
- Reflects reality (quality attributes like performance affect all features)

**What's NOT included:**
- Feature-specific requirements (e.g., "Blueprint validation must support all YAML features") → belongs in feature specs
- Implementation details (e.g., "use async/await for file operations") → belongs in code conventions
- Security requirements → already documented in project.md

### Decision 2: Performance - Quantified Time Budgets

**What:** Define specific time budgets for common operation categories:

| Operation Category | Target | Rationale |
|--------------------|--------|-----------|
| Extension activation | <500ms | VS Code guideline; user expects instant editor availability |
| File system operations (read/write) | <100ms | Individual operations must feel instant |
| CodeLens rendering | <200ms | Displayed inline; slow rendering causes UI jank |
| Command execution (simple) | <300ms | User-initiated actions should feel responsive |
| Command execution (complex) | <2s | Operations like scaffolding can have visible progress |

**Why quantified targets:**
- Measurable in tests (e.g., `expect(activationTime).toBeLessThan(500)`)
- Objective pass/fail criteria for code review
- Based on human perception thresholds (100ms = "instant", 1s = "noticeable delay")

**Alternatives considered:**
1. **Qualitative statements** - "Operations should be fast"
   - *Rejected*: Subjective, not testable, doesn't guide implementation
2. **Percentile-based SLAs** - "95% of operations complete in <100ms"
   - *Rejected*: Overkill for extension development, hard to measure without telemetry
3. **Tool-specific limits** - "VS Code API calls must complete in <X"
   - *Rejected*: Too implementation-focused, constrains solutions unnecessarily

### Decision 3: Maintainability - Architectural Principles

**What:** Define maintainability through architectural principles rather than code metrics (e.g., cyclomatic complexity, line counts):

**Principles:**
1. **Modularity** - Each feature in a self-contained module (commands/, providers/, utils/)
2. **Single Responsibility** - One class/file per concern (SnippetCodeLens, TypeHintInjector)
3. **Dependency Injection** - Pass configuration/utilities as parameters (no global state)
4. **Open/Closed** - New features should extend (new files) rather than modify (existing files)
5. **Testability** - All modules have corresponding test files with >80% coverage for core logic

**Why principles over metrics:**
- More flexible (different features have different complexity profiles)
- Aligns with existing codebase structure (project.md already documents architecture patterns)
- Easier to evaluate during code review (subjective but clear)

**Enforcement:**
- Code review checklist referencing these principles
- Documented in project.md (already exists, NFR spec reinforces)
- Example: "Does this change add logic to an existing provider, or create a new one?"

### Decision 4: Compatibility - Integration Testing Approach

**What:** Define compatibility requirements for key VS Code extensions:

**Required integrations:**
- **RedHat YAML** (redhat.vscode-yaml) - Declared as `extensionDependency`, Blueprint validation relies on it
- **Intelephense** (bmewburn.vscode-intelephense-client) - Optional but recommended; type hints enhance Intelephense's analysis
- **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss) - Optional; toolkit auto-configures Tailwind for PHP files

**Compatibility requirements:**
1. **Non-interference** - Toolkit must not break existing functionality of these extensions
2. **Graceful degradation** - If optional extensions are missing, toolkit features should degrade gracefully (not error)
3. **Configuration respect** - Toolkit should read/write shared configuration (settings.json) without overwriting user preferences
4. **Activation order independence** - Toolkit must work regardless of which extension activates first

**Testing approach:**
- Integration tests with extension API mocks simulating presence/absence of dependencies
- Manual testing with extensions enabled/disabled in test environment
- Document compatibility matrix in README (tested versions)

**Alternatives considered:**
1. **Bundle all dependencies** - Include YAML parser, PHP parser, etc. directly in toolkit
   - *Rejected*: Massive bundle size, duplicates ecosystem tools, users already have these extensions
2. **Hard requirement** - Fail activation if dependencies missing
   - *Rejected*: Too restrictive, breaks zero-config principle
3. **No compatibility testing** - Assume it works
   - *Rejected*: High risk of breaking changes in dependencies

### Decision 5: User Experience - Guided Experience Principles

**What:** Define UX principles for contextual help and discoverability:

**Principles:**
1. **Zero Configuration** - Features work out-of-box without setup (detect Kirby project, auto-enable features)
2. **Progressive Disclosure** - Advanced features hidden by default, revealed through settings or commands
3. **Contextual Actions** - CodeLens, quick actions, and commands appear where relevant (not in global menus)
4. **Clear Feedback** - User-initiated actions provide success/error notifications with actionable guidance
5. **Non-Intrusive** - Features enhance workflow without cluttering UI (allow disabling CodeLens, notifications, etc.)
6. **Onboarding Hints** - First-time users see informational messages explaining features (one-time, dismissible)

**Example implementations:**
- CodeLens "Go to snippet" appears above `snippet()` calls (contextual)
- First Blueprint validation shows notification explaining feature (onboarding)
- Type-hint injection has `kirby.autoInjectTypeHints` toggle (non-intrusive)

**Measurement:**
- Qualitative (code review asks "Is this feature discoverable? Does it provide feedback?")
- User testing (if available): "Can a new Kirby developer use this without reading documentation?"

## Risks / Trade-offs

### Risk 1: NFRs Too Restrictive
**Risk:** Strict performance budgets or architectural rules may block innovative features that require different approaches.

**Mitigation:**
- Allow exceptions with justification in feature proposals (e.g., "This feature needs 1s for initial indexing, acceptable because it's one-time on activation")
- Review NFRs annually and adjust based on feedback
- Recognize NFRs as guidelines, not laws

### Risk 2: NFRs Too Vague
**Risk:** Qualitative requirements (e.g., "lean implementation") are open to interpretation and may not improve consistency.

**Mitigation:**
- Provide concrete examples in spec (good vs. bad implementations)
- Reference existing codebase as "gold standard" (e.g., "snippet-navigation module demonstrates good modularity")
- Use code review as enforcement mechanism with explicit NFR checklist

### Risk 3: Measurement Overhead
**Risk:** Performance testing adds development time and CI/CD complexity.

**Mitigation:**
- Phase 1: Manual performance testing during development (developer measures with console.time())
- Phase 2: Automated benchmarks in CI/CD if critical performance regressions occur
- Focus on user-perceptible operations (activation, commands) rather than micro-benchmarks

### Risk 4: Compatibility Matrix Explosion
**Risk:** As toolkit grows, number of extension combinations to test becomes unmanageable.

**Mitigation:**
- Test only "happy path" (all recommended extensions installed) and "minimal path" (only required extensions)
- Document known incompatibilities in README
- Rely on user reports for edge cases (exotic extension combinations)

## Migration Plan

**Phase 1: Specification Only (This Change)**
1. Create `quality-attributes` specification with formal NFR requirements
2. No code changes required (NFRs codify existing implicit standards)
3. Update project.md to reference new NFR spec

**Phase 2: Process Integration (Next Sprint)**
1. Add NFR checklist to pull request template
2. Update CONTRIBUTING.md (if exists) with NFR guidelines
3. Create example feature proposal demonstrating NFR compliance

**Phase 3: Measurement (Future Enhancement)**
1. Add performance benchmarks to test suite for critical paths (activation, file creation)
2. Set up CI/CD alerts for performance regressions
3. Collect telemetry (opt-in) to validate performance assumptions in real-world usage

**Rollback Plan:**
- If NFRs prove too restrictive or cause disputes, revert specification and operate without formal NFRs
- No code impact (specification-only change)

## Open Questions

1. **Performance Budget Adjustments:** Should performance budgets vary by operation complexity, or use fixed thresholds?
   - *Proposed answer*: Use tiered budgets (simple <300ms, complex <2s) with justification required for exceptions

2. **Architectural Documentation:** Should we create architecture decision records (ADRs) for major design choices?
   - *Proposed answer*: Phase 2 enhancement; use design.md in OpenSpec changes for now

3. **Compatibility Testing Frequency:** How often should we test compatibility with updated versions of dependent extensions?
   - *Proposed answer*: Test on major extension releases; rely on semantic versioning and community reports for minor updates

4. **UX Metrics:** Should we define quantitative UX metrics (e.g., "90% of users enable feature within first session")?
   - *Proposed answer*: Not in Phase 1 (no telemetry infrastructure); qualitative principles sufficient for now
