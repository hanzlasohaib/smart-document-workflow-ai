# Documentation

Project documentation for **Smart Document Workflow AI**.

| Area | Path | Role |
|---|---|---|
| Implementation roadmap | [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) | P0–P3 execution checklist and branching |
| Implementation audit | [audit/AUDIT_REPORT.md](./audit/AUDIT_REPORT.md) | Source of truth for the **audited** codebase baseline |
| Product Architecture Specification | [pas/README.md](./pas/README.md) | Authoritative architectural source of truth (**PAS 1.0.0 Frozen**) |
| PAS writing rules | [pas/DOCUMENTATION_STANDARDS.md](./pas/DOCUMENTATION_STANDARDS.md) | Mandatory template, ADR schema, standards |
| Diagrams | [architecture/diagrams/](./architecture/diagrams/) | Mermaid sources / exported architecture diagrams |
| Assets | [architecture/assets/](./architecture/assets/) | Static images used by docs |

## How to use the PAS

1. Read the audit before proposing changes that touch existing behavior.
2. Follow the frozen hierarchy and ownership matrix in [pas/README.md](./pas/README.md).
3. Treat PAS-01 through PAS-06 (**Frozen 1.0.0**) as binding for implementation.
4. Every PAS change must follow [pas/DOCUMENTATION_STANDARDS.md](./pas/DOCUMENTATION_STANDARDS.md) (semver + changelog).
5. Index Accepted/Superseded ADRs in [pas/appendices/B-decision-log.md](./pas/appendices/B-decision-log.md).
6. Follow delivery phases in [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) (starts at **P0 Stabilize** per [pas/06-engineering-and-operations.md](./pas/06-engineering-and-operations.md)).

## Status

| Item | Status |
|---|---|
| Docs tree / PAS hierarchy | Frozen |
| [PAS-01 Vision and Principles](./pas/01-vision-and-principles.md) | **Frozen 1.0.0** |
| [PAS-02 System Architecture](./pas/02-system-architecture.md) | **Frozen 1.0.0** |
| [PAS-03 Domain, Data & Security](./pas/03-domain-data-and-security.md) | **Frozen 1.0.0** |
| [PAS-04 AI Pipeline & Workflows](./pas/04-ai-pipeline-and-workflows.md) | **Frozen 1.0.0** |
| [PAS-05 Frontend Experience](./pas/05-frontend-experience.md) | **Frozen 1.0.0** |
| [PAS-06 Engineering & Operations](./pas/06-engineering-and-operations.md) | **Frozen 1.0.0** |
| Appendices A–C | **Frozen 1.0.0** |
| PAS content freeze date | 2026-08-02 |

Related planning prompts at repo root: `PLAN.md`, `PAS_PLAN.md`, `PAS_REFINEMENT.md` (process inputs, not the living architecture SoT).
