# Smart Document Workflow AI — Backend

![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-Framework-009688.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue.svg)
![Status](https://img.shields.io/badge/Status-P2%20Product%20Surfaces-yellow)

FastAPI backend for OCR → classify → extract → human review → gated workflow automation.

Architecture: **PAS 1.0.0** (Frozen). Delivery: [docs/IMPLEMENTATION_ROADMAP.md](../docs/IMPLEMENTATION_ROADMAP.md). Current phase: **P2 Product surfaces** (Next.js FE consumes `/api/v1`).

---

## Stack

- FastAPI + Uvicorn, versioned API under `/api/v1`
- PostgreSQL + SQLAlchemy + Alembic
- Access JWT + rotating refresh tokens
- Storage adapter (`local` or `supabase`)
- In-process job enqueue boundary (queue worker later / P3)
- pytesseract / spaCy / scikit-learn classifier

---

## Setup

```bash
cd backend
# Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # then edit secrets
alembic upgrade head
uvicorn app.main:app --reload
```

- Docs: `http://127.0.0.1:8000/docs`
- Health: `GET /health` (DB readiness)
- Canonical API: `/api/v1/...` (unversioned paths remain as temporary deprecated shims)

### Docker Compose (web + API + Postgres)

From repo root:

```bash
cp backend/.env.example backend/.env   # optional; Compose has defaults for local
docker compose up --build
```

Frontend: `http://localhost:3000` · API: `http://localhost:8000`

Seed an admin (ops only — never via public signup):

```bash
docker compose exec api python -m scripts.seed_admin
# or locally, with ADMIN_EMAIL / ADMIN_PASSWORD set:
python -m scripts.seed_admin
```

### Tests & lint

```bash
pytest -q
ruff check app tests scripts
```

CI runs lint, pytest, and Docker image build (`.github/workflows/ci.yml`).

### Storage

| `STORAGE_BACKEND` | Behavior |
|---|---|
| `local` (default) | Files under `UPLOAD_DIR` |
| `supabase` | Upload/download via Supabase Storage REST (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, bucket) |

---

## API surface (canonical)

| Area | Routes | Notes |
|---|---|---|
| Auth | `POST /api/v1/auth/register`, `login`, `refresh`, `logout`, `GET /me` | Login returns access + refresh |
| Documents | `POST /api/v1/documents/upload`, `GET /my` | Owner |
| Documents | `GET /`, `GET /pending`, approve/reject | Admin |
| Review | `GET /api/v1/review/document/{id}`, `PUT /field/{id}` | Owner or admin |
| Notifications | `GET /api/v1/notifications/`, `POST /{id}/read` | Own notifications |
| Health | `GET /health` | Unversioned |

Set `CORS_ORIGINS` (comma-separated) for the Next.js origin (default `http://localhost:3000`).

---

## Layout

```text
backend/
├── alembic/versions/     # 001 baseline, 002 refresh_tokens
├── app/
│   ├── api/v1/           # /api/v1 mount
│   ├── core/             # config, security, authz
│   ├── models/           # includes refresh_token
│   ├── routes/
│   └── services/         # pipeline, storage/, jobs
├── scripts/seed_admin.py
├── tests/
├── Dockerfile
└── .env.example
```
