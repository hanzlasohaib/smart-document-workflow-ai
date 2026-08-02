# Appendix A — Glossary

| Field | Value |
|---|---|
| Status | Frozen |
| Version | 1.0.0 |
| Last Updated | 2026-08-02 |
| Owner | Locked with PAS 1.0.0; extend only via versioned PAS revisions |

Shared product and architecture terminology. **Do not** record new architectural decisions here — link to the owning PAS document and ADR ID.

| Term | Definition | Owning doc |
|---|---|---|
| Modular Monolith | One backend application and one frontend application with clear internal module boundaries; not microservices | [01](../01-vision-and-principles.md) (ADR-01-002) |
| Human-in-the-loop | Product principle that humans oversee AI outcomes when confidence or policy requires verification before business action | [01](../01-vision-and-principles.md) (ADR-01-003) |
| Public Surface | Unauthenticated marketing/education pages (Landing, Features, Pricing, About, Dashboard Preview) | [01](../01-vision-and-principles.md) |
| Authenticated Surface | Product capabilities that require an account (upload, documents, notifications, profile, dashboards) | [01](../01-vision-and-principles.md) |
| Production Readiness | Operable, secure, correct SaaS posture prioritized over unchecked feature expansion | [01](../01-vision-and-principles.md) (ADR-01-004) |
| Layered Backend | Presentation → Application → Domain/Persistence → Infrastructure inside one FastAPI deployable | [02](../02-system-architecture.md) (ADR-02-001) |
| Object Storage | External blob store for document binaries (target: Supabase Storage); not the transactional system of record | [02](../02-system-architecture.md) (ADR-02-002) |
| Job Boundary | Enqueue interface for asynchronous work; runner may be in-process or queue-backed without changing modules | [02](../02-system-architecture.md) (ADR-02-004) |
| API Version Prefix | URL prefix that freezes a REST contract generation (`/api/v1`) | [02](../02-system-architecture.md) (ADR-02-003) |
| System of Record | Authoritative store for a class of data; PostgreSQL for metadata/domain state in MVP | [02](../02-system-architecture.md) (ADR-02-005) |
| RBAC | Role-based access control; MVP roles `user` and `admin` evaluated server-side via a capability matrix | [03](../03-domain-data-and-security.md) (ADR-03-003) |
| Refresh Token | Longer-lived credential used only to obtain new access tokens; rotated and revocable | [03](../03-domain-data-and-security.md) (ADR-03-004) |
| Approval Status | Business acceptance state of a Document: `pending`, `approved`, or `rejected` | [03](../03-domain-data-and-security.md) |
| Processing Status | Pipeline lifecycle state of a Document (`uploaded`, `processing`, `processed`, `needs_review`, `failed`, `archived`) | [03](../03-domain-data-and-security.md) |
| Field Verification | Extracted Field state: unverified until an authorized actor confirms or corrects the value | [03](../03-domain-data-and-security.md) |
| Admin Seeding | Controlled creation of `admin` accounts outside public registration | [03](../03-domain-data-and-security.md) (ADR-03-002) |
| Ownership Scope | Non-admin access limited to resources owned by the acting User | [03](../03-domain-data-and-security.md) (ADR-03-007) |
| Pipeline Stage | One contracted step in document intelligence (OCR, classify, extract, etc.) | [04](../04-ai-pipeline-and-workflows.md) (ADR-04-001) |
| Confidence Threshold | Configurable score boundary below which a Document is marked `needs_review` (default 0.70) | [04](../04-ai-pipeline-and-workflows.md) (ADR-04-002) |
| Workflow Gate | Preconditions (field verification + approval) before type-routed automation runs | [04](../04-ai-pipeline-and-workflows.md) (ADR-04-003) |
| Workflow Lane | Type-specific automation path (Finance, HR, Internal) after gates pass | [04](../04-ai-pipeline-and-workflows.md) |
| Notification Trigger | Pipeline or domain event that creates a Notification for a User | [04](../04-ai-pipeline-and-workflows.md) (ADR-04-006) |
| Model Artifact | Packaged classifier (or related) file loaded at runtime under a deterministic path | [04](../04-ai-pipeline-and-workflows.md) (ADR-04-005) |
| User Portal | Authenticated Next.js shell for end-user document work (dashboard, upload, review, notifications, profile) | [05](../05-frontend-experience.md) |
| Admin Portal | Authenticated Next.js shell for cross-user oversight and approvals | [05](../05-frontend-experience.md) |
| BFF Auth | Next.js Route Handler bridge that sets httpOnly refresh cookies and proxies auth to FastAPI | [05](../05-frontend-experience.md) (ADR-05-005) |
| Route Guard | Client/middleware check that redirects unauthenticated or wrong-role users for UX only | [05](../05-frontend-experience.md) |
| Return URL | Internal path preserved through Login so users resume the protected action they attempted | [05](../05-frontend-experience.md) (ADR-05-003) |
| Definition of Done | Explicit exit criteria that must be met before starting the next delivery phase | [06](../06-engineering-and-operations.md) (ADR-06-004) |
| Delivery Phase | One of P0 Stabilize, P1 SaaS Foundations, P2 Product Surfaces, P3 Harden & Scale | [06](../06-engineering-and-operations.md) |
| Environment Parity | Staging mirrors production service topology at smaller scale (Compose-shaped) | [06](../06-engineering-and-operations.md) (ADR-06-001) |
| Readiness Probe | Health check that verifies dependencies (e.g. database) before receiving traffic | [06](../06-engineering-and-operations.md) (ADR-06-003) |
| Smoke Check | Minimal post-deploy verification (health + login) before promoting further | [06](../06-engineering-and-operations.md) (ADR-06-002) |

## Changelog

| Date | Version | Summary |
|---|---|---|
| 2026-08-01 | 0.1.0 | Stub created as part of PAS structure freeze |
| 2026-08-02 | 0.2.0 | Added PAS-01 terms |
| 2026-08-02 | 0.3.0 | Added PAS-02 terms |
| 2026-08-02 | 0.4.0 | Added PAS-03 terms (RBAC, tokens, statuses, seeding, ownership) |
| 2026-08-02 | 0.5.0 | Added PAS-04 terms (pipeline, confidence, gates, lanes, triggers, artifacts) |
| 2026-08-02 | 0.6.0 | Added PAS-05 terms (portals, BFF Auth, Route Guard, Return URL) |
| 2026-08-02 | 0.7.0 | Added PAS-06 terms (DoD, phases, parity, readiness, smoke) |
| 2026-08-02 | 1.0.0 | Official PAS freeze — glossary locked with core set |
