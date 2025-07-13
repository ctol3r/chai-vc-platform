import json
from typing import List, Tuple, Dict

REQUIRED_FIELDS = ["id", "name"]
DEFAULT_PATH = "ai-matcher-service/tests/data/sample_credentials.json"


def validate_records(records: List[Dict]) -> Tuple[List[Dict], List[Dict]]:
    """Validate each record has required fields.

    Returns a tuple of (valid_records, invalid_records).
    """
    valid = []
    invalid = []
    for rec in records:
        if all(field in rec for field in REQUIRED_FIELDS):
            valid.append(rec)
        else:
            invalid.append(rec)
    return valid, invalid


def load_records(path: str) -> List[Dict]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def main(path: str = DEFAULT_PATH) -> None:
    records = load_records(path)
    valid, invalid = validate_records(records)
    print(f"Processed {len(records)} records: {len(valid)} valid, {len(invalid)} malformed")
    if invalid:
        print("Malformed entries:")
        for i, rec in enumerate(invalid, 1):
            print(f" {i}. {rec}")


if __name__ == "__main__":
    import sys

    file_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_PATH
    main(file_path)
