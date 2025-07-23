import itertools
import random
from typing import Callable, List, Tuple

class Step:
    """Represents a single step in the engine."""
    def __init__(self, name: str, duration: float, fn: Callable[[], None] = None):
        self.name = name
        self.duration = duration
        self.fn = fn if fn is not None else (lambda: None)

    def run(self) -> float:
        """Execute the step and return its duration."""
        self.fn()
        return self.duration

class StepOrderOptimizer:
    """Simple reinforcement learning optimizer that searches for the order of
    steps with the best throughput."""

    def __init__(self, steps: List[Step]):
        self.steps = steps
        self.orders = list(itertools.permutations(range(len(steps))))
        self.q_values = {o: 0.0 for o in self.orders}
        self.counts = {o: 0 for o in self.orders}

    def _throughput(self, order: Tuple[int, ...]) -> float:
        total_time = sum(self.steps[i].duration for i in order)
        return len(order) / total_time

    def _choose_order(self, epsilon: float) -> Tuple[int, ...]:
        if random.random() < epsilon or all(c == 0 for c in self.counts.values()):
            return random.choice(self.orders)
        return max(self.orders, key=lambda o: self.q_values[o])

    def train(self, episodes: int = 1000, epsilon: float = 0.1) -> None:
        for _ in range(episodes):
            order = self._choose_order(epsilon)
            reward = self._throughput(order)
            self.counts[order] += 1
            c = self.counts[order]
            # running average update
            self.q_values[order] += (reward - self.q_values[order]) / c

    def best_order(self) -> List[Step]:
        best = max(self.orders, key=lambda o: self.q_values[o])
        return [self.steps[i] for i in best]

if __name__ == "__main__":
    # demo usage
    steps = [
        Step("fetch", 0.3),
        Step("process", 0.1),
        Step("store", 0.2),
    ]
    opt = StepOrderOptimizer(steps)
    opt.train(episodes=5000)
    order = opt.best_order()
    print("Optimized order:", [s.name for s in order])
