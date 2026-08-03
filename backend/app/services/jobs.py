"""Job enqueue boundary (PAS-02 ADR-02-004). In-process runner for P1."""

from __future__ import annotations

from fastapi import BackgroundTasks

from app.services.document_pipeline_service import process_document_pipeline


class InProcessJobRunner:
    """Schedules pipeline work via FastAPI BackgroundTasks when available."""

    def enqueue_document_processing(
        self,
        document_id: int,
        background_tasks: BackgroundTasks | None = None,
    ) -> None:
        if background_tasks is not None:
            background_tasks.add_task(process_document_pipeline, document_id)
            return
        process_document_pipeline(document_id)


job_runner = InProcessJobRunner()


def enqueue_document_processing(
    document_id: int,
    background_tasks: BackgroundTasks | None = None,
) -> None:
    job_runner.enqueue_document_processing(document_id, background_tasks)
