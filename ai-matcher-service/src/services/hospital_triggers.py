from typing import List
import random


def fetch_hospital_emergency_triggers() -> List[str]:
    """Simulate retrieval of real-time hospital emergency triggers."""
    triggers = ["Code Blue", "Mass Casualty", "Active Shooter"]
    if random.random() > 0.5:
        # Return a random trigger to simulate an emergency event
        return [random.choice(triggers)]
    return []
