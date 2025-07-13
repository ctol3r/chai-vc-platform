from typing import List, Dict, Any
from collections import defaultdict


def detect_bias(candidates: List[Dict[str, Any]], group_key: str, top_n: int = None, threshold: float = 0.2) -> bool:
    """Return True if representation of any group in the top section deviates
    from overall representation by more than ``threshold``.

    Parameters
    ----------
    candidates : list of dict
        Candidate objects with a numeric ``score`` and grouping attribute.
    group_key : str
        Key used to split candidates into groups (e.g. 'gender').
    top_n : int, optional
        Number of top candidates to inspect. If ``None``, uses half of the list.
    threshold : float
        Allowed deviation from overall proportion before bias is flagged.
    """
    if not candidates:
        return False
    if top_n is None:
        top_n = len(candidates) // 2 or 1

    sorted_candidates = sorted(candidates, key=lambda c: c.get("score", 0), reverse=True)
    overall_counts: Dict[Any, int] = defaultdict(int)
    for c in sorted_candidates:
        overall_counts[c.get(group_key)] += 1
    top_counts: Dict[Any, int] = defaultdict(int)
    for c in sorted_candidates[:top_n]:
        top_counts[c.get(group_key)] += 1

    total = len(sorted_candidates)
    for group, overall in overall_counts.items():
        overall_ratio = overall / total
        top_ratio = top_counts.get(group, 0) / top_n
        if abs(top_ratio - overall_ratio) > threshold:
            return True
    return False


def adjust_ranking(candidates: List[Dict[str, Any]], group_key: str) -> List[Dict[str, Any]]:
    """Re-rank candidates to balance representation across ``group_key``.

    This simple routine cycles through groups, always selecting the highest
    remaining candidate from the group with the lowest representation in the
    current result list.
    """
    if not candidates:
        return []

    # Organize candidates by group and sort each group by score.
    group_buckets: Dict[Any, List[Dict[str, Any]]] = defaultdict(list)
    for c in candidates:
        group_buckets[c.get(group_key)].append(c)
    for group in group_buckets:
        group_buckets[group].sort(key=lambda c: c.get("score", 0), reverse=True)

    result: List[Dict[str, Any]] = []
    counts: Dict[Any, int] = defaultdict(int)
    while any(group_buckets.values()):
        # Pick group with smallest representation so far
        group = min((g for g in group_buckets if group_buckets[g]), key=lambda g: counts[g])
        result.append(group_buckets[group].pop(0))
        counts[group] += 1
        if not group_buckets[group]:
            del group_buckets[group]
    return result
