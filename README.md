# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Job Ingestion Service

A minimal FastAPI service provides endpoints to ingest and list job postings.

### Install dependencies

```bash
pip install fastapi uvicorn
```

### Run the service

```bash
uvicorn job_ingestion_service.main:app --reload
```

POST new jobs to `/jobs` with JSON body containing `title` and `description`.
Retrieve all jobs with `GET /jobs`.
