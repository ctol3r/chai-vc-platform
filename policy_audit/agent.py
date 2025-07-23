import hashlib
import json
import os
import time
from pathlib import Path

# Directory containing policy documents to audit
POLICY_DIR = Path(__file__).resolve().parent.parent / "policies"
# File where baseline hashes are stored
BASELINE_FILE = Path(__file__).resolve().parent / "policy_hashes.json"
# Interval between audits in seconds
SLEEP_SECONDS = 60

def compute_hash(path: Path) -> str:
    """Return sha256 hex digest for the given file."""
    h = hashlib.sha256()
    with path.open('rb') as f:
        h.update(f.read())
    return h.hexdigest()

def load_baseline() -> dict:
    if BASELINE_FILE.exists():
        with BASELINE_FILE.open() as f:
            return json.load(f)
    return {}

def save_baseline(hashes: dict) -> None:
    with BASELINE_FILE.open('w') as f:
        json.dump(hashes, f, indent=2)

def audit_once() -> tuple[dict, bool]:
    """Check current policy hashes against baseline."""
    baseline = load_baseline()
    current_hashes = {}
    drift_detected = False
    for file in POLICY_DIR.glob('**/*'):
        if file.is_file():
            current_hash = compute_hash(file)
            current_hashes[str(file)] = current_hash
            if (
                str(file) in baseline
                and baseline[str(file)] != current_hash
            ):
                print(f"Policy drift detected: {file}")
                drift_detected = True
    return current_hashes, drift_detected

def run_continuous() -> None:
    """Continuously audit policies."""
    while True:
        hashes, _ = audit_once()
        save_baseline(hashes)
        time.sleep(SLEEP_SECONDS)

if __name__ == "__main__":
    run_continuous()
