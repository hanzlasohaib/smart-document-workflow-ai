# PROJECT AUDIT REPORT — Smart Document Workflow AI

> This report is based exclusively on the code present in the repository at the time of audit (backend Python source, Alembic config, ML assets, and repository metadata). No planned or documented-only features are described as implemented unless verified in code. The `frontend/` directory exists as an empty folder (all prior Vite scaffold files are deleted from disk and pending deletion in git); therefore **there is no functional frontend** in this repository.

---

# 1. Project Overview

**Purpose:** A FastAPI backend that lets a user upload a document (PDF/image), runs it through an automated pipeline (OCR → ML classification → NLP field extraction → notification/audit logging → optional workflow trigger), and exposes endpoints for authentication, document upload/listing, approval/rejection, and reviewing extracted fields.

**Current architecture:** A single FastAPI application (`backend/app`) organized into `core`, `db`, `models`, `schemas`, `routes`, and `services` layers. Processing is triggered synchronously inside a FastAPI `BackgroundTasks` callback (in-process, not a real task queue). Persistence is PostgreSQL via SQLAlchemy ORM. There is no frontend, no containerization, and no automated tests.

**Tech stack (as installed in `backend/requirements.txt`):**
- **Web framework:** FastAPI 0.128.3, Uvicorn, Starlette
- **ORM/DB:** SQLAlchemy 2.0.46, psycopg2-binary (PostgreSQL driver), Alembic 1.18.4 (installed but not actually used for migrations — see §3)
- **Auth:** python-jose (JWT), passlib + bcrypt (password hashing)
- **Validation:** Pydantic v2, pydantic-settings
- **OCR:** pytesseract, pdf2image, Pillow
- **ML:** scikit-learn 1.8.0, pandas, joblib
- **NLP:** spaCy 3.8.14 with `en_core_web_sm` model

**Major frameworks:** FastAPI, SQLAlchemy, scikit-learn, spaCy.

**Current maturity level:** Early-stage / prototype backend. Core happy-path flows (register, login, upload, background pipeline, approve/reject, view extracted fields) are implemented and appear runnable, but there is no test suite, no migrations, no containerization, several authorization gaps, and a table-creation strategy that is fragile (see §3, §16, §22). The README describes the project as "Production Ready," but the actual code does not support that claim (no Docker, no CI/CD, no tests, no proper migrations, incomplete auth checks, missing endpoints that the README documents).

**High-level implementation status:**
| Area | Status |
|---|---|
| Auth (register/login/JWT) | Implemented |
| Document upload | Implemented |
| OCR | Implemented |
| ML classification | Implemented |
| NLP extraction (Resume/Invoice/Form) | Implemented |
| Approval workflow (approve/reject) | Implemented, but not authorization-scoped |
| Automation/workflow triggers | Implemented as `print()` stubs only |
| Notifications | Data model + creation only; no API to read/mark-read |
| Human review of fields | Partially implemented; unauthenticated endpoints |
| Migrations | Scaffolded, unused (no revisions exist) |
| Frontend | Not implemented (empty folder) |
| Tests, Docker, CI/CD | Not implemented |

---

# 2. Folder Structure

```
Smart-Document-Workflow-AI/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app instance, router registration, root route
│   │   ├── core/
│   │   │   ├── config.py            # Pydantic-settings based env config
│   │   │   ├── security.py          # Password hashing, JWT creation/decoding, get_current_user
│   │   │   └── deps.py              # DUPLICATE/dead copy of auth deps (see §22) — unused, and broken if imported
│   │   ├── db/
│   │   │   ├── base.py              # SQLAlchemy declarative Base
│   │   │   ├── session.py           # Engine/SessionLocal + calls Base.metadata.create_all() at import time
│   │   │   ├── deps.py              # get_db() FastAPI dependency
│   │   │   ├── models.py            # Re-imports only User + Document (incomplete, see §3)
│   │   │   └── init_db.py           # Standalone script: imports app.models (all 5) then create_all()
│   │   ├── models/                  # SQLAlchemy ORM models: user, document, extracted_field, notification, automation_log
│   │   ├── schemas/                 # Pydantic schemas: user, document, extracted_field (no schemas for notification/automation_log)
│   │   ├── routes/                  # auth.py, documents.py, review.py (no notifications route despite model existing)
│   │   └── services/                # ocr_service, classification_service, extraction_service, automation_service, document_pipeline_service
│   ├── ml/
│   │   ├── train_model.py           # Trains TF-IDF + LogisticRegression classifier
│   │   └── dataset.csv              # 91-row synthetic training dataset (Invoice/Resume/Form)
│   ├── alembic/
│   │   ├── env.py                   # `target_metadata = None` — autogenerate is not wired to the models
│   │   ├── script.py.mako
│   │   └── versions/                # Does not exist — zero migration revisions have ever been generated
│   ├── uploads/                     # Runtime upload storage; contains real test PDFs (gitignored)
│   ├── document_classifier.pkl      # Trained model artifact, committed to git at backend/ root
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── .env                         # Local secrets (gitignored, not committed)
│   └── README.md
├── frontend/                        # Empty directory; all files deleted from working tree (uncommitted deletion in git status)
└── PLAN.md                          # This audit's instruction prompt
```

**Folders explicitly called out by the audit template that do NOT exist in this codebase:** `app/utils/`, `app/ml/` (ML lives at `backend/ml/`, outside `app/`), `configs/`, `scripts/`, `docs/`. There is also no `app/workflows/` or `app/notifications/` package despite the README's project-structure diagram claiming they exist — that logic instead lives inline in `services/automation_service.py` and the `models/notification.py` model, respectively.

---

# 3. Database

**ORM:** SQLAlchemy 2.0 declarative models, one `Base` (`app/db/base.py`) shared across all models.

### Tables (from `app/models/*.py`)

