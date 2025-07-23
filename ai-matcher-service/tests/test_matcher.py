import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from routes.match import match


def test_match_placeholder():
    assert match() == "match result"
