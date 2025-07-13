import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))
from ocr_utils import parse_credentials


def test_parse_credentials_basic():
    text = """Name: John Doe
DOB: 01/02/1980
License No: ABC12345
"""
    data = parse_credentials(text)
    assert data['name'] == 'John Doe'
    assert data['dob'] == '01/02/1980'
    assert data['license'] == 'ABC12345'
