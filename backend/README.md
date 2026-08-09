# Smart Document Workflow AI — Backend

![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-Framework-009688.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue.svg)
![Status](https://img.shields.io/badge/Status-P3%20Harden%20and%20Scale-yellow)

FastAPI backend for OCR → classify → extract → human review → gated workflow automation.

Architecture: **PAS 1.0.0** (Frozen). Delivery: [docs/IMPLEMENTATION_ROADMAP.md](../docs/IMPLEMENTATION_ROADMAP.md). Current phase: **P3 Harden and scale**.

---

## Stack

- FastAPI + Uvicorn, versioned API under `/api/v1`
- PostgreSQL + SQLAlchemy + Alembic
- Access JWT + rotating refresh tokens
- Storage adapter (`local` or `supabase`)
- In-process job enqueue boundary ([queue deferred](../docs/ops/QUEUE_DEFERRAL.md) until ADR-02-004 triggers)
- Structured JSON logs + correlation IDs; optional Sentry (`SENTRY_DSN`)
- Optional transactional email via Resend (`RESEND_API_KEY`)
- pytesseract / spaCy / scikit-learn classifier

### Email notifications (Resend)

When both `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are set, Resend is used for:

1. **Document processed** emails to the document owner (pipeline or verified admin approval → `processed`)
2. **Admin login OTP** emails to `ADMIN_OTP_EMAIL` (falls back to `ADMIN_EMAIL`)

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | API key from the Resend dashboard |
| `RESEND_FROM_EMAIL` | Verified sender, e.g. `Smart Docs <noreply@yourdomain.com>` |
| `ADMIN_OTP_EMAIL` | Destination for admin login verification codes |

**Admin login:** password success for `role=admin` returns `{ requires_otp, challenge_id, otp_destination }` (no tokens). Complete with `POST /api/v1/auth/admin/verify-otp` or resend via `POST /api/v1/auth/admin/resend-otp`. Non-admin login is unchanged.

**Local / Render:** set Resend vars plus `ADMIN_OTP_EMAIL` (e.g. `hanzlamaan125@gmail.com`). Do not commit keys.

### Sentry (error tracking)

When `SENTRY_DSN` is set, the API initializes Sentry before the FastAPI app starts (error events + logging breadcrumbs; `send_default_pii=False`; tracing sample rate from `SENTRY_TRACES_SAMPLE_RATE`, default `0.1`). `SENTRY_ENVIRONMENT` labels events (e.g. `local`, `staging`, `production`).

| Variable | Purpose |
|---|---|
| `SENTRY_DSN` | Project DSN from Sentry (required to enable; leave unset to disable) |
| `SENTRY_ENVIRONMENT` | Environment tag (default `local`) |
| `SENTRY_TRACES_SAMPLE_RATE` | Performance tracing sample rate (default `0.1`) |
| `SENTRY_ENABLE_DEBUG_ENDPOINT` | When `true`, mounts `GET /sentry-debug` which raises a test exception |

Controlled verification (local/staging only):

1. Set `SENTRY_DSN` and `SENTRY_ENABLE_DEBUG_ENDPOINT=true`.
2. Restart the API, then `GET /sentry-debug` (expects HTTP 500).
3. Confirm the event in the Sentry project Issues view.
4. Set `SENTRY_ENABLE_DEBUG_ENDPOINT=false` (or remove the route) after verification — do not leave it enabled in production.

On Render: add `SENTRY_DSN` (and optionally `SENTRY_ENVIRONMENT=production`) as environment variables; do not commit the DSN.

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
- Liveness: `GET /live` · Readiness: `GET /ready` (DB + storage config; `/health` is an alias)
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
| Auth | `POST /api/v1/auth/register`, `login`, `refresh`, `logout`, `GET /me` | Users get tokens on login; admins get OTP challenge then `admin/verify-otp`; auth routes rate-limited |
| Auth (admin OTP) | `POST /api/v1/auth/admin/verify-otp`, `admin/resend-otp` | Issues tokens only after OTP; resend invalidates prior challenge |
| Documents | `POST /upload`, `GET /my`, `GET /{id}`, `DELETE /{id}` | Owner (or admin for get/delete); lists paginated |
| Documents | `GET /`, `GET /pending`, approve/reject | Admin; lists paginated |
| Review | `GET /document/{id}`, `PUT /document/{id}/fields`, `PUT /field/{id}` | Owner or admin; bulk verify preferred |
| Notifications | `GET /`, `POST /{id}/read` | Own notifications; includes `document_id` when set |
| Probes | `GET /live`, `/ready`, `/health` | Unversioned |
| Sentry (opt-in) | `GET /sentry-debug` | Only when `SENTRY_ENABLE_DEBUG_ENDPOINT=true` |

List responses: `{ items, total, page, page_size, pages }` with `page` / `page_size` query params.

Set `CORS_ORIGINS` (comma-separated) for the Next.js origin (default `http://localhost:3000`).
Ops: [backup/restore](../docs/ops/BACKUP_RESTORE.md), [queue deferral](../docs/ops/QUEUE_DEFERRAL.md), [upload/concurrency capacity](../docs/ops/UPLOAD_CAPACITY.md).

---

## Layout

```text
backend/
├── alembic/versions/     # 001 baseline, 002 refresh_tokens, 003 notification document_id
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
