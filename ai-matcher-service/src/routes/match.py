"""Match alert generation with hospital emergency trigger integration."""
from typing import List
from services.hospital_triggers import fetch_hospital_emergency_triggers


def get_match_alerts(user_id: str) -> List[str]:
    """Return match alerts for the given user."""
    alerts = [f"Match found for user {user_id}"]
    for trigger in fetch_hospital_emergency_triggers():
        alerts.append(f"Emergency trigger: {trigger}")
    return alerts
