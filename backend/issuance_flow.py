"""Optimized issuance flow implementation for chai-vc-platform."""
from __future__ import annotations

import concurrent.futures
import time


def _fetch_template(template_id: str) -> dict:
    """Simulate fetching a credential template."""
    time.sleep(0.5)  # Simulated I/O delay
    return {"id": template_id, "data": "template"}


def _fetch_user(user_id: str) -> dict:
    """Simulate retrieving user information."""
    time.sleep(0.5)
    return {"id": user_id, "name": "User"}


def _sign(credential: dict) -> None:
    """Simulate signing a credential."""
    time.sleep(0.5)


def _store(credential: dict) -> None:
    """Simulate storing a credential issuance event."""
    time.sleep(0.5)


def optimized_issuance_flow(template_id: str, user_id: str) -> float:
    """Run the issuance flow using concurrent operations.

    Returns the total time taken in seconds.
    """
    start = time.perf_counter()

    with concurrent.futures.ThreadPoolExecutor() as executor:
        template_future = executor.submit(_fetch_template, template_id)
        user_future = executor.submit(_fetch_user, user_id)
        template = template_future.result()
        user = user_future.result()

    credential = {"template": template, "user": user}

    with concurrent.futures.ThreadPoolExecutor() as executor:
        executor.submit(_sign, credential)
        executor.submit(_store, credential)

    duration = time.perf_counter() - start
    return duration
