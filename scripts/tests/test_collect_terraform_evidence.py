import json
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from collect_terraform_evidence import collect


def test_collect_basic(tmp_path: Path):
    sample = {
        "summary": {
            "scenario": {"total": 2, "passed": 1, "failed": 1},
            "features": {"total": 1, "passed": 0, "failed": 1},
        },
        "results": [
            {"feature": "encryption", "scenario": "s3", "status": "failed"},
            {"feature": "encryption", "scenario": "rds", "status": "passed"},
        ],
    }
    report = tmp_path / "report.json"
    report.write_text(json.dumps(sample))

    evidence = collect(report)

    assert evidence["total_features"] == 1
    assert evidence["failed_scenarios"] == 1
    assert len(evidence["results"]) == 2
