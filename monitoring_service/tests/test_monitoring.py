import datetime
from unittest.mock import patch

import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

import monitoring_service.continuous_monitoring as cm


def test_check_and_run_triggers_on_first_day() -> None:
    month = None
    with patch("monitoring_service.continuous_monitoring.refresh_psv") as mock_refresh:
        month = cm.check_and_run(datetime.datetime(2025, 1, 1), month)
        mock_refresh.assert_called_once()
        assert month == 1


def test_check_and_run_not_triggered_other_days() -> None:
    month = None
    with patch("monitoring_service.continuous_monitoring.refresh_psv") as mock_refresh:
        month = cm.check_and_run(datetime.datetime(2025, 1, 2), month)
        mock_refresh.assert_not_called()
        assert month is None
