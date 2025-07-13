import sys
from pathlib import Path

# Ensure repository root is on the import path
sys.path.append(str(Path(__file__).resolve().parents[2]))

from backend.issuance_flow import optimized_issuance_flow


def test_optimized_flow_under_two_seconds():
    duration = optimized_issuance_flow("template", "user")
    assert duration < 2.0
