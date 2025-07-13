#!/usr/bin/env python3
"""Generate anonymised pilot usage dashboard for stakeholders."""

import csv
from collections import Counter
from datetime import datetime
import hashlib
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "pilot_usage.csv"


def hash_identifier(identifier: str) -> str:
    """Return a hashed representation of a user identifier."""
    return hashlib.sha256(identifier.encode()).hexdigest()[:10]


def load_data(path: Path):
    with path.open(newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            yield {
                "user": hash_identifier(row["user_id"]),
                "credential_type": row["credential_type"],
                "result": row["verification_result"],
                "timestamp": datetime.strptime(row["timestamp"], "%Y-%m-%d"),
            }


def generate_metrics(records):
    total = 0
    users = set()
    by_credential = Counter()
    by_result = Counter()
    by_date = Counter()

    for r in records:
        total += 1
        users.add(r["user"])
        by_credential[r["credential_type"]] += 1
        by_result[r["result"]] += 1
        by_date[r["timestamp"].date()] += 1

    return {
        "total": total,
        "unique_users": len(users),
        "by_credential": by_credential,
        "by_result": by_result,
        "by_date": by_date,
    }


def display_dashboard(metrics):
    print("Pilot Usage Dashboard (Anonymised)")
    print("=" * 40)
    print(f"Total verifications: {metrics['total']}")
    print(f"Unique users: {metrics['unique_users']}")
    print("\nBy Credential Type:")
    for cred, count in metrics["by_credential"].items():
        print(f"  {cred}: {count}")
    print("\nBy Verification Result:")
    for result, count in metrics["by_result"].items():
        print(f"  {result}: {count}")
    print("\nDaily Activity:")
    for date, count in sorted(metrics["by_date"].items()):
        print(f"  {date}: {count}")


def main():
    records = list(load_data(DATA_PATH))
    metrics = generate_metrics(records)
    display_dashboard(metrics)


if __name__ == "__main__":
    main()
