import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1] / "src"))

from matcher import calculate_fit


def test_perfect_match():
    assert calculate_fit(["python", "fastapi"], ["python", "fastapi"]) == 100.0


def test_partial_match():
    assert calculate_fit(["python", "fastapi"], ["python", "docker"]) == 50.0


def test_no_job_skills():
    assert calculate_fit(["python"], []) == 0.0
