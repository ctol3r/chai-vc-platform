import pytest
from fastapi.testclient import TestClient
import api_gateway.main as main

client = TestClient(main.app)

@pytest.fixture(autouse=True)
def reset_env(monkeypatch):
    monkeypatch.setenv("API_KEY", main.API_KEY)


def test_aggregate_success(monkeypatch):
    async def mock_on_chain(item_id):
        return {"id": item_id, "source": "on-chain"}
    async def mock_off_chain(item_id):
        return {"id": item_id, "source": "off-chain"}
    monkeypatch.setattr(main, "fetch_on_chain", mock_on_chain)
    monkeypatch.setattr(main, "fetch_off_chain", mock_off_chain)
    response = client.get("/aggregate/42", headers={"X-API-KEY": main.API_KEY})
    assert response.status_code == 200
    data = response.json()
    assert data["on_chain"]["source"] == "on-chain"
    assert data["off_chain"]["source"] == "off-chain"


def test_unauthorized():
    response = client.get("/aggregate/1")
    assert response.status_code == 401
