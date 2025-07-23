# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## GPT-Powered Search Service

A FastAPI service that ranks results semantically using OpenAI embeddings when an `OPENAI_API_KEY` is provided. If the key is missing, it falls back to local TF-IDF ranking. Results can be filtered in real-time using the `category` query parameter.

Run the service:

```bash
python ai-matcher-service/src/search/search_service.py
```

Then query:

```
GET http://localhost:8000/search?q=credentialing&category=healthcare
```
