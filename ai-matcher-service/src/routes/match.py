"""Match routes for the AI matcher service."""
from typing import List, Dict, Any
from audit import audit_bias


def run_match(matches: List[Dict[str, Any]]) -> Dict[str, float]:
    """Run bias audit on provided matches."""
    return audit_bias(matches, "gender")
