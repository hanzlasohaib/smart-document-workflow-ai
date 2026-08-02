import pytesseract
from pdf2image import convert_from_path
from PIL import Image


def run_ocr(file_path: str) -> str:
    text_output = ""

    if file_path.lower().endswith(".pdf"):
        images = convert_from_path(file_path)
        for image in images:
            text_output += pytesseract.image_to_string(image)
    else:
        image = Image.open(file_path)
        text_output = pytesseract.image_to_string(image)

    return text_output