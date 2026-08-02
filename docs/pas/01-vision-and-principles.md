# Vision and Principles

| Field | Value |
|---|---|
| Doc ID | PAS-01 |
| Status | Frozen |
| Version | 1.0.0 |
| Last Updated | 2026-08-02 |
| Owners | Architecture / Product |

## Purpose

Establish the product vision, mission, boundaries, non-goals, personas, and architectural principles that constrain every subsequent PAS document and implementation decision for Smart Document Workflow AI.

## Audience

Founders, product owners, and tech leads. Also the onboarding baseline for any contributor before reading PAS-02 through PAS-06.

## Scope

This document defines what the product is trying to become and the principles that govern how it may evolve. It does not define how subsystems are built.

### Product vision

Smart Document Workflow AI is an AI-assisted document processing and workflow platform for organizations that need structured information extracted from uploaded documents, with human oversight where automated confidence is insufficient.

### Mission

Turn uploaded documents into reliable, reviewable structured outcomes, supported by auditable automation—not opaque black-box processing.

### Product goals

| Goal | Why it exists |
|---|---|
| Trustworthy extraction | Users must be able to rely on classified types and extracted fields, or know when they cannot |
| Explicit human review | Low-confidence or sensitive outcomes require a clear review path before business action |
| Role-appropriate product surfaces | End users and administrators need distinct, purposeful portals after a shared login |
| Operable SaaS quality | Correctness, security, and operability outrank unchecked feature expansion |

### Product boundaries

In scope for the product: document ingest; AI-assisted classification and extraction; human review; notifications; light workflow automation; user and admin product surfaces.

Out of product category: a full ERP, general-purpose DMS/ECM, content collaboration suite, or enterprise integration bus. Those domains are not the destination of this product.

### Public vs authenticated surfaces

| Surface class | Intent | Examples |
|---|---|---|
| Public | Marketing and education for visitors | Landing, Features, Pricing, About, Dashboard Preview |
| Authenticated | Product work requiring an account | Upload, documents, notifications, profile, user/admin dashboards |

Protected product actions (upload, view documents, notifications, profile) require authentication. Visitors attempting those actions are redirected to Login. Information architecture and routing belong to [05-frontend-experience.md](./05-frontend-experience.md).

### SaaS scope

| Horizon | Intent |
|---|---|
| MVP | Evolve the existing backend capability into a coherent SaaS product: ship Next.js portals, close security and correctness gaps, establish operable foundations |
| Later | Multi-tenancy / organizations, billing, deeper analytics and search—named only under Future Considerations until justified |

Detailed phasing and definition of done belong to [06-engineering-and-operations.md](./06-engineering-and-operations.md).

### Personas

Product personas only. Permissions and RBAC belong to [03-domain-data-and-security.md](./03-domain-data-and-security.md).

| Persona | Focus |
|---|---|
| End User | Uploads documents, tracks processing, reviews or corrects extracted fields when required, receives notifications |
| Administrator | Oversees documents and approvals across users, maintains platform integrity, acts with elevated responsibility |
| Organization Owner | Future organizational context (billing, membership); not an MVP implementation target in this document |

### Capability themes

High-level product capabilities (semantics and mechanics deferred):

- Ingest documents
- AI-assisted classification and structured extraction
- Human review of AI outcomes
- Notifications tied to meaningful events
- Administrative oversight
- Workflow routing after review-ready outcomes ([04-ai-pipeline-and-workflows.md](./04-ai-pipeline-and-workflows.md))

### Product philosophy

The product exists to reduce manual document handling while preserving accountability. Automation accelerates work; humans remain responsible for outcomes that fail confidence or policy thresholds.

### Architecture philosophy

