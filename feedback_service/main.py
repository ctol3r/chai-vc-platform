from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
import csv
import os

app = FastAPI()

FEEDBACK_FILE = os.path.join(os.path.dirname(__file__), "feedback.csv")

class Feedback(BaseModel):
    candidate_id: str
    job_id: str
    outcome: str
    notes: str | None = None

@app.post("/feedback")
def collect_feedback(feedback: Feedback):
    file_exists = os.path.isfile(FEEDBACK_FILE)
    try:
        with open(FEEDBACK_FILE, "a", newline="") as f:
            writer = csv.writer(f)
            if not file_exists:
                writer.writerow(["timestamp", "candidate_id", "job_id", "outcome", "notes"])
            writer.writerow([
                datetime.utcnow().isoformat(),
                feedback.candidate_id,
                feedback.job_id,
                feedback.outcome,
                feedback.notes or "",
            ])
        return {"status": "recorded"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"status": "feedback service running"}
