"""Simple offline simulator for credentialing scenarios."""

import json
from dataclasses import dataclass
from typing import Dict, List

@dataclass
class Credential:
    id: str
    issuer: str
    subject: str
    status: str

def load_scenario(path: str) -> Dict:
    with open(path, 'r') as f:
        return json.load(f)

def run_scenario(data: Dict) -> List[Dict]:
    credentials = [Credential(**c) for c in data.get('credentials', [])]
    actions = data.get('actions', [])
    results = []
    for action in actions:
        cred = next((c for c in credentials if c.id == action.get('credential_id')), None)
        if not cred:
            results.append({
                'action': action.get('type'),
                'credential_id': action.get('credential_id'),
                'result': 'credential not found'
            })
            continue
        if action.get('type') == 'revoke':
            cred.status = 'revoked'
            results.append({
                'action': 'revoke',
                'credential_id': cred.id,
                'result': 'revoked'
            })
        elif action.get('type') == 'verify':
            results.append({
                'action': 'verify',
                'credential_id': cred.id,
                'result': cred.status
            })
        else:
            results.append({
                'action': action.get('type'),
                'credential_id': cred.id,
                'result': 'unknown action'
            })
    return results

def main(scenario_path: str) -> None:
    data = load_scenario(scenario_path)
    results = run_scenario(data)
    for r in results:
        print(f"{r['action']} {r['credential_id']}: {r['result']}")

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='Run credentialing scenario offline.')
    parser.add_argument('scenario', help='Path to scenario JSON file')
    args = parser.parse_args()
    main(args.scenario)
