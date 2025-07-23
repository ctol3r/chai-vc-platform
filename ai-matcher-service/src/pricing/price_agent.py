import math
from dataclasses import dataclass

@dataclass
class DemandMetrics:
    volume: float
    volatility: float


def compute_fee(metrics: DemandMetrics) -> float:
    """Compute a transaction fee based on demand metrics."""
    base_fee = 0.02  # 2% base
    demand_factor = metrics.volume / 1000.0
    volatility_factor = metrics.volatility / 100.0
    fee = base_fee + 0.01 * demand_factor + 0.01 * volatility_factor
    return min(fee, 1.0)


def compute_staking_rate(metrics: DemandMetrics) -> float:
    """Compute a staking reward rate based on demand metrics."""
    base_rate = 0.05  # 5% base
    demand_factor = metrics.volume / 1000.0
    volatility_factor = metrics.volatility / 100.0
    rate = base_rate + 0.02 * demand_factor - 0.01 * volatility_factor
    return max(0.0, min(rate, 0.2))


def adjust_pricing(metrics: DemandMetrics) -> dict:
    """Return pricing adjustments for given demand metrics."""
    return {
        "fee": compute_fee(metrics),
        "staking_rate": compute_staking_rate(metrics),
    }
