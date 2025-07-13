import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from routes.match import get_match_alerts


def test_match_alerts_returns_list():
    alerts = get_match_alerts("user1")
    assert isinstance(alerts, list)
