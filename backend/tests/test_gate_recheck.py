"""Workflow re-check path after verify + approve."""

from unittest.mock import patch

from app.models.extracted_field import ExtractedField
from tests.conftest import auth_header


def test_workflow_runs_only_after_verify_and_approve(client, user, admin, owned_document, db):
    fields = (
        db.query(ExtractedField)
        .filter(ExtractedField.document_id == owned_document.id)
        .all()
    )

    with patch("app.services.workflow_gates.trigger_workflow") as trigger:
        # Verify fields as owner — approval still pending → no workflow
        for field in fields:
            response = client.put(
                f"/review/field/{field.id}?value={field.field_value}",
                headers=auth_header(user),
            )
            assert response.status_code == 200

        assert trigger.call_count == 0

        # Approve as admin → gates satisfied → workflow
        response = client.post(
            f"/documents/{owned_document.id}/approve",
            headers=auth_header(admin),
        )
        assert response.status_code == 200
        assert trigger.call_count == 1