**`users`** (`app/models/user.py`)
- `id` PK, `name` (String, NOT NULL), `email` (String, unique, indexed, NOT NULL), `hashed_password` (String, NOT NULL), `role` (String, default `"user"`), `is_active` (Boolean, default `True`)
- Relationship: `documents` (one-to-many to `Document`, `cascade="all, delete"`)

**`documents`** (`app/models/document.py`)
- `id` PK, `user_id` (FK → `users.id`, NOT NULL), `original_filename`, `stored_filename`, `file_path` (all String, NOT NULL), `upload_date` (DateTime, default `utcnow`), `status` (String, default `"uploaded"`), `document_type` (String, nullable), `confidence_score` (Float, nullable), `raw_text` (Text, nullable), `approval_status` (String, default `"pending"`)
- Relationship: `user` (many-to-one back-populated from `User.documents`)

**`extracted_fields`** (`app/models/extracted_field.py`)
- `id` PK, `document_id` (FK → `documents.id`), `field_name` (String, NOT NULL), `field_value` (String, nullable), `is_verified` (Boolean, default `False`)
- Relationship: `document` via `backref="extracted_fields"`

**`notifications`** (`app/models/notification.py`)
- `id` PK, `user_id` (FK → `users.id`), `title` (String, NOT NULL), `message` (String, NOT NULL), `created_at` (DateTime, default `utcnow`), `is_read` (Boolean, default `False`)

**`automation_logs`** (`app/models/automation_log.py`)
- `id` PK, `document_id` (FK → `documents.id`), `action_type` (String, NOT NULL), `action_time` (DateTime, default `utcnow`), `status` (String, default `"success"`)

### Relationships
Only two relationships use `relationship()` with `back_populates`/`backref` navigability: `User ↔ Document`, and `Document ↔ ExtractedField`/`AutomationLog`/`Notification` are one-directional FKs with `backref` only on the "child" side (functional, but inconsistent style vs. `User`/`Document`).

### Constraints / Indexes
- Only `users.email` has an explicit `unique=True, index=True`. `users.id`, `documents.id`, `extracted_fields.id`, `notifications.id`, `automation_logs.id` are indexed via `primary_key=True, index=True` (documents/notifications/automation_logs PKs use `index=True` too, which is redundant with the PK index but harmless).
- No `CheckConstraint` for enum-like string fields (`role`, `status`, `approval_status`, `document_type`) — they are all free-form strings, not database enums, and not validated against ORM-level enums either. There are no true SQL/Python `Enum` types anywhere in the models.
- No unique constraint preventing duplicate `stored_filename`s beyond the UUID-prefixed naming convention used in the upload route.

### Migration strategy — **not actually functioning**
- Alembic is initialized (`alembic.ini`, `alembic/env.py`, `alembic/script.py.mako`) but:
  - `alembic/env.py` sets `target_metadata = None`, so `alembic revision --autogenerate` cannot detect model changes.
  - There is **no `alembic/versions/` directory and no migration revisions** in the repository.
  - Effective schema creation instead relies on `Base.metadata.create_all()`, called in two places:
    1. `app/db/session.py`, at **module import time** (side effect on every process start), after only importing `app/db/models.py` — which itself only imports `User` and `Document` (it does **not** import `ExtractedField`, `Notification`, or `AutomationLog`).
    2. `app/db/init_db.py`, a standalone script that imports the full `app/models` package (all 5 models) before calling `create_all()`.
- **Consequence (verified from import order in `main.py` → `routes/documents.py` → `db/deps.py` → `db/session.py`):** when the app is started directly via `uvicorn app.main:app` without first running `python -m app.db.init_db`, `create_all()` fires while only `users` and `documents` are registered on `Base.metadata`. The `ExtractedField`, `Notification`, and `AutomationLog` classes are only imported afterward (via `document_pipeline_service.py`), too late to be included in that `create_all()` call. Whether `extracted_fields`, `notifications`, and `automation_logs` tables exist in a given database depends entirely on whether `init_db.py` was run manually first — this is not guaranteed by any part of the app's own startup path. This is a real, verifiable schema-initialization bug, not a hypothetical one.
- **Missing migrations:** effectively all of them — there is no migration history at all for any table.

---

# 4. Authentication & Authorization

**JWT implementation:** `app/core/security.py` uses `python-jose` to encode/decode JWTs. `create_access_token()` embeds `sub` (user id) and `role`, with expiry from `settings.ACCESS_TOKEN_EXPIRE_MINUTES` (default 60). `get_current_user()` decodes the token, extracts `sub`, loads the `User` row, and raises `401` if the token is invalid or the user does not exist.

**Password hashing:** `passlib.context.CryptContext` with the `bcrypt` scheme (`hash_password`, `verify_password`).

**User model:** `role` is a plain string (`"user"` / `"admin"`) with no dedicated roles/permissions tables — there is no RBAC data model, just a string field.

**Roles / Permissions / RBAC:** Extremely minimal and **inconsistently enforced**:
- `GET /documents/` checks `current_user.role != "admin"` inline and returns `403` otherwise — the only place role is actually checked.
- `POST /documents/{id}/approve`, `POST /documents/{id}/reject`, and `GET /documents/pending` require only a valid logged-in user (any role) — **any authenticated user can approve or reject any other user's document**, not just admins, and not just document owners. This is an authorization gap, not a designed feature.
- `GET /review/document/{doc_id}` and `PUT /review/field/{field_id}` in `app/routes/review.py` have **no authentication dependency at all** — they are fully open endpoints, callable without a JWT, allowing any unauthenticated caller to read or modify any document's extracted field data. This is a significant, verifiable security gap.
- There is a `require_admin()` dependency defined in `app/core/deps.py`, but it is **dead code** — nothing in the codebase imports or uses `app.core.deps`. It is also **broken**: it imports `SECRET_KEY` and `ALGORITHM` directly from `app.core.security`, but `security.py` does not define those as module-level names (it only exposes `settings.SECRET_KEY` / `settings.ALGORITHM`), so importing `app.core.deps` would raise an `ImportError` if anything ever tried to use it.

