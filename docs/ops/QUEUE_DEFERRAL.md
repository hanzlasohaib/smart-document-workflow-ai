# Queue adoption — deferred (P3)

**Decision:** Keep the existing in-process job boundary (`InProcessJobRunner` + FastAPI `BackgroundTasks`). Do **not** introduce a broker/worker service in this phase.

**ADR:** [ADR-02-004](../pas/02-system-architecture.md#adr-02-004-evolve-background-processing-via-a-job-boundary) — evolve via the job boundary; adopt a queue-backed worker sharing the same pipeline modules only when triggers fire.

## Triggers reviewed (not met for current load)

| Trigger | Current evidence |
|---|---|
| Web latency under concurrent OCR | Single-instance Compose; no measured p95 degradation requiring isolation |
| Retries / DLQ needed | Failures surface via document status + logs; no production retry backlog |
| Multi-instance API without sticky jobs | Deploy topology is one `api` replica; sticky in-process jobs are acceptable |
| Isolate OCR/Poppler crashes from API | Acceptable risk at current scale; monitor via structured logs + Sentry |

## What stays in place

- `enqueue_document_processing(document_id, background_tasks)` remains the only call site from upload.
- Pipeline modules stay importable by a future `worker` service without rewrite.
- Compose has no `worker` service until a trigger is met.

## Revisit when

- Concurrent uploads cause request timeouts or event-loop/threadpool saturation, **or**
- Staging/prod needs >1 API replica, **or**
- Ops requires automatic retries/DLQ for failed OCR jobs.

At that point: add a broker (choice unlocked by ADR), a Compose `worker` service using the same image/codepath, and flip the runner implementation behind the existing enqueue boundary.
