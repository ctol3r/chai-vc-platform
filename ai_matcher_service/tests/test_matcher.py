from fastapi.testclient import TestClient
from ai_matcher_service.src.routes.match import app

client = TestClient(app)

def test_match_endpoint_returns_score_and_explanation():
    payload = {
        "job_description": "Seeking Python developer with healthcare experience",
        "candidate_profile": "Experienced Python developer with healthcare background"
    }
    response = client.post("/match", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "score" in data
    assert "explanation" in data
    assert isinstance(data["score"], float)
    assert isinstance(data["explanation"], str)
