# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary — End User:** an employee or operator inside an organization. They open the product to upload business documents, review extracted and classified information, resolve processing issues, and complete assigned document-review workflows. Industry vertical is not specified; the job is mixed organizational document processing, not a single domain.

**Secondary — Administrator:** oversees documents and approvals across users, maintains platform integrity, and acts on the pending-approval queue. Administrators are seeded; there is no public admin signup. User-management consoles are not a shipped surface.

## Product Purpose

Turn uploaded documents into reliable, reviewable structured outcomes with auditable automation. Success means users can trust classified types and extracted fields, or clearly know when they cannot, and that low-confidence or policy-gated outcomes take a human path before business action.

## Positioning

AI-assisted document processing with a mandatory human-in-the-loop: classification and extraction accelerate work; humans remain responsible when confidence or policy requires it. This is not a full ERP, general-purpose DMS/ECM, content collaboration suite, or enterprise integration bus.

## Operating Context

Operators work at a desk or on a laptop/phone browser. Typical loop: authenticate → upload a PDF or image → wait for OCR, classification, and field extraction → verify or correct fields when the document needs review → receive notifications → (admins) approve or reject. Processing statuses include `uploaded`, `processing`, `processed`, `needs_review`, and `failed`. Approval is a separate business decision (`pending` / `approved` / `rejected`). Confidence default threshold is 0.70. MVP document types in the architecture are Resume, Invoice, and Form; the product does not assume a single industry.

## Capabilities and Constraints

Confirmed in the running product and frozen PAS:

- Modular monolith: FastAPI backend, Next.js App Router frontend, PostgreSQL as system of record
- Authentication and authorization: shared login; user-only public registration; server-enforced RBAC (`user` / `admin`); in-memory access token and httpOnly refresh via Next.js BFF
- Document ingest (upload), asynchronous processing, OCR, classification, NLP field extraction
- Human-in-the-loop field review and admin approve/reject
- Notifications tied to processing and decision events
- Type-routed workflow after field verification and approval gates (architecture); do not treat later placeholders (payment queues, candidate pipelines) as shipped product
- Public marketing surfaces (landing, features, pricing, about, illustrative dashboard preview) plus authenticated user and admin portals

Explicitly not binding until they exist in the product: multi-tenancy/organizations, billing, SSO, multi-agent AI, RAG, vector databases, real-time notification transport, offline resume of uploads.

## Brand Commitments

- Product name in the UI: **Smart Document Workflow**. Architecture docs also use **Smart Document Workflow AI**.
- Voice: operational, accountable, plain. Copy names the action (upload, verify, approve) and the failure (uncertain classification, not found, offline).
- Incumbent interface (do not treat as a redesign brief): navy ink, paper surfaces, gold accent; Fraunces display + Source Sans 3. This is a light paper system, not a dark-tech skin.
- PAS-05: no decorative “AI purple glow,” emoji-driven UI, or status communicated by color alone.

## Evidence on Hand

- Frozen PAS 1.0.0 under `docs/pas/` (vision, architecture, domain/security, pipeline, frontend, ops)
- Implementation roadmap and ops runbooks under `docs/`
- Marketing Dashboard Preview is labeled illustrative; do not present it as live customer data
- No customer testimonials, case studies, press, or pricing proof exist — do not fabricate them

## Product Principles

1. Humans verify when stakes or confidence demand it; automation does not silently become a business decision.
2. Evolve the existing system; production correctness outranks feature theater.
3. End users and administrators get distinct, purposeful portals after a shared login.
4. Extraction must be reviewable: show status, confidence, and a path to correct fields.
5. Do not expand into ERP, DMS, or speculative AI platforms until those capabilities are real.

## Accessibility & Inclusion

PAS-05 baseline: keyboard-reachable primary flows (login, upload, review, approve); Radix/ShadCN primitives for dialogs and forms; portals usable on mobile (admin tables may scroll rather than hide actions); status paired with text labels, not color alone. No separate WCAG certification target was confirmed.
