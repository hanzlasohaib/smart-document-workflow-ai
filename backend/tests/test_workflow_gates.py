"""PAS-04 workflow gate logic."""

from types import SimpleNamespace

from app.services.workflow_gates import (
    approval_gate_satisfied,
    gates_satisfied,
    required_fields_verified,
)


def _field(name: str, verified: bool):
    return SimpleNamespace(field_name=name, is_verified=verified)


def test_required_fields_not_verified_on_first_pass():
    document = SimpleNamespace(
        document_type="Resume",
        approval_status="pending",
        extracted_fields=[
            _field("name", False),
            _field("email", False),
        ],
    )
    assert required_fields_verified(document) is False
    assert gates_satisfied(document) is False


def test_field_gate_requires_all_required_verified():
    document = SimpleNamespace(
        document_type="Resume",
        approval_status="approved",
        extracted_fields=[
            _field("name", True),
            _field("email", False),
        ],
    )
    assert required_fields_verified(document) is False
    assert gates_satisfied(document) is False


def test_approval_gate_required():
    document = SimpleNamespace(
        document_type="Resume",
        approval_status="pending",
        extracted_fields=[
            _field("name", True),
            _field("email", True),
        ],
    )
    assert required_fields_verified(document) is True
    assert approval_gate_satisfied(document) is False
    assert gates_satisfied(document) is False


def test_gates_pass_when_verified_and_approved():
    document = SimpleNamespace(
        document_type="Invoice",
        approval_status="approved",
        extracted_fields=[
            _field("amount", True),
            _field("invoice_number", True),
            _field("date", False),  # optional
        ],
    )
    assert gates_satisfied(document) is True


def test_unknown_type_fails_field_gate():
    document = SimpleNamespace(
        document_type="Unknown",
        approval_status="approved",
        extracted_fields=[_field("name", True)],
    )
    assert required_fields_verified(document) is False
