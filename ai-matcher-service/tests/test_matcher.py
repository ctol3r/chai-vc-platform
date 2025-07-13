import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from routes.match import run_match


def test_run_match():
    assert run_match({}) == {"matched": True}
