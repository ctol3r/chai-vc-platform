# bias_audit.py - analyze matches for potential bias
from typing import List, Dict, Any


def audit_bias(matches: List[Dict[str, Any]], protected_attr: str) -> Dict[str, float]:
    """Simple bias audit using disparate impact.

    Args:
        matches: list of match records with boolean 'success' key and
            protected attribute like 'gender'.
        protected_attr: attribute to audit.

    Returns:
        Dict with disparate impact metric per attribute value.
    """
    if not matches:
        return {}

    # count successes and totals per attribute value
    totals = {}
    successes = {}
    for m in matches:
        key = m.get(protected_attr)
        totals[key] = totals.get(key, 0) + 1
        if m.get('success'):
            successes[key] = successes.get(key, 0) + 1
    overall_rate = sum(successes.values()) / len(matches)
    impact = {}
    for key, total in totals.items():
        rate = successes.get(key, 0) / total
        impact[key] = rate / overall_rate if overall_rate else 0.0
    return impact