**Dependencies:** `get_db` (`app/db/deps.py`), `get_current_user` (`app/core/security.py`) are the only auth-related dependencies actually wired into routes.

**Security middleware:** None. `main.py` registers no CORS middleware, no HTTPS redirection, no rate limiting, no security headers, and no global exception handlers.

**Missing security features:**
- No refresh tokens / token revocation / logout mechanism.
- No per-resource ownership checks on approve/reject (any user can act on any document).
- No authentication on the review endpoints at all.
- No CORS configuration (this will block/allow browser access unpredictably depending on client).
- No rate limiting or brute-force protection on `/auth/login`.
- No email verification, password reset, or account lockout.
- No input length/size limits on uploaded files (no max file size enforced in `upload_document`).

---

# 5. API

Grouped by router module, as actually implemented in code.

### `app/routes/auth.py` — prefix `/auth`

| Method | URL | Purpose | Auth required? | Roles required? | Request model | Response model |
|---|---|---|---|---|---|---|
| POST | `/auth/register` | Create a new user (rejects duplicate email) | No | — | `UserCreate` (`name`, `email`, `password`) | `UserOut` |
| POST | `/auth/login` | OAuth2 password flow login, returns JWT | No | — | `OAuth2PasswordRequestForm` (form-encoded `username`/`password`) | `Token` (`access_token`, `token_type`) |
| GET | `/auth/me` | Return the current authenticated user's profile | Yes | Any authenticated user | — | `UserOut` |

### `app/routes/documents.py` — prefix `/documents`

| Method | URL | Purpose | Auth required? | Roles required? | Request model | Response model |
|---|---|---|---|---|---|---|
| POST | `/documents/upload` | Upload a file, persist it to disk with a UUID-prefixed name, create a `Document` row, and schedule `process_document_pipeline` as a `BackgroundTasks` job | Yes | Any authenticated user | `multipart/form-data` file | `DocumentOut` |
| POST | `/documents/{id}/approve` | Set `approval_status = "approved"` | Yes | **None enforced** (any user, any document — bug, see §4) | — | Plain dict `{"message": "Document approved"}` |
| POST | `/documents/{id}/reject` | Set `approval_status = "rejected"` | Yes | **None enforced** (same bug) | — | Plain dict `{"message": "Document rejected"}` |
| GET | `/documents/pending` | List all documents with `approval_status == "pending"` (global, not scoped to the requester) | Yes | Any authenticated user | — | `List[DocumentOut]` |
| GET | `/documents/my` | List the current user's own documents | Yes | Any authenticated user | — | `List[DocumentOut]` |
| GET | `/documents/` | List all documents (admin only) | Yes | `role == "admin"` (enforced) | — | `List[DocumentOut]` |

### `app/routes/review.py` — prefix `/review`

| Method | URL | Purpose | Auth required? | Roles required? | Request model | Response model |
|---|---|---|---|---|---|---|
| GET | `/review/document/{doc_id}` | List all `ExtractedField` rows for a document | **No** (bug) | — | — | Raw ORM objects returned directly (no `response_model` declared) |
| PUT | `/review/field/{field_id}` | Update a field's value and mark it `is_verified = True` | **No** (bug) | — | `value: str` (query/body scalar param, not a Pydantic schema) | Plain dict `{"message": "Field updated"}` |

### Not implemented (present in the model layer or README, absent from routes)
- No `/notifications` routes exist despite the `Notification` model and README documentation claiming `GET /notifications/` and `PUT /notifications/{id}/read`.
- No dedicated automation-log query endpoints.
- No document delete/update endpoints.
- No user management endpoints beyond `register`/`login`/`me`.

---

# 6. AI Pipeline

The end-to-end pipeline is implemented as one function, `process_document_pipeline(document_id)` in `app/services/document_pipeline_service.py`, invoked via FastAPI `BackgroundTasks` from `POST /documents/upload`. Actual execution order in code:

1. Open a new DB session (`SessionLocal()`), load the `Document` row; if missing, log error and return.
2. Set `document.status = "processing"`, commit.
3. **OCR** — `run_ocr(document.file_path)` → sets `document.raw_text`.
4. **Classification** — `classify_text(text)` → sets `document.document_type` and `document.confidence_score`.
5. **Extraction** — `extract_fields(label, text)` returns a dict of field_name→value.
6. **Storage** — each extracted field is persisted as an `ExtractedField` row (`is_verified` defaults to `False`); commit.
7. **Confidence-based status** — if `confidence < 0.7`, `status = "needs_review"`, else `status = "processed"`; commit.
8. **Notifications** — a single `Notification` row is created (hardcoded title "Document Processed"); added to session (not committed independently — committed together with the automation log in the next step).
9. **Audit log** — an `AutomationLog` row is created with `action_type = f"{label} processed"`; commit (this commit persists both the notification and the log).
10. **Human review gate** — the code re-queries `document.extracted_fields` and only proceeds to workflow triggering if at least one field has `is_verified == True`. Since extraction just created all fields with `is_verified=False` by default, **this condition is never true on first pass** — workflow triggering only occurs if a human had already verified a field from a *previous* pipeline run on the same document, which cannot happen since documents are only processed once at upload time. In practice, `trigger_workflow()` is effectively unreachable under normal single-upload usage.
11. **Workflow** — `trigger_workflow(document)` (only reached per the caveat above) dispatches to one of three print-only stub functions based on `document_type`.

On any exception, the `except` block logs the error, rolls back, sets `document.status = "failed"` if the document was loaded, and commits that status change. The `finally` block always closes the session.

---

# 7. OCR

**Implementation:** `app/services/ocr_service.py`, single function `run_ocr(file_path)`.

