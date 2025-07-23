import os, sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from engine.step_order_rl import Step, StepOrderOptimizer


def test_optimizer_returns_order():
    steps = [
        Step("a", 0.3),
        Step("b", 0.1),
        Step("c", 0.2),
    ]
    opt = StepOrderOptimizer(steps)
    opt.train(episodes=100)
    order = opt.best_order()
    assert len(order) == len(steps)
    assert set(s.name for s in order) == {"a", "b", "c"}

