---
name: /audit-design
description: Audits the active directory against Clean Architecture rules, SOLID principles, and GoF design patterns.
---

# Workflow: Architectural Compliance Audit

When this command is triggered, execute the following steps inside your sandbox:

1.  **Codebase Scan:** Analyze all recently modified source files or files currently sitting in the git staging area.
2.  **Bibliographic Assessment:** Cross-reference the discovered file structures, class declarations, and architectural boundaries against the guidelines established in `AGENTS.md`:
    * *Clean Architecture Check:* Are dependencies pointing strictly inward? Are framework leaks present in the domain?
    * *S.O.L.I.D. Verification:* Are there long classes breaking SRP? Are modules tightly coupled instead of relying on DIP abstractions?
    * *GoF Pattern Review:* Is structural complexity handled with appropriate reusable design patterns?
3.  **Output Compilation:** Generate a clean, interactive Markdown report directly in the chat panel with the following headings:
    * **Compliant Areas:** Where the code successfully hits our engineering standards.
    * **Architectural Risks & Violations:** Clear callouts of coupling, breaking boundaries, or pattern mismatches.
    * **Refactoring Strategy:** Practical, step-by-step code samples showing exactly how to refactor those specific files to be fully compliant.
