import re
import spacy

nlp = spacy.load("en_core_web_sm")

# ---------------- COMMON NOISE FILTER ---------------- #
def is_noise(text: str) -> bool:
    text_lower = text.lower()

    return (
        "http" in text_lower
        or "www" in text_lower
        or "linkedin" in text_lower
        or "github" in text_lower
        or "@" in text_lower
        or len(text.strip()) > 40
    )

# ---------------- MAIN CONTROLLER ---------------- #
def extract_fields(document_type: str, text: str):

    if document_type == "Resume":
        return extract_resume_fields(text)

    elif document_type == "Invoice":
        return extract_invoice_fields(text)

    elif document_type == "Form":
        return extract_form_fields(text)

    return {}

# ---------------- RESUME ---------------- #
def extract_resume_fields(text: str):
    data = {}

    # EMAIL
    email = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    if email:
        data["email"] = email.group()

    # PHONE
    phone = re.search(r"\b\d{10,13}\b", text)
    if phone:
        data["phone"] = phone.group()

    # -------- NAME (ULTRA-STRICT SAFE) -------- #
    doc = nlp(text)

    blacklist_words = {
        "hackathon", "project", "developer", "engineer",
        "python", "java", "pydub", "internship", "ai"
    }

    found_name = False

    for ent in doc.ents:
        if ent.label_ == "PERSON":
            candidate = ent.text.strip()
            words = candidate.lower().split()

            if (
                is_noise(candidate)
                or len(words) < 2
                or any(char.isdigit() for char in candidate)
                or any(word in blacklist_words for word in words)
            ):
                continue

            data["name"] = candidate
            found_name = True
            break

    # -------- FALLBACK NAME -------- #
    if not found_name:
        first_lines = text.split("\n")[:7]

        for line in first_lines:
            line = line.strip()
            words = line.split()

            if (
                2 <= len(words) <= 3
                and all(word[0].isupper() for word in words if word)
                and not any(w.lower() in blacklist_words for w in words)
                and not is_noise(line)
            ):

                data["name"] = line
                found_name = True
                break

    return data

# ---------------- INVOICE ---------------- #
def extract_invoice_fields(text: str):
    data = {}

    # AMOUNT (better)
    amount = re.search(r"(total|amount|grand total)[^\d]*([\$]?\d+(?:,\d+)?(?:\.\d{2})?)", text, re.IGNORECASE)
    if amount:
        data["amount"] = amount.group(2)

    # DATE (more flexible)
    date = re.search(r"\b\d{2}[-/]\d{2}[-/]\d{4}\b", text)
    if date:
        data["date"] = date.group()

    # INVOICE NUMBER
    invoice_no = re.search(r"(invoice\s*(no|number)?[:\s]*)([A-Za-z0-9-]+)", text, re.IGNORECASE)
    if invoice_no:
        data["invoice_number"] = invoice_no.group(3)

    return data

# ---------------- FORM ---------------- #
def extract_form_fields(text: str):
    data = {}

    # NAME (reuse strong logic)
    doc = nlp(text)

    for ent in doc.ents:
        if ent.label_ == "PERSON":
            candidate = ent.text.strip()

            if (
                is_noise(candidate)
                or len(candidate.split()) < 2
                or any(char.isdigit() for char in candidate)
            ):
                continue

            data["name"] = candidate
            break

    # FALLBACK NAME
    if "name" not in data:
        first_lines = text.split("\n")[:5]

        for line in first_lines:
            line = line.strip()

            if (
                len(line.split()) == 2
                and all(word[0].isupper() for word in line.split())
                and not is_noise(line)
            ):
                data["name"] = line
                break

    # DATE
    date = re.search(r"\b\d{2}[-/]\d{2}[-/]\d{4}\b", text)
    if date:
        data["date"] = date.group()

    # ID (basic)
    form_id = re.search(r"(id|form id)[:\s]*([A-Za-z0-9-]+)", text, re.IGNORECASE)
    if form_id:
        data["id"] = form_id.group(2)

    return data