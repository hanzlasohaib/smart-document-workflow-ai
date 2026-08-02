# PAS Documentation Standards

| Field | Value |
|---|---|
| Status | **Frozen** |
| Version | 1.0.0 |
| Frozen date | 2026-08-01 |
| Applies to | All documents under `docs/pas/` (core docs + appendices) |
| Hierarchy | [README.md](./README.md) |

This file freezes the mandatory document template, inline ADR schema, and writing rules. Do not invent alternate section layouts for core PAS documents.

---

## 1. Writing style

- Decisive, concise, architecture-first.
- Prefer decisions and ownership over inventory dumps.
- Explain **why**, trade-offs, and rejected alternatives for every material choice.
- No implementation code, no SQL DDL, no pasted OpenAPI/JSON schemas.
- Do not redesign from scratch; evolve from [AUDIT_REPORT.md](../audit/AUDIT_REPORT.md).
- When uncertain about current code, defer to the audit and say so explicitly.

---

## 2. Terminology

- Glossary-owned terms live in [appendices/A-glossary.md](./appendices/A-glossary.md). Use them consistently.
- Prefer stable product terms: Document, Extracted Field, Approval Status, Notification, Automation Log, Pipeline, Workflow.
- Roles: `user` and `admin` only unless `03-domain-data-and-security.md` extends them.
- Cite Decision IDs (`ADR-03-002`) instead of vague phrases like “see security.”

---

## 3. Heading levels

| Level | Use |
|---|---|
| H1 | Document title only (one per file) |
| H2 | Mandatory template sections (Purpose, Audience, …) |
| H3 | ADR titles (`### ADR-02-001: …`) and major subsections |
| H4+ | Avoid unless a single section becomes unreadable |

---

## 4. Tables, diagrams, and Mermaid

- Prefer tables for matrices (RBAC, ownership, phases, comparisons).
- Mermaid is allowed for architecture and flows.
- Store notable diagram sources under `docs/architecture/diagrams/` and list them in [appendices/C-diagram-index.md](./appendices/C-diagram-index.md).
- Mermaid rules: no spaces in node IDs; use camelCase/PascalCase/underscores; quote edge labels that contain special characters; do not apply custom colors/styles.

---

## 5. Cross references

- Use relative Markdown links, e.g. `[03 Domain](./03-domain-data-and-security.md)`.
- Link to Decision IDs and section anchors when helpful.
- Soft dependencies (e.g. `05` → `04`) may be referenced but must not redefine owned rules.

---

## 6. Versioning and review status

### Document header Status

| Status | Meaning |
|---|---|
| `Draft` | Work in progress; not binding |
| `In Review` | Ready for architectural review |
| `Frozen` | Binding for implementation until a major version change |

### Semver (per document)

| Bump | When |
|---|---|
| `0.x.x` | Pre-freeze drafts |
| `1.0.0` | First freeze of that document |
| Minor | Additive clarification; no decision reversal |
| Major | Breaking change to an Accepted decision |

Only **Frozen** documents with **Accepted** ADRs bind implementation. Superseded ADRs remain in place with Status `Superseded` and a pointer to the replacement.

---

## 7. Changelog policy

- Every core PAS document ends with an append-only **Changelog** table.
- After the first draft exists, every edit adds a row: date, version, summary.
- Do not rewrite history; correct via a new version entry.

---

## 8. Audit deference

Current implementation truth is [docs/audit/AUDIT_REPORT.md](../audit/AUDIT_REPORT.md).

When a recommendation conflicts with the audit, the document **must** include a **Current → Recommended → Migration** section (or state explicitly that the section is N/A and why).

---

## 9. Standard document template

Every core PAS document (`01`–`06`) must use this section order. Do not reorder. Do not omit a section without stating `N/A` and a one-line reason inside that section.

```markdown
# <Document Title>

| Field | Value |
|---|---|
| Doc ID | PAS-0N |
| Status | Draft / In Review / Frozen |
| Version | 0.1.0 |
| Last Updated | YYYY-MM-DD |
| Owners | optional names/roles |

## Purpose

## Audience

## Scope

## Out of Scope

## Assumptions

## Dependencies

Hard dependencies (links). Soft references if any. Audit link.

## Context

Brief current-state summary from the audit. Do not re-audit the codebase here.

## Architecture Decisions

One or more ADR blocks using the template in §10.

## Current → Recommended → Migration

Required when conflicting with the audit. If not applicable, write:

> N/A — <one-line reason>

### Current

### Recommended

### Migration

## Risks

## Trade-offs

Summary of major choices in this document (may point at ADR IDs).

## Future Considerations

Extension points only (multi-tenancy, billing hooks, model upgrades, etc.).
No speculative full designs.

## Frozen Decisions

Checklist of Decision IDs locked by this document (Accepted).

## Changelog

| Date | Version | Summary |
|---|---|---|
| YYYY-MM-DD | 0.1.0 | Initial draft |
```

Rejected template bloat: separate “Related Documents” encyclopedia (use Dependencies); separate long “References” lists.

---

## 10. Inline Architecture Decision Record (ADR) template

ADRs live **inside** the owning PAS document under **Architecture Decisions**. Do not create separate ADR files.

```markdown
### ADR-<DOC>-<NNN>: <short title>

| Field | Value |
|---|---|
| Decision ID | ADR-02-001 |
| Decision | What was decided |
| Context | Why a decision was needed |
| Alternatives Considered | A; B; C |
| Trade-offs | Costs and benefits of the chosen path |
| Reasoning | Why this path was selected |
| Status | Proposed / Accepted / Superseded |
| Owner | optional |

**Supersedes:** ADR-… (if any)
```

### Rules

| Rule | Detail |
|---|---|
| ID scheme | `ADR-<doc#>-<seq>` with three-digit sequence, e.g. `ADR-03-002` |
| Length | Prefer the table only; at most 1–2 short paragraphs after the table |
| Indexing | Every Accepted or Superseded ADR must appear in [appendices/B-decision-log.md](./appendices/B-decision-log.md) when the owning doc is updated |
| Ownership | An ADR may be defined only in the document that owns that concern (see [README.md](./README.md) ownership matrix) |

---

## 11. Appendix standards

Appendices are indexes and shared vocabulary—not parallel architecture docs.

| Appendix | May contain | Must not contain |
|---|---|---|
| A Glossary | Term, definition, owning doc | New architectural decisions |
| B Decision Log | ADR ID, title, owning doc, status | Full ADR body duplication beyond one-line title |
| C Diagram Index | Diagram name, path, owning doc | Unrelated assets dumps |

---

## Changelog

| Date | Version | Summary |
|---|---|---|
| 2026-08-01 | 1.0.0 | Frozen standards: template, ADR schema, writing rules |
