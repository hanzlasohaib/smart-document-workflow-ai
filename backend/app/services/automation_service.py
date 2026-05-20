from app.models.document import Document


def trigger_workflow(document: Document):
    """
    Central Automation Decision Engine
    """

    print("AUTOMATION STARTED")

    if document.document_type == "Invoice":
        run_invoice_workflow(document)

    elif document.document_type == "Resume":
        run_hr_workflow(document)

    elif document.document_type == "Form":
        run_form_workflow(document)

    else:
        print("No workflow assigned")


# ---------------- WORKFLOWS ---------------- #

def run_invoice_workflow(document: Document):
    print(f"Invoice Workflow Triggered for Doc {document.id}")

    # Future:
    # send to finance approval
    # create payment queue
    # notify accountant


def run_hr_workflow(document: Document):
    print(f"HR Workflow Triggered for Doc {document.id}")

    # Future:
    # add candidate pipeline
    # notify HR team


def run_form_workflow(document: Document):
    print(f"Form Processing Workflow for Doc {document.id}")

    # Future:
    # validate fields
    # route to department
