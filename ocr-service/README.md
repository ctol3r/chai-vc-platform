# OCR Extraction Service

This microservice provides OCR and simple NLP-based extraction for credential data. It exposes a `/extract` endpoint that accepts an image upload and returns the raw OCR text along with parsed credential fields (name, date of birth, license number).

Run locally with:
```bash
uvicorn main:app --reload
```

The service requires `pytesseract` and the Tesseract OCR engine.
