"""Asynchronous polling logic for NPDB and state APIs."""

import asyncio
from typing import List

import aiohttp


class APIClient:
    """Generic HTTP client using aiohttp."""

    def __init__(self, session: aiohttp.ClientSession) -> None:
        self._session = session

    async def fetch_json(self, url: str) -> dict:
        async with self._session.get(url) as resp:
            resp.raise_for_status()
            return await resp.json()


class VerificationPoller:
    """Periodically polls verification sources."""

    def __init__(self, npdb_url: str, state_urls: List[str], interval: float = 60.0) -> None:
        self.npdb_url = npdb_url
        self.state_urls = state_urls
        self.interval = interval

    async def poll_once(self, client: APIClient) -> None:
        npdb_data = await client.fetch_json(self.npdb_url)
        state_data = [await client.fetch_json(url) for url in self.state_urls]
        self.process_results(npdb_data, state_data)

    def process_results(self, npdb_data: dict, state_data: List[dict]) -> None:
        """Placeholder for processing fetched data."""
        print("NPDB", npdb_data)
        for idx, data in enumerate(state_data):
            print(f"STATE {idx}", data)

    async def run(self) -> None:
        async with aiohttp.ClientSession() as session:
            client = APIClient(session)
            while True:
                await self.poll_once(client)
                await asyncio.sleep(self.interval)
