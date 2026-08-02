# Appendix C — Architecture Diagram Index

| Field | Value |
|---|---|
| Status | Frozen |
| Version | 1.0.0 |
| Last Updated | 2026-08-02 |
| Diagrams root | [docs/architecture/diagrams/](../../architecture/diagrams/) |

Index of architecture diagrams. Prefer Mermaid sources in `docs/architecture/diagrams/`; static exports may live under `docs/architecture/assets/`.

| Diagram name | Path | Owning doc | Notes |
|---|---|---|---|
| System context | [pas-02-system-context.mmd](../../architecture/diagrams/pas-02-system-context.mmd) | [02](../02-system-architecture.md) | Browser → Next.js → FastAPI → PG / Storage / Jobs |
| Backend layers | [pas-02-backend-layers.mmd](../../architecture/diagrams/pas-02-backend-layers.mmd) | [02](../02-system-architecture.md) | Presentation → Application → Domain → Infrastructure |
| Request flow | [pas-02-request-flow.mmd](../../architecture/diagrams/pas-02-request-flow.mmd) | [02](../02-system-architecture.md) | Sequence for REST upload/process path |
| Domain ownership | [pas-03-domain-ownership.mmd](../../architecture/diagrams/pas-03-domain-ownership.mmd) | [03](../03-domain-data-and-security.md) | User / Document / Field / Notification / Log |
| Document processing status | [pas-03-document-status.mmd](../../architecture/diagrams/pas-03-document-status.mmd) | [03](../03-domain-data-and-security.md) | Processing status state machine |
| Pipeline stages | [pas-04-pipeline-stages.mmd](../../architecture/diagrams/pas-04-pipeline-stages.mmd) | [04](../04-ai-pipeline-and-workflows.md) | OCR → classify → extract → gates → workflow |
| FE surface map | [pas-05-surface-map.mmd](../../architecture/diagrams/pas-05-surface-map.mmd) | [05](../05-frontend-experience.md) | Marketing / auth / user / admin shells |
| FE auth routing | [pas-05-auth-routing.mmd](../../architecture/diagrams/pas-05-auth-routing.mmd) | [05](../05-frontend-experience.md) | Login redirect, BFF refresh cookie, role routing |
| Delivery phases | [pas-06-delivery-phases.mmd](../../architecture/diagrams/pas-06-delivery-phases.mmd) | [06](../06-engineering-and-operations.md) | P0 → P1 → P2 → P3 |
| CI/CD outline | [pas-06-ci-cd.mmd](../../architecture/diagrams/pas-06-ci-cd.mmd) | [06](../06-engineering-and-operations.md) | PR gates through production deploy |

## Changelog

| Date | Version | Summary |
|---|---|---|
| 2026-08-01 | 0.1.0 | Stub created as part of PAS structure freeze |
| 2026-08-02 | 0.2.0 | Indexed PAS-02 Mermaid diagrams |
| 2026-08-02 | 0.3.0 | Indexed PAS-03 domain ownership and status diagrams |
| 2026-08-02 | 0.4.0 | Indexed PAS-04 pipeline stages diagram |
| 2026-08-02 | 0.5.0 | Indexed PAS-05 surface map and auth routing diagrams |
| 2026-08-02 | 0.6.0 | Indexed PAS-06 delivery phases and CI/CD diagrams |
| 2026-08-02 | 1.0.0 | Official PAS freeze — diagram index locked with core set |
