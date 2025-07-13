import os
import sys
from fastapi.testclient import TestClient

# Add repository root to path so 'src' package can be imported
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.app import app

client = TestClient(app)


def test_match_endpoint():
    response = client.post('/match', json={'text1': 'hello world', 'text2': 'hello'})
    assert response.status_code == 200
    data = response.json()
    assert 'similarity' in data
    assert data['similarity'] > 0
