import datetime
import logging
import time

logging.basicConfig(level=logging.INFO)


def refresh_psv() -> None:
    """Refresh Primary Source Verification records."""
    logging.info("Refreshing PSV records")


def check_and_run(current_time: datetime.datetime, last_run_month: int | None) -> int | None:
    """Run refresh on the first day of the month."""
    if current_time.day == 1 and current_time.month != last_run_month:
        refresh_psv()
        return current_time.month
    return last_run_month


def run_service() -> None:
    """Start the continuous monitoring loop."""
    logging.info("Continuous monitoring service started")
    last_run: int | None = None
    while True:
        now = datetime.datetime.utcnow()
        last_run = check_and_run(now, last_run)
        time.sleep(86400)  # Check once per day


if __name__ == "__main__":
    run_service()
