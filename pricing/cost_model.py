class VerificationCostModel:
    """Compute cost per verification based on pod spend."""

    def __init__(self, cost_per_pod_hour: float):
        self.cost_per_pod_hour = cost_per_pod_hour

    def cost_per_verification(
        self, pods: int, verifications_per_pod_hour: float
    ) -> float:
        if pods <= 0 or verifications_per_pod_hour <= 0:
            raise ValueError("pods and verifications must be positive")
        hourly_cost = pods * self.cost_per_pod_hour
        total_verifications = pods * verifications_per_pod_hour
        return hourly_cost / total_verifications
