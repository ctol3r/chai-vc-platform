from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
from pathlib import Path

app = FastAPI(title="Job Ingestion Service")

DATA_FILE = Path(__file__).parent / "jobs_data.json"

# In-memory job store
jobs = []

# Load existing jobs on startup
if DATA_FILE.exists():
    try:
        jobs = json.loads(DATA_FILE.read_text())
    except Exception:
        jobs = []

class Job(BaseModel):
    title: str
    description: str

@app.post("/jobs", status_code=201)
def create_job(job: Job):
    jobs.append(job.model_dump())
    DATA_FILE.write_text(json.dumps(jobs, indent=2))
    return {"message": "Job ingested"}

@app.get("/jobs")
def list_jobs():
    return jobs
