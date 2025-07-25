# test_matcher.py - placeholder or stub for chai-vc-platform

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from routes.match import dummy_match


def test_dummy_match():
    """Verify that the dummy_match function returns the expected structure."""

    result = dummy_match({"foo": "bar"})
    assert result == {"matched": False, "input": {"foo": "bar"}}

