# Tests for matcher placeholder
import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from routes.match import placeholder

def test_placeholder():
    assert placeholder() == {"status": "stub"}
