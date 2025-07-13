import os
import sys
import pytest

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "src"))
from utils.csv_validator import validate_csv_rows


def test_validate_csv_valid_rows():
    csv_text = "firstName,lastName,email\nJohn,Doe,john@example.com\nJane,Smith,jane@example.com"
    valid, errors = validate_csv_rows(csv_text, ["firstName", "lastName", "email"])
    assert len(errors) == 0
    assert len(valid) == 2
    assert valid[0]["firstName"] == "John"


def test_validate_csv_missing_header():
    csv_text = "firstName,email\nJohn,john@example.com"
    valid, errors = validate_csv_rows(csv_text, ["firstName", "lastName", "email"])
    assert len(valid) == 0
    assert errors[0]["row"] == 0
    assert "Missing headers" in errors[0]["error"]


def test_validate_csv_row_error():
    csv_text = "firstName,lastName,email\nJohn,,john@example.com"
    valid, errors = validate_csv_rows(csv_text, ["firstName", "lastName", "email"])
    assert len(valid) == 0
    assert errors[0]["row"] == 2
    assert "lastName is required" in errors[0]["error"]
