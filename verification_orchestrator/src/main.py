"""Command line entry for Verification Orchestrator."""

import asyncio
import os

from poller import VerificationPoller


async def main() -> None:
    npdb_url = os.getenv("NPDB_URL", "https://example.com/npdb")
    state_urls_env = os.getenv("STATE_URLS", "https://example.com/state1,https://example.com/state2")
    state_urls = state_urls_env.split(",") if state_urls_env else []
    interval = float(os.getenv("POLL_INTERVAL", "60"))

    poller = VerificationPoller(npdb_url, state_urls, interval)
    await poller.run()


if __name__ == "__main__":
    asyncio.run(main())
