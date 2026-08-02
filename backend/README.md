# Smart Document Workflow AI — Backend

![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-Framework-009688.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue.svg)
![Status](https://img.shields.io/badge/Status-P0%20Stabilize-yellow)

FastAPI backend for OCR → classify → extract → human review → gated workflow automation.

Architecture and delivery phases are defined by **PAS 1.0.0** (Frozen). This service is under **P0 Stabilize** — not production-ready SaaS. See [docs/IMPLEMENTATION_ROADMAP.md](../docs/IMPLEMENTATION_ROADMAP.md).

---

## Stack

- FastAPI + Uvicorn
- PostgreSQL + SQLAlchemy
- Alembic (sole schema path for shared/deployed environments)
- JWT access tokens (refresh tokens planned in P1)
- pytesseract / pdf2image / Pillow (OCR)
- scikit-learn classifier + spaCy extraction

---

## Setup

```bash
cd backend
# Prefer the existing local env:
# Windows: venv\Scripts\activate
# Or create one: python -m venv venv
pip install -r requirements.txt
```

Create `.env` (never commit secrets):

```env
SECRET_KEY=change-me
DATABASE_URL=postgresql://user:pass@localhost:5432/smart_docs
UPLOAD_DIR=./uploads
CONFIDENCE_THRESHOLD=0.70
# Optional override; default is backend/document_classifier.pkl
# MODEL_PATH=./document_classifier.pkl
```

### Database (Alembic)

```bash
alembic upgrade head
```

Do **not** rely on `Base.metadata.create_all()` for production. The optional `python -m app.db.init_db` helper is local convenience only.

If you already created tables with `create_all` and they match the models:

```bash
alembic stamp head
```

### Run

```bash
uvicorn app.main:app --reload
```

- API docs: `http://127.0.0.1:8000/docs`
- Health (DB readiness): `GET /health` → `200` only when DB is reachable

### Tests

```bash
pytest -q
```

CI runs the same suite on push/PR (see `.github/workflows/ci.yml`).

### Classifier artifact

Train from the backend directory:

```bash
python ml/train_model.py
```

Writes `document_classifier.pkl` next to the backend root (path resolved via config, not process CWD at runtime).

---

## Current API surface (unversioned; `/api/v1` arrives in P1)

| Area | Routes | Authz notes |
|---|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` | Register creates `user` only |
| Documents | `POST /documents/upload`, `GET /documents/my` | Authenticated owner |
| Documents | `GET /documents/`, `GET /documents/pending`, approve/reject | **Admin only** |
| Review | `GET /review/document/{id}`, `PUT /review/field/{id}` | Owner or admin |
| Health | `GET /health` | Public; DB check |

Notification **emission** is implemented in the pipeline/approval/workflow paths. List/mark-read HTTP APIs are planned with the P2 frontend.

---

## P0 status (this branch)

| Item | Status |
|---|---|
| Authz on review + admin approve/reject | Done |
| Alembic baseline; no prod `create_all` on import | Done |
| Workflow after verify + approval gates; re-check path | Done |
| Configurable confidence; empty OCR → needs_review | Done |
| Deterministic model path | Done |
| Status-accurate notification events | Done |
| `/health` with DB check | Done |
| Critical authz + gate tests in CI | Done |
| Refresh tokens, Compose, `/api/v1`, Next.js | Later phases (P1–P2) |

---

## Project layout

```text
backend/
├── alembic/              # Migrations (baseline 001)
├── app/
│   ├── core/             # config, security, authz deps
│   ├── db/               # session, base, init helper
│   ├── models/
│   ├── routes/
│   ├── schemas/
│   └── services/         # OCR, classify, extract, pipeline, gates, notify
├── ml/                   # Training script + dataset
├── tests/
├── document_classifier.pkl
└── requirements.txt
```
