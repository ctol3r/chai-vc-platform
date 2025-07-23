from typing import Tuple


def generate_composite_risk_score(npdb_score: float, oig_score: float, state_score: float, weights: Tuple[float, float, float] | None = None) -> float:
    """Return weighted composite risk score from NPDB, OIG and state checks.

    Each score should be between 0 and 1 inclusive. Optional ``weights`` can
    be provided as a tuple of three floats that sum to ``1``. The default
    weighting is ``(0.5, 0.3, 0.2)`` for NPDB, OIG and state respectively.
    """
    if weights is None:
        weights = (0.5, 0.3, 0.2)

    if len(weights) != 3:
        raise ValueError("weights must contain three values")

    if not abs(sum(weights) - 1.0) < 1e-6:
        raise ValueError("weights must sum to 1")

    for name, value in {
        "npdb_score": npdb_score,
        "oig_score": oig_score,
        "state_score": state_score,
    }.items():
        if not 0 <= value <= 1:
            raise ValueError(f"{name} must be between 0 and 1")

    w_npdb, w_oig, w_state = weights
    return npdb_score * w_npdb + oig_score * w_oig + state_score * w_state
