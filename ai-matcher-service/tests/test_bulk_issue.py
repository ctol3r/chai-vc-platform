import os
import sys

# Allow importing from the src directory
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from bulk_issuer import validate_records, load_records


def test_validate_records():
    records = load_records(os.path.join(os.path.dirname(__file__), 'data', 'sample_credentials.json'))
    valid, invalid = validate_records(records)
    assert len(records) == 10
    assert len(valid) == 8
    assert len(invalid) == 2
