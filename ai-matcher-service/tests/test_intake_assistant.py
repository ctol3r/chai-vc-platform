from fastapi.testclient import TestClient
import openai
import json
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../src")))
from main import app

client = TestClient(app)

class MockResponse:
    def __init__(self):
        self.choices = [type("Obj", (), {"message": {"function_call": {"arguments": json.dumps({"text": "Mock post"})}}})]

def mock_create(**kwargs):
    return MockResponse()

def test_draft_job_post(monkeypatch):
    monkeypatch.setattr(openai.ChatCompletion, "create", mock_create)
    resp = client.post("/assistant/draft-job-post", json={"position": "Engineer", "company": "ACME"})
    assert resp.status_code == 200
    data = resp.json()
    assert "draft" in data


