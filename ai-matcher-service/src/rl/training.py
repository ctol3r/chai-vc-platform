import random
from collections import defaultdict
from typing import Dict, List

class VerifierEnv:
    """Simple environment returning accept/reject feedback."""

    def __init__(self, accept_probabilities: List[float]):
        self.accept_probabilities = accept_probabilities
        self.num_actions = len(accept_probabilities)

    def step(self, action: int) -> int:
        """Return reward 1 for accept and 0 for reject."""
        if action < 0 or action >= self.num_actions:
            raise ValueError("Invalid action")
        return 1 if random.random() < self.accept_probabilities[action] else 0

class QLearningAgent:
    def __init__(self, num_actions: int, learning_rate: float = 0.1, discount: float = 0.9, epsilon: float = 0.1):
        self.num_actions = num_actions
        self.learning_rate = learning_rate
        self.discount = discount
        self.epsilon = epsilon
        self.q_values: Dict[int, float] = defaultdict(float)

    def choose_action(self) -> int:
        if random.random() < self.epsilon:
            return random.randint(0, self.num_actions - 1)
        values = [self.q_values[a] for a in range(self.num_actions)]
        return int(max(range(self.num_actions), key=lambda a: values[a]))

    def update(self, action: int, reward: int):
        current_q = self.q_values[action]
        self.q_values[action] = current_q + self.learning_rate * (reward + self.discount * 0 - current_q)


def train(env: VerifierEnv, episodes: int = 100) -> QLearningAgent:
    agent = QLearningAgent(env.num_actions)
    for _ in range(episodes):
        action = agent.choose_action()
        reward = env.step(action)
        agent.update(action, reward)
    return agent

if __name__ == "__main__":
    # Example probabilities for actions yielding 'accept'
    environment = VerifierEnv([0.3, 0.6, 0.9])
    trained_agent = train(environment, episodes=1000)
    for action in range(environment.num_actions):
        print(f"Action {action}: Q-value {trained_agent.q_values[action]:.2f}")

