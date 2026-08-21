# Smart Document Workflow

AI-assisted document processing with a mandatory human-in-the-loop: upload → OCR → classify → extract → review → gated approval.

Product name in the UI: **Smart Document Workflow**. Architecture docs also use **Smart Document Workflow AI**.

## Quick start

```bash
cp backend/.env.example backend/.env   # set SECRET_KEY at minimum
docker compose up --build
```

- Web: http://localhost:3000
- API: http://localhost:8000 · OpenAPI: http://localhost:8000/docs
- Seed admin (ops only): `docker compose exec api python -m scripts.seed_admin`

Per-package setup: [backend/README.md](./backend/README.md) · [frontend/README.md](./frontend/README.md)

## Documentation

| Document | Role |
|---|---|
| [PRODUCT.md](./PRODUCT.md) | Product requirements (highest decision authority) |
| [DESIGN.md](./DESIGN.md) | Visual system — The Review Docket |
| [CURSOR_WORKFLOW.md](./CURSOR_WORKFLOW.md) | AI-assisted frontend workflow (Emil → Impeccable → TasteSkill) |
| [docs/README.md](./docs/README.md) | Docs index, PAS status, ops runbooks |
| [docs/pas/README.md](./docs/pas/README.md) | Product Architecture Specification (**Frozen 1.0.0**) |
| [docs/IMPLEMENTATION_ROADMAP.md](./docs/IMPLEMENTATION_ROADMAP.md) | Delivery phases (P0–P3) |
| [docs/audit/AUDIT_REPORT.md](./docs/audit/AUDIT_REPORT.md) | Audited codebase baseline |
| [backend/README.md](./backend/README.md) | FastAPI API, env, tests |
| [frontend/README.md](./frontend/README.md) | Next.js app, scripts, frontend workflow |

### Decision authority (UI / AI)

When product, design, and skill-pack advice conflict: **PRODUCT.md → DESIGN.md → CURSOR_WORKFLOW.md → Emil → Impeccable → TasteSkill**. A lower-priority skill must not override a higher-priority document. Details: [CURSOR_WORKFLOW.md](./CURSOR_WORKFLOW.md#decision-authority).

## Stack

- **Backend:** FastAPI, PostgreSQL, SQLAlchemy, Alembic
- **Frontend:** Next.js App Router, TypeScript, Tailwind, ShadCN/Radix
- **Local stack:** Docker Compose (web + API + Postgres)

## Releases

See [CHANGELOG.md](./CHANGELOG.md) for notable changes by version.
