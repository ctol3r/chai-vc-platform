import csv
from io import StringIO
from typing import List, Dict, Tuple


def validate_csv_rows(csv_text: str, required_columns: List[str]) -> Tuple[List[Dict[str, str]], List[Dict[str, str]]]:
    """Validate CSV text returning valid rows and row-level errors.

    Parameters
    ----------
    csv_text: str
        Raw CSV data as a string.
    required_columns: List[str]
        Column names that must be present and non-empty for each row.

    Returns
    -------
    Tuple[List[Dict[str, str]], List[Dict[str, str]]]
        First element is list of valid row dicts. Second element is a list of
        error dicts with ``row`` and ``error`` keys.
    """

    reader = csv.DictReader(StringIO(csv_text))
    valid_rows: List[Dict[str, str]] = []
    errors: List[Dict[str, str]] = []

    if reader.fieldnames is None:
        errors.append({"row": 0, "error": "No header row found"})
        return valid_rows, errors

    missing_headers = [col for col in required_columns if col not in reader.fieldnames]
    if missing_headers:
        errors.append({"row": 0, "error": f"Missing headers: {', '.join(missing_headers)}"})
        return valid_rows, errors

    for index, row in enumerate(reader, start=2):  # data rows start at 2 (header=1)
        row_errors = []
        for col in required_columns:
            value = row.get(col, "").strip()
            if value == "":
                row_errors.append(f"{col} is required")
        if row_errors:
            errors.append({"row": index, "error": "; ".join(row_errors)})
        else:
            valid_rows.append({k: v.strip() for k, v in row.items()})

    return valid_rows, errors