| Principle | Why |
|---|---|
| Evolution instead of rewrite | Preserve working value in the audited codebase; rewrite destroys learning and delays SaaS readiness ([ADR-01-001](#adr-01-001-evolve-existing-system-no-greenfield-rewrite)) |
| Modular Monolith | One backend application and one frontend application with clear internal modules—scalable enough, operable by a small team ([ADR-01-002](#adr-01-002-modular-monolith-architecture)) |
| Layered architecture | Keep presentation, application/services, and persistence concerns separable for maintainability |
| SOLID / SoC / DRY / KISS | Reduce coupling and accidental complexity as the system hardens toward production |
| Security by design | Trust and authorization are product requirements, not late add-ons |
| Human-in-the-loop AI | AI assists; humans verify when stakes or uncertainty demand it ([ADR-01-003](#adr-01-003-human-in-the-loop-as-core-product-principle)) |
| Explicit architecture decisions | Material choices are recorded as ADRs so the system remains understandable over years |
| Small-team maintainability | Design for 1–3 engineers who can ship, operate, and reason about the whole system |

### Engineering philosophy

Prefer correctness, clarity, and operability over novelty. Production readiness and closing known gaps take priority over rapid feature expansion ([ADR-01-004](#adr-01-004-production-readiness-over-feature-expansion)). Avoid premature distribution (microservices, event buses, CQRS) unless a later PAS document justifies a change against these principles.

### Non-goals

| Non-goal | Why excluded |
|---|---|
| Microservices | Premature distribution for a small team and an evolving monolith |
| Kubernetes-first architecture | Operational overhead without current scale justification |
| Kafka / heavy event backbone | Complexity not required for the modular monolith path |
| Event Sourcing | Overbuilds audit needs already addressable with simpler audit logs |
| CQRS by default | Split models add cost without a proven read/write pressure problem |
| Distributed AI infrastructure | Out of proportion to current OCR/ML/NLP stack and team size |
| Massive ERP / platform sprawl | Dilutes the document-intelligence product boundary |

### Success criteria

The product is on a credible SaaS path when:

- Security and authorization gaps identified in the audit are closed as product requirements (mechanics in later PAS docs)
- Schema evolution is deliberate and repeatable (owned by PAS-03 / PAS-06)
- User and admin portals exist and match the public vs authenticated surface model
- AI outcomes are trustworthy in practice, with a clear human-in-the-loop path
- An ops baseline exists (health, logging, deployable path)—details in PAS-06

These are outcome criteria, not runbooks.

## Out of Scope

| Topic | Owner |
|---|---|
| System topology, storage, API versioning, job infrastructure | [02-system-architecture.md](./02-system-architecture.md) |
| Domain model, RBAC, tokens, Alembic | [03-domain-data-and-security.md](./03-domain-data-and-security.md) |
| Pipeline stages, confidence policy, workflow semantics | [04-ai-pipeline-and-workflows.md](./04-ai-pipeline-and-workflows.md) |
| Frontend IA, routing, client stack usage | [05-frontend-experience.md](./05-frontend-experience.md) |
| Phased delivery, CI/CD, Compose, observability runbooks | [06-engineering-and-operations.md](./06-engineering-and-operations.md) |

## Assumptions

- The existing FastAPI-based prototype remains the evolution base (see audit).
- The product is a single SaaS offering, not a multi-product suite.
- Delivery and operations are owned by a small team (approximately 1–3 engineers).
- The destination is a production-ready SaaS, not a permanent educational demo.

## Dependencies

| Type | Reference |
|---|---|
| Hard | None (root PAS document) |
| Standards | [DOCUMENTATION_STANDARDS.md](./DOCUMENTATION_STANDARDS.md), [README.md](./README.md) |
| Current-state context | [AUDIT_REPORT.md](../audit/AUDIT_REPORT.md) |

## Context

Per [AUDIT_REPORT.md](../audit/AUDIT_REPORT.md), the repository today is an early-stage FastAPI backend with a working happy path for authentication, document upload, and an OCR → classification → extraction pipeline, plus partial review, notification, and approval concepts. There is no functional frontend. Production-readiness claims in existing README material are not supported by the audited implementation. This document does not restate audit findings; it uses that posture as the starting point for product evolution.

## Architecture Decisions

### ADR-01-001: Evolve existing system; no greenfield rewrite

| Field | Value |
|---|---|
| Decision ID | ADR-01-001 |
| Decision | Evolve the existing audited system into the SaaS product; do not discard it for a greenfield rewrite |
| Context | A substantial backend prototype already implements the core document-processing happy path. A rewrite would delay SaaS outcomes and discard proven structure |
| Alternatives Considered | Greenfield rewrite; freeze prototype and build a parallel product; evolve in place |
| Trade-offs | Evolution carries technical debt that must be paid deliberately; rewrite offers a “clean” start at high cost and risk |
| Reasoning | The audit shows workable foundations (layered FastAPI app, pipeline concept). Principles favor preserving value and migrating intentionally via later PAS docs |
| Status | Accepted |
| Owner | Architecture |

**Supersedes:** —

### ADR-01-002: Modular Monolith architecture

| Field | Value |
|---|---|
| Decision ID | ADR-01-002 |
| Decision | The product architecture is a Modular Monolith: one backend application and one frontend application with clear internal module boundaries |
| Context | The team is small; the current system is already a single backend app. Premature distribution would increase cost without proven need |
| Alternatives Considered | Microservices; serverless-only composition; modular monolith |
| Trade-offs | A monolith can become tangled if modules are not respected; microservices add ops and consistency cost the team cannot justify yet |
| Reasoning | Matches current shape, small-team maintainability, and PAS non-goals that reject microservices/K8s/Kafka-first designs. Module boundaries are specified in PAS-02 |
| Status | Accepted |
| Owner | Architecture |

**Supersedes:** —

### ADR-01-003: Human-in-the-loop as core product principle

| Field | Value |
|---|---|
| Decision ID | ADR-01-003 |
| Decision | Human oversight of AI outcomes is a core product principle, not an optional add-on |
| Context | Document processing affects business decisions (finance, HR, compliance-adjacent data). Blind trust in OCR/ML/NLP is unacceptable as product posture |
| Alternatives Considered | Fully autonomous processing; human review only for admins; human-in-the-loop as default product principle |
| Trade-offs | Human review adds latency and UX cost; full autonomy is faster but erodes trust and increases error impact |
| Reasoning | Aligns mission (reliable, reviewable outcomes) and capability themes. Confidence thresholds and workflow gates are owned by PAS-04; this ADR locks the product principle only |
| Status | Accepted |
| Owner | Product / Architecture |

**Supersedes:** —

### ADR-01-004: Production readiness over feature expansion

| Field | Value |
|---|---|
| Decision ID | ADR-01-004 |
| Decision | Production readiness and correctness take priority over rapid feature expansion |
| Context | The audit shows authorization gaps, missing migrations, absent tests/ops, and no frontend—while marketing text overstated readiness |
| Alternatives Considered | Feature-first growth; marketing-led roadmap; readiness-and-correctness-first evolution |
| Trade-offs | Slower visible feature velocity in the short term; higher trust and lower rework risk |
| Reasoning | A SaaS product that cannot be secured, migrated, or operated is not a product. Later PAS docs and PAS-06 phasing execute this priority |
| Status | Accepted |
| Owner | Product / Architecture |

**Supersedes:** —

## Current → Recommended → Migration

### Current

Educational / prototype product posture: backend happy path exists; no product UI; production claims overstated relative to the audit.

### Recommended

Commercial SaaS product vision bounded by this document’s principles, personas, surfaces, and non-goals—evolving the existing system rather than replacing it.

### Migration

Treat PAS-02 through PAS-06 as the architecture sequence and PAS-06 as the owner of phased delivery and definition of done. Do not greenfield-rewrite to “start over.” Technical migration steps (storage, auth, pipeline fixes, deployment) are out of scope for PAS-01 and must not be specified here.

## Risks

| Risk | Mitigation direction |
|---|---|
| Scope creep into ERP/DMS territory | Enforce product boundaries and non-goals in review of later PAS docs |
| Principle drift under feature pressure | ADR-01-004; require major-version PAS changes to reverse Accepted ADRs |
| “Human-in-the-loop” becomes checkbox-only | PAS-04 must define actionable review gates; PAS-05 must surface them |
| Evolution stalls under unresolved debt | PAS-06 phases must prioritize readiness gaps called out by the audit |

## Trade-offs

| Choice | Benefit | Cost |
|---|---|---|
| ADR-01-001 Evolve | Faster path to SaaS using existing value | Must pay down debt deliberately |
| ADR-01-002 Modular Monolith | Operable by a small team; fits current shape | Requires discipline to keep modules clean |
| ADR-01-003 Human-in-the-loop | Trust and accountability | Latency and UX complexity |
| ADR-01-004 Readiness first | Credible production path | Slower feature theater |

## Future Considerations

Extension points only—no designs here:

- Multi-tenancy / organizations (product scope note; domain in PAS-03)
- Billing (product + later domain/ops)
- Deeper analytics and search
- Broader document-type catalog (pipeline ownership in PAS-04)
- External integrations (boundaries in PAS-02)

## Frozen Decisions

Checklist of Decision IDs locked by this Frozen document:

- [x] ADR-01-001 — Evolve existing system; no greenfield rewrite
- [x] ADR-01-002 — Modular Monolith architecture
- [x] ADR-01-003 — Human-in-the-loop as core product principle
- [x] ADR-01-004 — Production readiness over feature expansion

## Changelog

| Date | Version | Summary |
|---|---|---|
| 2026-08-02 | 0.1.0 | Initial draft for architectural review |
| 2026-08-02 | 1.0.0 | Official freeze after architectural review approval |
