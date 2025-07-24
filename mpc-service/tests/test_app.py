import json
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from app import app, submitted_data

def test_intersection(tmp_path):
    client = app.test_client()
    submitted_data.clear()

    resp = client.post('/submit', json={
        'institution': 'A',
        'credentials': ['c1', 'c2', 'c3']
    })
    assert resp.status_code == 200

    resp = client.post('/submit', json={
        'institution': 'B',
        'credentials': ['c2', 'c3', 'c4']
    })
    assert resp.status_code == 200

    resp = client.get('/intersection')
    assert resp.status_code == 200
    data = json.loads(resp.data)
    assert set(data['intersection']) == {'c2', 'c3'}
