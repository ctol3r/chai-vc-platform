import sys, pathlib
sys.path.append(str(pathlib.Path(__file__).resolve().parents[1] / "src"))
import asyncio
import time

from pipeline import AIVerificationOrchestrator
import pytest

@pytest.mark.asyncio
async def test_parallel_execution_faster_than_sequential():
    credentials = ["a", "bb", "ccc"]
    orchestrator = AIVerificationOrchestrator()

    async def run_sequential():
        results = []
        for c in credentials:
            results.append(await orchestrator.verifier(c))
        return results

    start_seq = time.perf_counter()
    await run_sequential()
    seq_duration = time.perf_counter() - start_seq

    start_parallel = time.perf_counter()
    await orchestrator.verify_all(credentials)
    par_duration = time.perf_counter() - start_parallel

    assert par_duration < seq_duration
