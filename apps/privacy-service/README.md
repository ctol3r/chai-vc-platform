# Privacy Service (MVP Scaffold)

This service exposes deterministic endpoints that other components can use while the real BBS+/zk proof engines are under development.

## Endpoints
- `GET /health` — simple health check returning `{ status: 'ok' }`.
- `POST /prove` — accepts `{ subjectId, claims, audience?, revealFields? }` and returns a proof record containing the issued credential and disclosure proof.
- `POST /verify` — accepts `{ credential, proof }` and returns `{ valid, checkedAt, details }` based on the BBS+ shim.
- `GET /keyinfo` — lists the available signing keys for the stub environment.

See `apps/privacy-service/openapi.yaml` for the API contract.

## BBS+ Stub
The module in `src/lib/bbsplus.ts` is a deterministic shim that hashes claim payloads to emulate BBS+ signatures and selective disclosure. **It is not cryptographically secure** and should be replaced with a production-grade library as part of the follow-up cryptography tasks.

## Development
```bash
npm install
npm run dev
```
The service listens on `PORT` (default `5050`).

## Testing
```bash
npm run build
npm test
```

These commands are safe to run offline; the proof logic intentionally does not call any external services.
