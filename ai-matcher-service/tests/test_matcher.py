from fastapi import FastAPI
from fastapi.testclient import TestClient
from unittest.mock import patch

import importlib.util
import pathlib
spec = importlib.util.spec_from_file_location(
    "match",
    pathlib.Path(__file__).resolve().parents[1] / "src" / "routes" / "match.py",
)
match = importlib.util.module_from_spec(spec)
spec.loader.exec_module(match)
router = match.router

app = FastAPI()
app.include_router(router)

client = TestClient(app)


def test_match_denied():
    with patch('requests.post') as post:
        post.return_value.json.return_value = {"result": False}
        response = client.post('/match')
        assert response.status_code == 403


def test_match_allowed():
    with patch('requests.post') as post, patch('requests.get') as get:
        post.return_value.json.return_value = {"result": True}
        get.return_value.json.return_value = {"ok": True}
        response = client.post('/match')
        assert response.status_code == 200
        assert response.json()['backend'] == {"ok": True}
