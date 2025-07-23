import json
import argparse
from pathlib import Path


def parse_args():
    parser = argparse.ArgumentParser(
        description="Collect SOC 2 evidence from a terraform-compliance JSON report"
    )
    parser.add_argument("report", type=Path, help="Path to terraform-compliance JSON report")
    parser.add_argument("output", type=Path, help="Where to write parsed SOC 2 evidence")
    return parser.parse_args()


def collect(report_path: Path) -> dict:
    with report_path.open() as f:
        data = json.load(f)

    summary = data.get("summary", {})
    scenario = summary.get("scenario", {})
    features = summary.get("features", {})

    evidence = {
        "total_features": features.get("total", 0),
        "passed_features": features.get("passed", 0),
        "failed_features": features.get("failed", 0),
        "total_scenarios": scenario.get("total", 0),
        "passed_scenarios": scenario.get("passed", 0),
        "failed_scenarios": scenario.get("failed", 0),
        "results": data.get("results", []),
    }
    return evidence


def main():
    args = parse_args()
    evidence = collect(args.report)
    with args.output.open("w") as f:
        json.dump(evidence, f, indent=2)
    print(f"Evidence written to {args.output}")


if __name__ == "__main__":
    main()