**Supported file types:** Detected by filename suffix only — `.pdf` (case-insensitive) is converted page-by-page to images via `pdf2image.convert_from_path` and OCR'd with `pytesseract.image_to_string`; anything else is opened directly with `PIL.Image.open` and OCR'd the same way. This means any non-PDF extension (png, jpg, jpeg, etc., but also arbitrary/garbage extensions) is naively handed to `PIL.Image.open`, which will raise an exception for non-image files rather than being explicitly validated/rejected up front.

**Libraries:** `pytesseract`, `pdf2image` (requires an external Poppler binary on the host, not verified/installed by this repo), `Pillow`.

**Workflow:** Upload → OCR called synchronously inside the background task → concatenated OCR text stored in `Document.raw_text`.

**Limitations (as implemented):**
- No image pre-processing (deskew, denoise, binarization, DPI enforcement) — raw OCR only.
- No language configuration (uses Tesseract's default language).
- No file-type validation before attempting OCR — errors surface as pipeline failures rather than clean user-facing validation errors.
- No page count / file size limits — a large multi-page PDF is processed synchronously within the background task, which can block the worker thread for a long time (see §11).
- No OCR confidence score is captured/stored.

---

# 8. Machine Learning

**Dataset:** `backend/ml/dataset.csv`, 91 rows total, 2 columns (`text`, `label`). Labels: `Invoice` (~30 rows), `Resume` (~30 rows), `Form` (~31 rows). All text samples are short, synthetic, hand-written sentences describing document content — they are **not real OCR output**, meaning the classifier is trained on clean, idealized text rather than noisy OCR text it will see in production.

**Training process:** `backend/ml/train_model.py` — loads the CSV with pandas, splits 80/20 with `train_test_split(..., stratify=y, random_state=42)`, trains an sklearn `Pipeline` (`TfidfVectorizer(stop_words="english")` → `LogisticRegression(max_iter=1000)`), prints accuracy and a classification report, and saves the fitted pipeline via `joblib.dump(model, "document_classifier.pkl")`. This is a manual, one-off script — there is no automated retraining pipeline, no model versioning, and no evaluation artifacts persisted (metrics are only printed to stdout at training time, not stored).

**Feature engineering:** TF-IDF over raw text with English stop-word removal; no n-grams, no custom tokenization, no OCR-noise-aware preprocessing.

**Model:** Multinomial-style Logistic Regression via scikit-learn's default `LogisticRegression`, 3-class (Invoice/Resume/Form).

**Confidence calculation:** `classification_service.py` calls `model.predict_proba(...)` and takes `max(probabilities)` as the confidence score. This confidence directly drives the pipeline's `needs_review` vs. `processed` status threshold of `0.7` (hardcoded in `document_pipeline_service.py`, not configurable).

**Saved artifacts:** `document_classifier.pkl` exists at `backend/document_classifier.pkl` (loaded relative to `os.getcwd()` in `classification_service.py`, not relative to the module file — meaning the app **must be launched with `backend/` as the current working directory**, or `classify_text` will fail to find the model). The `.pkl` file is committed to git.

---

# 9. NLP & Information Extraction

Implemented in `app/services/extraction_service.py`.

**Regex usage:**
- Resume: email pattern, 10–13 digit phone number pattern.
- Invoice: `amount` (near keywords "total"/"amount"/"grand total"), `date` (`DD-MM-YYYY` or `DD/MM/YYYY` only), `invoice_number` (near "invoice"/"invoice no"/"invoice number").
- Form: `date` (same pattern as invoice), `id`/`form id` pattern.

**spaCy usage:** `en_core_web_sm` loaded once at module import. Used for `PERSON` entity recognition in both `extract_resume_fields` and `extract_form_fields`, filtered through an `is_noise()` heuristic (rejects strings containing "http"/"www"/"linkedin"/"github"/"@", or longer than 40 characters) and a small hardcoded blacklist of words (e.g. "developer", "python", "hackathon") to reduce false-positive name matches.

**Heuristics:** Line-based fallback name detection — scans the first 5–7 lines of text for lines of 2–3 capitalized words when spaCy NER doesn't yield a usable `PERSON` entity. Note: in `extract_resume_fields`, the `found_name` flag is only ever read, never set to `True` inside the spaCy loop (the loop body only has `continue` for rejected candidates and otherwise falls through without ever accepting a candidate or breaking) — so the **spaCy NER path for resume names is effectively dead code that never populates `data["name"]`; only the line-based fallback can ever set the resume name.** This is a verifiable logic bug in `extract_resume_fields`.

**Current extraction capabilities / supported document types:** Only three types are handled — `Resume`, `Invoice`, `Form` — matching exactly the three classes the ML model can predict. Any other classification label results in `extract_fields()` returning an empty dict (silently, no error).

**Fields extracted:**
- Resume: `email`, `phone`, `name` (name extraction has the bug above)
- Invoice: `amount`, `date`, `invoice_number`
- Form: `name`, `date`, `id`

No extraction of "skills" or "experience" for resumes despite the top-level README listing them as optional fields — not present in code.

---

# 10. Services Layer

- **`ocr_service.py`** — Pure text-extraction utility; no dependencies on other services. Consumed only by `document_pipeline_service.py`.
- **`classification_service.py`** — Loads the ML model at import time (module-level global); exposes `classify_text()`. Consumed only by `document_pipeline_service.py`.
- **`extraction_service.py`** — Loads the spaCy model at import time (module-level global); exposes `extract_fields()` which dispatches to per-type extractors. Consumed only by `document_pipeline_service.py`.
- **`automation_service.py`** — Exposes `trigger_workflow(document)`, dispatching to `run_invoice_workflow`/`run_hr_workflow`/`run_form_workflow`. All three are `print()`-only stubs with comments describing intended future behavior (e.g. "send to finance approval," "notify HR team") — **no actual side effects are implemented**. Consumed only by `document_pipeline_service.py`, and (per §6) effectively unreachable in normal flow due to the verification-gate bug.
- **`document_pipeline_service.py`** — The orchestrator; imports and sequentially calls all four services above plus writes directly to the `Document`, `ExtractedField`, `Notification`, and `AutomationLog` models. This is the only service with direct DB session ownership; the other four are stateless pure functions with no DB access.

**Interaction summary:** All services are wired one-directionally into `document_pipeline_service`, which is the sole caller of each. There is no service-to-service interaction (e.g., `automation_service` never calls `classification_service`). No dependency injection is used for services — they are imported and loaded as module-level singletons (the ML model and spaCy model are each loaded exactly once per process, at first import).

---

# 11. Background Processing

**`BackgroundTasks` usage:** `POST /documents/upload` schedules `process_document_pipeline` via FastAPI's `BackgroundTasks.add_task()`. This runs the task **in-process, after the HTTP response is sent**, on the same server process — it is not a separate worker process, and not backed by Celery/RQ/Redis/any message broker (confirmed: no such dependency exists in `requirements.txt`).

**Async usage:** None of the route handlers or service functions are declared `async def` — every endpoint and pipeline function is synchronous (`def`). FastAPI's `BackgroundTasks` will run synchronous callables in a threadpool, so this does work, but it means the app gains none of the throughput benefits of true async I/O, and OCR/ML calls block a worker thread for their full duration.

**Blocking operations inside the background task:** Pytesseract/pdf2image OCR calls, spaCy NLP calls, and scikit-learn inference are all CPU/IO-bound and blocking; there is no timeout, cancellation, retry, or concurrency limiting around them. A slow or hung OCR call (e.g., very large PDF) will occupy a threadpool worker for its entire duration with no safeguard.

**Pipeline execution:** Fully sequential, single attempt, no retries, no dead-letter handling, no job status persisted beyond `Document.status` string field, no way to re-trigger a failed pipeline via the API (there is no "reprocess" endpoint).

---

# 12. Notifications

**Data model:** `Notification` (`app/models/notification.py`) — `user_id`, `title`, `message`, `created_at`, `is_read`.

**Creation:** Exactly one notification is created per successfully-processed document, inside `document_pipeline_service.py`, with a hardcoded title ("Document Processed") and a message string that always says the document "requires review" (even when `status` is set to `"processed"` rather than `"needs_review"` — the message text does not vary by confidence outcome, which is a minor inconsistency).

**Delivery / retrieval:** **None.** There is no route to list notifications, no route to mark them read, and no push/websocket/email delivery mechanism — the `is_read` field can never be set to `True` by any code path in this repository. The notification system is write-only from the API's perspective (README's claimed `GET /notifications/` and `PUT /notifications/{id}/read` endpoints do not exist in the code).

