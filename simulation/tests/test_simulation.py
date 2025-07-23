import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from credential_scenario_simulator import run_scenario


def test_run_scenario():
    data = {
        "credentials": [
            {"id": "c1", "issuer": "X", "subject": "Y", "status": "active"}
        ],
        "actions": [
            {"type": "verify", "credential_id": "c1"},
            {"type": "revoke", "credential_id": "c1"},
            {"type": "verify", "credential_id": "c1"}
        ]
    }
    results = run_scenario(data)
    assert results[0]["result"] == "active"
    assert results[1]["result"] == "revoked"
    assert results[2]["result"] == "revoked"
