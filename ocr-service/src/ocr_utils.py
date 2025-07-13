import re
from typing import Dict


def parse_credentials(text: str) -> Dict[str, str]:
    """Parse key credential fields from OCR text."""
    data: Dict[str, str] = {}
    name = re.search(r"Name[:\s]+([A-Za-z ,.'-]+)", text, re.IGNORECASE)
    if name:
        data['name'] = name.group(1).strip()
    dob = re.search(r"DOB[:\s]+([0-9/\-]+)", text, re.IGNORECASE)
    if dob:
        data['dob'] = dob.group(1).strip()
    license_no = re.search(r"License(?: No\.?| Number)?[:\s]+([A-Za-z0-9-]+)", text, re.IGNORECASE)
    if license_no:
        data['license'] = license_no.group(1).strip()
    return data
