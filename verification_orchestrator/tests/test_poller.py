"""Tests for VerificationPoller."""

import asyncio
from unittest import mock

import pytest

from verification_orchestrator.src.poller import VerificationPoller, APIClient


class DummyClient(APIClient):
    def __init__(self, data_map):
        self.data_map = data_map

    async def fetch_json(self, url: str) -> dict:
        return self.data_map.get(url, {})


@pytest.mark.asyncio
async def test_poll_once(capsys):
    data = {
        "https://example.com/npdb": {"npdb": "ok"},
        "https://example.com/state1": {"state": 1},
        "https://example.com/state2": {"state": 2},
    }
    poller = VerificationPoller(
        "https://example.com/npdb",
        ["https://example.com/state1", "https://example.com/state2"],
        interval=0.1,
    )
    dummy = DummyClient(data)
    await poller.poll_once(dummy)
    captured = capsys.readouterr()
    assert "NPDB" in captured.out
    assert "STATE 0" in captured.out
