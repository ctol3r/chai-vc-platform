import os
import asyncio
from fastapi import FastAPI, HTTPException, Header
import httpx

API_KEY = os.getenv("API_KEY", "test-key")
ON_CHAIN_URL = os.getenv("ON_CHAIN_URL", "http://blockchain-service")
OFF_CHAIN_URL = os.getenv("OFF_CHAIN_URL", "http://offchain-service")

app = FastAPI(title="Mirai Style API Gateway")

async def fetch_on_chain(item_id: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{ON_CHAIN_URL}/data/{item_id}")
        resp.raise_for_status()
        return resp.json()

async def fetch_off_chain(item_id: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{OFF_CHAIN_URL}/data/{item_id}")
        resp.raise_for_status()
        return resp.json()

@app.get("/aggregate/{item_id}")
async def aggregate(item_id: str, x_api_key: str = Header(None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    try:
        on_chain, off_chain = await asyncio.gather(
            fetch_on_chain(item_id),
            fetch_off_chain(item_id),
        )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return {"on_chain": on_chain, "off_chain": off_chain}
