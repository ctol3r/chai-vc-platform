# API Gateway

This service provides a Mirai-style gateway that federates on-chain and off-chain calls securely. Requests must include a valid `X-API-KEY` header. The gateway calls both services in parallel and returns a combined response.

## Running

```bash
uvicorn api_gateway.main:app --reload
```

Environment variables:
- `API_KEY` – API key used to authorize requests (default `test-key`).
- `ON_CHAIN_URL` – base URL for the on-chain service.
- `OFF_CHAIN_URL` – base URL for the off-chain service.
