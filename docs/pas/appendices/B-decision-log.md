# Appendix B — Decision Log

| Field | Value |
|---|---|
| Status | Frozen |
| Version | 1.0.0 |
| Last Updated | 2026-08-02 |
| Owner | Updated whenever a core PAS doc adds or supersedes an ADR |

Index of Architecture Decision Records. Full ADR bodies live in the owning PAS document. ID scheme: `ADR-<doc#>-<seq>` (see [DOCUMENTATION_STANDARDS.md](../DOCUMENTATION_STANDARDS.md)).

| Decision ID | Title | Owning doc | Status |
|---|---|---|---|
| ADR-01-001 | Evolve existing system; no greenfield rewrite | [01](../01-vision-and-principles.md) | Accepted |
| ADR-01-002 | Modular Monolith architecture | [01](../01-vision-and-principles.md) | Accepted |
| ADR-01-003 | Human-in-the-loop as core product principle | [01](../01-vision-and-principles.md) | Accepted |
| ADR-01-004 | Production readiness over feature expansion | [01](../01-vision-and-principles.md) | Accepted |
| ADR-02-001 | Layered backend within the Modular Monolith | [02](../02-system-architecture.md) | Accepted |
| ADR-02-002 | Supabase Storage for document binaries | [02](../02-system-architecture.md) | Accepted |
| ADR-02-003 | Versioned REST API under `/api/v1` | [02](../02-system-architecture.md) | Accepted |
| ADR-02-004 | Evolve background processing via a job boundary | [02](../02-system-architecture.md) | Accepted |
| ADR-02-005 | PostgreSQL as metadata system of record | [02](../02-system-architecture.md) | Accepted |
| ADR-03-001 | User-only public registration | [03](../03-domain-data-and-security.md) | Accepted |
| ADR-03-002 | Seeded administrators only | [03](../03-domain-data-and-security.md) | Accepted |
| ADR-03-003 | Server-enforced RBAC with capability matrix | [03](../03-domain-data-and-security.md) | Accepted |
| ADR-03-004 | Access JWT plus rotating refresh tokens | [03](../03-domain-data-and-security.md) | Accepted |
| ADR-03-005 | Alembic as sole schema evolution mechanism | [03](../03-domain-data-and-security.md) | Accepted |
| ADR-03-006 | Immutable automation logs | [03](../03-domain-data-and-security.md) | Accepted |
| ADR-03-007 | Ownership-scoped document and field access | [03](../03-domain-data-and-security.md) | Accepted |
| ADR-04-001 | Sequential stage pipeline with explicit contracts | [04](../04-ai-pipeline-and-workflows.md) | Accepted |
| ADR-04-002 | Configurable confidence threshold and review status | [04](../04-ai-pipeline-and-workflows.md) | Accepted |
| ADR-04-003 | Workflow after verification and approval gates | [04](../04-ai-pipeline-and-workflows.md) | Accepted |
| ADR-04-004 | Closed document-type set with explicit extension path | [04](../04-ai-pipeline-and-workflows.md) | Accepted |
| ADR-04-005 | Deterministic model artifact loading and lifecycle | [04](../04-ai-pipeline-and-workflows.md) | Accepted |
| ADR-04-006 | Status-accurate notification trigger catalog | [04](../04-ai-pipeline-and-workflows.md) | Accepted |
| ADR-05-001 | Single Next.js App Router frontend | [05](../05-frontend-experience.md) | Accepted |
| ADR-05-002 | Shared Login; user-only Signup; role-based routing | [05](../05-frontend-experience.md) | Accepted |
| ADR-05-003 | Protected actions redirect to Login with return URL | [05](../05-frontend-experience.md) | Accepted |
| ADR-05-004 | TanStack Query and Axios for `/api/v1` | [05](../05-frontend-experience.md) | Accepted |
| ADR-05-005 | Memory access token and httpOnly refresh via BFF | [05](../05-frontend-experience.md) | Accepted |
| ADR-05-006 | Tailwind, ShadCN, RHF/Zod, purposeful motion | [05](../05-frontend-experience.md) | Accepted |
| ADR-06-001 | Docker Compose for local and parity—not Kubernetes | [06](../06-engineering-and-operations.md) | Accepted |
| ADR-06-002 | CI gates before merge and deploy | [06](../06-engineering-and-operations.md) | Accepted |
| ADR-06-003 | Observability baseline—logs, health, errors | [06](../06-engineering-and-operations.md) | Accepted |
| ADR-06-004 | Four-phase delivery with hard DoD | [06](../06-engineering-and-operations.md) | Accepted |
| ADR-06-005 | Secrets and config never committed | [06](../06-engineering-and-operations.md) | Accepted |

## Changelog

| Date | Version | Summary |
|---|---|---|
| 2026-08-01 | 0.1.0 | Stub created as part of PAS structure freeze |
| 2026-08-02 | 0.2.0 | Indexed ADR-01-001 through ADR-01-004 |
| 2026-08-02 | 0.3.0 | Indexed ADR-02-001 through ADR-02-005 |
| 2026-08-02 | 0.4.0 | Indexed ADR-03-001 through ADR-03-007 |
| 2026-08-02 | 0.5.0 | Indexed ADR-04-001 through ADR-04-006 |
| 2026-08-02 | 0.6.0 | Indexed ADR-05-001 through ADR-05-006 |
| 2026-08-02 | 0.7.0 | Indexed ADR-06-001 through ADR-06-005 |
| 2026-08-02 | 1.0.0 | Official PAS freeze — decision log locked with core set |
