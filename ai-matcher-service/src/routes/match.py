"""Matching and ranking routines with bias detection."""

from typing import List, Dict, Any

from src.bias_detection import detect_bias, adjust_ranking


def rank_candidates(candidates: List[Dict[str, Any]], group_key: str = "group") -> List[Dict[str, Any]]:
    """Return ranked candidates with bias adjustment applied if needed."""
    ranked = sorted(candidates, key=lambda c: c.get("score", 0), reverse=True)
    if detect_bias(ranked, group_key):
        ranked = adjust_ranking(ranked, group_key)
    return ranked


def match(candidates: List[Dict[str, Any]], group_key: str = "group") -> Dict[str, Any]:
    """Return a result dictionary with the final ranking."""
    return {"ranking": rank_candidates(candidates, group_key)}
