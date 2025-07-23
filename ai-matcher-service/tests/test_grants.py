import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))
from routes.grants import propose_allocations


def test_propose_allocations_equal_split():
    projects = ["Project A", "Project B"]
    result = propose_allocations(projects, 100)
    assert result == {"Project A": 50.0, "Project B": 50.0}
