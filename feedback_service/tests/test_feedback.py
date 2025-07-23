from fastapi.testclient import TestClient
from pathlib import Path
import csv
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
import main  # type: ignore

client = TestClient(main.app)


def test_collect_feedback(tmp_path, monkeypatch):
    feedback_file = tmp_path / "feedback.csv"
    monkeypatch.setattr(main, "FEEDBACK_FILE", str(feedback_file))

    response = client.post(
        "/feedback",
        json={"candidate_id": "c1", "job_id": "j1", "outcome": "hired", "notes": "great fit"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "recorded"

    with open(feedback_file, newline="") as f:
        rows = list(csv.reader(f))

    assert rows[0] == ["timestamp", "candidate_id", "job_id", "outcome", "notes"]
    assert rows[1][1:] == ["c1", "j1", "hired", "great fit"]
