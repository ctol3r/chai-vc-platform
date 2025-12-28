from pricing.cost_model import VerificationCostModel


def main() -> None:
    model = VerificationCostModel(cost_per_pod_hour=0.25)
    pods = [1, 2, 3, 4]
    verifications_per_pod_hour = 120
    print("pods,cost_per_verification")
    for p in pods:
        cost = model.cost_per_verification(p, verifications_per_pod_hour)
        print(f"{p},{cost:.6f}")


if __name__ == "__main__":
    main()
