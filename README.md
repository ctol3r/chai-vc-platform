# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Feedback Service

The `feedback_service` collects hiring outcomes so the matching models can be improved over time. It exposes a small FastAPI app with a single endpoint:

```
POST /feedback
{
  "candidate_id": "c1",
  "job_id": "j1",
  "outcome": "hired",
  "notes": "optional notes"
}
```

Records are appended to `feedback_service/feedback.csv` and can later be used to retrain the matching algorithms.

Run the tests with:

```
pytest -q
```
