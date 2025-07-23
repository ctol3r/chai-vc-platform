import sys
from pathlib import Path

# Add the backend/src directory to the path for imports
sys.path.append(str(Path(__file__).resolve().parents[2] / 'backend' / 'src'))

from multi_agent.coordinator import Coordinator


def test_coordinator_sequence():
    coord = Coordinator()
    result = coord.process("sample payload")
    assert result == "risk_assessed"
