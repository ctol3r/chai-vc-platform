import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src')))

from pricing.price_agent import (
    compute_fee,
    compute_staking_rate,
    adjust_pricing,
    DemandMetrics,
)


def test_adjust_pricing():
    metrics = DemandMetrics(volume=500, volatility=20)
    pricing = adjust_pricing(metrics)
    assert 0 < pricing["fee"] <= 1
    assert 0 <= pricing["staking_rate"] <= 0.2