---

# 13. Human Review

**Approval process:** `POST /documents/{id}/approve` and `POST /documents/{id}/reject` set `Document.approval_status` to `"approved"`/`"rejected"`. As noted in §4/§5, these are not scoped to admins or document owners — any authenticated user can call them on any document ID.

**Verification process:** `PUT /review/field/{field_id}` sets a specific `ExtractedField.field_value` and flips `is_verified = True`. This endpoint is unauthenticated (§4) and takes the new value as an untyped scalar parameter rather than a validated Pydantic body.

**Review workflow:** `GET /review/document/{doc_id}` lists all extracted fields for a document (also unauthenticated) so a human could theoretically inspect and then call the `PUT` endpoint to correct/verify each field. There is no "pending review queue" endpoint scoped by verification status (the closest analog, `/documents/pending`, is scoped by `approval_status`, not by field verification state), and no UI exists to drive this workflow since there is no frontend.

**Approval states (as implemented):** `pending` (default), `approved`, `rejected` — plain strings, not an enum type, with no state-transition guard (e.g., nothing prevents re-approving an already-rejected document).

---

# 14. Logging

**Configuration:** `app/main.py` calls `logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")` — console/stdout logging only, no file handler, no log rotation, no structured (JSON) logging, no correlation/request IDs.

**Where logs are generated:** `main.py` (root endpoint hit), `document_pipeline_service.py` (pipeline start, classification result, extracted data, warnings when workflow is skipped, and errors on exceptions). `automation_service.py` uses raw `print()` statements instead of the `logging` module, which is inconsistent with the rest of the codebase and will not respect log level configuration or be captured by log aggregation the same way.

**Missing observability:**
- No request/response access logging middleware.
- No log correlation between an HTTP request and its background pipeline execution (no request/trace ID propagated).
- No metrics (Prometheus/StatsD), no APM integration, no health-check endpoint beyond the generic root `/` route (which is not a real health check — it does not verify DB connectivity or dependent services).
- No centralized error tracking (e.g., Sentry).

---

# 15. Configuration

**Environment variables:** Loaded via `pydantic-settings` in `app/core/config.py`, reading from a `.env` file. Declared settings: `SECRET_KEY`, `ALGORITHM` (default `"HS256"`), `ACCESS_TOKEN_EXPIRE_MINUTES` (default `60`), `DATABASE_URL`, `UPLOAD_DIR`. `extra = "ignore"` is set, so undeclared `.env` keys (e.g. the `EMAIL`/`PASSWORD` test values present in the local `.env`) are silently ignored rather than validated.

**Config classes:** A single `Settings(BaseSettings)` class; no environment-specific config classes (dev/staging/prod), no config validation beyond Pydantic's type coercion, no startup check that fails fast on a missing/invalid `DATABASE_URL` beyond whatever SQLAlchemy raises on first connection attempt.

**Secrets management:** Plain `.env` file, correctly excluded from git via `.gitignore` (`.env` is listed and not tracked). No secrets manager (Vault, AWS Secrets Manager, etc.) integration — expected for a project at this stage, but worth noting for production-readiness scoring.

---

# 16. Error Handling

**Validation:** Relies entirely on Pydantic request models (`UserCreate`, `UserLogin`, etc.) for the endpoints that declare them. Several endpoints accept **untyped/unvalidated inputs**: `PUT /review/field/{field_id}` takes `value: str` as a bare parameter (no schema, no length limit, no type beyond string), and `upload_document` performs no validation on file type, file size, or content before writing to disk.

