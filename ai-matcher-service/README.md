# AI Matcher Service

This microservice exposes a simple API for calculating the cosine similarity between two text strings. It uses `FastAPI` and `scikit-learn`.

## Development

Install dependencies and run the service:

```bash
pip install -r requirements.txt
uvicorn src.app:app --reload
```

## Endpoint

`POST /match`

Request body:
```json
{
  "text1": "first text",
  "text2": "second text"
}
```

Response body:
```json
{
  "similarity": 0.92
}
```
