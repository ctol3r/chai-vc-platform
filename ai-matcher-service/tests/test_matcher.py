import os, sys; sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))
from routes.match import run_match


def test_run_match_returns_metrics():
    matches = [
        {"gender": "male", "success": True},
        {"gender": "female", "success": False},
    ]
    metrics = run_match(matches)
    assert "male" in metrics
    assert "female" in metrics
