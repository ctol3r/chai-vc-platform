import os
import sys

# Allow importing from the src directory
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from app import create_app


def test_recompute_on_new_profile():
    app = create_app()
    client = app.test_client()
    resp = client.post('/profiles', json={'profile_id': '123'})
    assert resp.status_code == 200
    assert resp.get_json()['status'] == 'recomputed'


def test_recompute_on_new_job():
    app = create_app()
    client = app.test_client()
    resp = client.post('/jobs', json={'job_id': 'abc'})
    assert resp.status_code == 200
    assert resp.get_json()['status'] == 'recomputed'