**Exception handling:** Only `document_pipeline_service.py` has a structured `try/except/finally` around the whole pipeline, which logs, rolls back, and marks the document `"failed"`. No route handler in `documents.py`, `auth.py`, or `review.py` wraps DB operations in try/except — unexpected DB errors will surface as unhandled `500`s with FastAPI's default error response, not a controlled error contract.

**Custom exceptions:** None exist. Everywhere an error condition is anticipated (duplicate email, invalid credentials, missing document/field, non-admin access), code raises `fastapi.HTTPException` directly and inline — there is no custom exception hierarchy or centralized exception-to-response mapping.

**Response consistency:** Inconsistent. Success responses are a mix of full Pydantic `response_model`s (`UserOut`, `Token`, `DocumentOut`) and ad hoc plain dicts (`{"message": "Document approved"}`, `{"message": "Field updated"}`). Error responses are FastAPI's default `HTTPException` JSON shape (`{"detail": ...}`) with varying status codes and messages chosen per call site rather than from a shared error catalog. `review.py`'s two endpoints have no `response_model` declared at all, so responses there are raw SQLAlchemy-serialized output shaped by FastAPI's default JSON encoder rather than a controlled schema.

---

# 17. Current Architecture Evaluation

**Separation of concerns:** Reasonable at a coarse level (routes vs. schemas vs. models vs. services vs. core), but leaky in places: business logic like the confidence threshold (`0.7`) and notification message text live directly inside `document_pipeline_service.py` rather than in configuration or a dedicated policy module; `automation_service.py`'s workflow functions are pure stand-ins with no real logic to separate from anything yet.

