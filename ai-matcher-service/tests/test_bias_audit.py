import os, sys; sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))
from audit.bias_audit import audit_bias


def test_audit_bias_basic():
    matches = [
        {"gender": "male", "success": True},
        {"gender": "male", "success": False},
        {"gender": "female", "success": True},
        {"gender": "female", "success": True},
    ]
    result = audit_bias(matches, "gender")
    assert result["male"] != 0
    assert result["female"] != 0