**Maintainability:** Weakened by duplicate/dead code (`app/core/deps.py` fully duplicates `app/core/security.py`'s auth logic and is broken/unused), by two different "create all tables" entry points with divergent model imports (`app/db/models.py` vs `app/models/__init__.py`), and by hardcoded literals (confidence threshold, upload path resolution assumptions, model path resolution via `os.getcwd()`).

**Scalability:** Poor as currently built for anything beyond single-instance/dev use — in-process `BackgroundTasks` means all OCR/ML/NLP work competes with the web server's threadpool, and there is no external queue to distribute or scale that work independently, and no async DB layer.

**Readability:** Generally readable; functions are short and named descriptively; inconsistent commenting style (mix of emoji-prefixed comments and plain comments) but not harmful to comprehension.

**Testability:** Weak — services are structured as pure functions in places (`extraction_service`, `automation_service`) which is testable in principle, but ML/OCR/spaCy models are loaded as import-time globals, making it harder to mock/substitute them in unit tests without monkeypatching module attributes. No tests exist at all currently (§18).

**Security:** The weakest area found in this audit — unauthenticated review endpoints, unscoped approve/reject authorization, no CORS/rate limiting, and a dead/broken `require_admin` dependency that suggests RBAC was intended but never finished/wired in.

**Strengths:**
- Clear, conventional FastAPI project layout that would be easy to extend.
- The AI/NLP pipeline (OCR → classify → extract → persist) is fully wired end-to-end for the happy path.
- JWT auth and password hashing are implemented correctly using established libraries.
- Confidence-based routing (`needs_review` vs `processed`) is a real, working control-flow decision, not just cosmetic.

**Weaknesses:**
- Authorization gaps on multiple endpoints (some fully unauthenticated).
- Fragile, import-order-dependent database table creation with no real migration history.
- Dead code (`app/core/deps.py`) that would break if ever used.
- A logic bug in resume name extraction (spaCy branch never assigns a name).
- Workflow automation is unreachable in the normal single-pass pipeline due to the verified-fields gating bug.
- No tests, no CI/CD, no containerization, no frontend.

---

# 18. Production Readiness Audit

| Category | Status |
|---|---|
| Authentication | 🟡 Partial — JWT + hashing implemented, but no refresh/logout/lockout |
| Authorization | 🟡 Partial — one route enforces role check; several others (approve/reject/review) enforce none |
| RBAC | ❌ Missing — only a single inline string check; the dedicated `require_admin` dependency is dead/broken code |
| Database | 🟡 Partial — schema modeled with SQLAlchemy, but no enums/check constraints, minimal indexing |
| Migrations | ❌ Missing — Alembic scaffolded only; `target_metadata = None`; zero revisions exist |
| Storage | 🟡 Partial — local disk storage with UUID filenames; no size limits, no cloud storage option, no cleanup |
| Logging | 🟡 Partial — basic console logging exists; no rotation, structure, or request correlation |
| Monitoring | ❌ Missing — no metrics, no APM, no alerting |
| Testing | ❌ Missing — no test files, no test framework configured |
| Docker | ❌ Missing — no Dockerfile/docker-compose anywhere in the repo |
| CI/CD | ❌ Missing — no workflow/pipeline config files found |
| API Design | 🟡 Partial — RESTful naming mostly consistent; inconsistent response shapes and missing response models on some routes |
| Validation | 🟡 Partial — Pydantic used on most endpoints; a few take untyped/unvalidated params |
| Documentation | 🟡 Partial — a detailed README exists but overstates completeness (claims endpoints/status not present in code) |
| Background Jobs | 🟡 Partial — FastAPI `BackgroundTasks` only, no real task queue/broker |
| Security | ❌ Missing — unauthenticated endpoints, unscoped approve/reject, no CORS/rate limiting/security headers |
| AI Pipeline | 🟡 Partial — fully wired end-to-end, but workflow stage is effectively unreachable and stubbed |
| OCR | 🟡 Partial — functional but no preprocessing, validation, or confidence capture |
| ML | 🟡 Partial — trained model exists and is used, but on a tiny synthetic dataset with no retraining pipeline or versioning |
| Frontend | ❌ Missing — folder exists but is empty |
| Deployment | ❌ Missing — no deployment configuration of any kind |
| Configuration | 🟡 Partial — env-based settings work, but no per-environment config or secrets manager |
| Caching | ❌ Missing — no caching layer anywhere |
| Rate Limiting | ❌ Missing |
| Health Checks | ❌ Missing — root `/` is not a real health check |
| Performance | 🟡 Partial — synchronous, single-process pipeline; untested under load |
| Search | ❌ Missing — no search functionality over documents/fields |
| Observability | ❌ Missing — no tracing/metrics; logging only |

---

# 19. Implemented Features

- User registration and login with JWT-based authentication (`/auth/register`, `/auth/login`, `/auth/me`).
- Password hashing with bcrypt via passlib.
- Document upload with UUID-based unique filenames and on-disk storage.
- Background (in-process) document processing pipeline triggered on upload.
- OCR text extraction for PDF and image files via pytesseract/pdf2image.
- ML-based document type classification (Invoice/Resume/Form) with a confidence score, using a TF-IDF + Logistic Regression pipeline trained on a bundled dataset.
- Confidence-threshold-based status routing (`needs_review` vs `processed`).
- Regex + spaCy-based structured field extraction for the three supported document types (with a known bug in resume name extraction, §9).
- Persistence of extracted fields per document (`ExtractedField` rows).
- Creation of a notification record and an audit log record per successfully processed document.
- Document listing endpoints: caller's own documents, all pending documents, and (admin-only) all documents.
- Basic approve/reject actions on documents (not authorization-scoped).
- Endpoint to list and manually edit/verify extracted fields for a document (not authenticated).

---

# 20. Partially Implemented Features

- **Human review workflow** — data model and update endpoint exist, but there's no scoped "pending review" queue by verification status, no authentication on the endpoints, and no UI.
- **Workflow automation** — dispatch logic exists (`automation_service.py`) but every workflow branch is a `print()` stub with no real side effects, and the gating logic in the pipeline means this code is effectively unreachable on a normal first-pass upload.
- **Notification system** — notifications are created but cannot be listed, read, or marked read via any API.
- **RBAC / authorization** — a role field and one inline admin check exist, but a broken/unused `require_admin` dependency and multiple unauthenticated or unscoped endpoints show the RBAC design was started but not completed or consistently applied.
- **Database migrations** — Alembic is installed and initialized but not actually wired to the models (`target_metadata = None`) and has no revisions; effective schema management currently depends on `create_all()` calls whose completeness depends on import order.
- **Logging** — present but console-only, no structure or correlation, and inconsistent (some services use `print()` instead of `logging`).
- **OCR pipeline** — functional for the happy path but has no validation, preprocessing, size limits, or confidence capture.

---

# 21. Missing Features

- Frontend application (folder is empty; no UI of any kind ships with this repository).
- Automated test suite (unit, integration, or end-to-end) — no test files exist.
- Docker/containerization and any deployment manifests.
- CI/CD pipeline configuration.
- Real asynchronous task queue (Celery/RQ/arq + broker) — background work is entirely in-process.
- Notification retrieval/mark-as-read API.
- CORS configuration, rate limiting, and security headers.
- Health-check endpoint (liveness/readiness) that verifies DB/dependency connectivity.
- Structured/centralized error handling and a custom exception hierarchy.
- Database enums, check constraints, and a real migration history.
- File upload validation (type/size limits) and virus/malware scanning.
- Model versioning/retraining pipeline for the ML classifier.
- Search functionality over documents or extracted fields.
- Caching layer.
- Observability stack (metrics, tracing, error monitoring).
- Password reset / email verification / account recovery flows.

---

# 22. Technical Debt

**Duplicated code:**
- `app/core/deps.py` duplicates the JWT-decoding/`get_current_user` logic already in `app/core/security.py`, but with a broken import (`SECRET_KEY`/`ALGORITHM` don't exist as module-level names in `security.py`) — this file is unused dead code that would raise `ImportError` if anyone tried to use it.
- Two separate "create all tables" code paths (`app/db/session.py` vs `app/db/init_db.py`) with divergent model import sets (`app/db/models.py` imports only `User`/`Document`; `app/models/__init__.py` imports all five models).

**Code smells:**
- `automation_service.py` uses `print()` instead of the `logging` module used everywhere else.
- Hardcoded "magic numbers"/strings: the `0.7` confidence threshold, the notification title/message text, and the `os.getcwd()`-relative path to `document_classifier.pkl` are all embedded directly in service code rather than configuration.
- `PUT /review/field/{field_id}` accepts a bare `value: str` parameter instead of a Pydantic request body.
- Inconsistent response typing: some endpoints return declared Pydantic `response_model`s, others return raw dicts or un-typed ORM objects.
- `app/routes/__init__.py` only imports `documents` and `auth` (missing `review`), which happens to still work because `main.py` imports `review` directly from the package, but is an inconsistency that could confuse future maintainers or break under different import patterns.

**Architectural issues:**
- `Base.metadata.create_all()` firing as a side effect of importing `app/db/session.py`, combined with an incomplete model import in `app/db/models.py`, makes schema creation non-deterministic with respect to which tables actually get created on first run (§3).
- No true async I/O; all DB and pipeline calls are synchronous, run through FastAPI's threadpool.
- Business/domain logic (workflow dispatch, review gating) is tightly coupled inside `document_pipeline_service.py` rather than being independently orchestrated/testable.

**Potential bugs (verified in code, not speculative):**
- `extract_resume_fields()` never sets `found_name = True` inside its spaCy NER loop, so the NER-based name candidate is always discarded and only the line-based fallback can ever populate a resume's `name` field.
- The "only trigger workflow if verified fields exist" gate in `process_document_pipeline()` checks fields that were just created with `is_verified=False` in the same run, making `trigger_workflow()` unreachable in the normal single-pass flow.
- `POST /documents/{id}/approve` and `/reject` have no ownership/role check — any authenticated user can approve/reject any document by ID.
- `GET /review/document/{doc_id}` and `PUT /review/field/{field_id}` have no authentication at all.
- `classify_text()`'s model path is resolved via `os.getcwd()`, so the app breaks if started from any working directory other than `backend/`.

**Scalability concerns:**
- In-process background tasks mean CPU-bound OCR/ML/NLP work directly competes with the web server's ability to handle concurrent HTTP requests.
- No pagination on any list endpoint (`/documents/my`, `/documents/pending`, `/documents/`) — these will return unbounded result sets as data grows.
- Local disk storage for uploads with no cleanup, quota, or externalized storage (e.g., S3) strategy.

---

# 23. Overall Progress

**Backend Core: ~60%**
Reasoning: The layered structure (routes/services/models/schemas/core) is in place and the primary CRUD-ish flows (register, login, upload, list, approve/reject, review) all have working handlers. However, missing endpoints (notifications), unauthenticated routes, no pagination, no custom error handling, and no tests hold this back from being a solid, complete backend core.

**Authentication: ~55%**
Reasoning: JWT creation/validation and bcrypt hashing are correctly implemented and used for most routes. But RBAC is only a single inline check, a dedicated admin-check dependency exists but is dead/broken code, two endpoints (`review.py`) have zero authentication, and approve/reject lack any ownership or role scoping.

**AI Pipeline: ~65%**
Reasoning: OCR → classification → extraction → persistence is fully wired and functional end-to-end for the three supported document types. Points are lost because the workflow-automation stage is unreachable under normal conditions (verification-gate bug), automation actions are print-only stubs, and there's a real bug in resume name extraction.

**Database: ~45%**
Reasoning: Models are reasonably designed with correct FKs, but there are zero real migrations, an unreliable/import-order-dependent table-creation mechanism that can silently omit three of five tables, no enums/check constraints, and minimal indexing beyond the primary keys and the users' email uniqueness.

**API: ~55%**
Reasoning: Ten endpoints exist across three routers covering the core happy path, using mostly-consistent REST conventions and Pydantic response models. Missing notification endpoints, inconsistent response typing (dicts vs schemas), missing response models on the review routes, and no pagination bring this down.

**Production Readiness: ~15%**
Reasoning: No tests, no Docker, no CI/CD, no health checks, no CORS/rate limiting, no observability stack, no real migrations, and multiple unauthenticated/unscoped endpoints. This is a functional prototype, not something ready to deploy as-is.

**Frontend: 0%**
Reasoning: The `frontend/` directory exists on disk but is completely empty — every previously scaffolded file (Vite/React starter) has been deleted from the working tree (still showing as a pending deletion in git status). There is no UI code of any kind in the repository.

**Overall Project: ~40%**
Reasoning: A working, single-developer backend prototype that demonstrates the intended AI pipeline concept end-to-end for its three document types, built on reasonable architectural foundations, but with meaningful correctness bugs, real authorization/security gaps, no migration or test infrastructure, no deployment tooling, and no frontend at all. The README's "Production Ready" badge and several of its documented endpoints/features are not supported by the current code.

---

# 24. Recommended Next Steps

### Priority 1 — Critical
1. **Fix authorization gaps**: add `Depends(get_current_user)` (and appropriate role/ownership checks) to `GET /review/document/{doc_id}` and `PUT /review/field/{field_id}`; restrict `POST /documents/{id}/approve|reject` to admins and/or the document's owner, matching whatever policy is actually intended.
2. **Fix database table-creation reliability**: either (a) make `app/db/session.py` import the full `app/models` aggregator before calling `create_all()`, or (b) remove the import-time `create_all()` side effect entirely and adopt real Alembic migrations as the single source of truth. Wire `alembic/env.py`'s `target_metadata` to `Base.metadata` and generate an initial baseline migration plus one per subsequent schema change.
3. **Remove or fix dead/broken code**: delete `app/core/deps.py` (or fix its broken import and actually wire `require_admin` into the admin-only routes) to avoid confusion and a real `ImportError` risk.
4. **Fix the resume-name extraction bug** (`found_name` never set to `True` in the spaCy loop) and the **workflow-unreachability bug** (verified-fields gate checks fields from the same never-yet-verified pass).

### Priority 2 — High
5. Add an automated test suite (unit tests for `extraction_service`/`classification_service`/`automation_service`, integration tests for the auth/documents/review routers using FastAPI's `TestClient`).
6. Add CORS middleware, request size/type limits on uploads, and basic rate limiting (e.g., on `/auth/login`).
7. Implement the missing notification endpoints (`GET /notifications`, `PUT /notifications/{id}/read`) since the model already exists.
8. Add a real health-check endpoint that verifies DB connectivity, separate from the informational root route.
9. Replace ad hoc dict responses (`{"message": ...}`) with consistent Pydantic response models across all routes, and add `response_model`s to the `review.py` endpoints.

### Priority 3 — Medium
10. Introduce a real background job runner (Celery/RQ/arq + Redis) so OCR/ML/NLP work no longer competes with the web server's request-handling threadpool.
11. Add pagination to all list endpoints (`/documents/my`, `/documents/pending`, `/documents/`).
12. Replace free-form string fields (`role`, `status`, `approval_status`, `document_type`) with proper enums/check constraints at the DB and Pydantic layers.
13. Externalize hardcoded values (confidence threshold, notification text) into configuration.
14. Containerize the application (Dockerfile + docker-compose with Postgres) to make local/prod parity achievable.

### Priority 4 — Nice to Have
15. Build the frontend dashboard described in the README (currently entirely absent).
16. Set up CI/CD (lint, test, build) via GitHub Actions or similar.
17. Expand the ML training set with real/labeled OCR output (rather than synthetic clean text) and add basic model versioning.
18. Add structured logging (JSON) with request correlation IDs and integrate a monitoring/error-tracking tool.
19. Add search capability over documents/extracted fields as data volume grows.
20. Update the README to accurately reflect implementation status (remove "Production Ready" badge and unimplemented endpoint claims) so documentation matches reality.
