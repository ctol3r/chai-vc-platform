# PR Placeholder: OIDC4VCI-Issuer-Metadata

- Owner: Codex
- Branch: `feat/oidc4vci-issuer`
- Behind-Feature-Flag: ✅
- Target Coverage: ≥80% on touched modules

## Checklist
- [x] Issuer metadata endpoint stubbed (`/.well-known/openid-credential-issuer`)
- [x] Pre-authorized code flow scaffolded (`/oidc4vci/pre-authorized-code`, `/oidc4vci/token`)
- [x] Unit/integration tests ≥80% coverage (jest subset)
- [ ] Lint & type checks green
- [x] Security controls & replay protections logged (nonce binding + replay guard)

## Summary
- Added OIDC4VCI router + controller with metadata (nonce_endpoint + grants.pre-authorized_code), nonce endpoint, health probe, and hardened pre-authorized code/token handlers.
- Enforced PKCE S256 only, replay detection (c_nonce expiry + reuse), strict grant_type + tx_code validation, and richer token/metadata payloads (grants + tx_code schema when enabled).
- Extracted pre-authorized code persistence behind swappable stores with atomic Redis-backed implementation (feature-flagged) and nonce registry abstraction with Redis/memory probes.
- Wired nonce issuance into metadata + responses, added Redis health endpoint (204 disabled / 200 ok / 503 error), and expanded service/controller tests covering expiry, replay, tx_code, store fallbacks, and Redis factory probes.

## Tests
- `cd backend && npm test -- --coverage --coverageDirectory=../coverage --runTestsByPath __tests__/redisClientFactory.test.ts __tests__/preAuthorizedCodeService.test.ts __tests__/oidc4vci.controller.test.ts`
- Coverage: `controllers/oidc4vci_controller.ts` 94.59% lines; `services/preAuthorizedCodeService.ts` 99.18% lines; `services/redisClientFactory.ts` 87.87% lines; overall 92.47% lines.

## Risk Notes
- Redis feature flag still defaults to in-memory when redis-cli ping fails; production deploy needs Redis connectivity + eviction policies.
- Token handler still returns opaque stub access_token; credential issuance wiring pending.
- Lint/type gates pending full CI invocation.

CI: local jest (subset) + backend-coverage job exercises enforce-coverage script on backend touches.

Redis local: `docker run --rm -p 6379:6379 redis:7` then `OIDC_PRE_AUTH_STORE=redis REDIS_URL=redis://127.0.0.1:6379 LOG_LEVEL=debug npm test -- --runTestsByPath __tests__/preAuthorizedCodeService.test.ts`.

## Metadata & Health Snapshot
- Example metadata payload excerpt:
  ```json
  {
    "nonce_endpoint": "https://issuer.chai.example/oidc4vci/nonce",
    "grants": {
      "urn:ietf:params:oauth:grant-type:pre-authorized_code": {
        "pre-authorized_code": {
          "tx_code": { "required": false }
        }
      }
    }
  }
  ```
  (when `OIDC_REQUIRE_TX_CODE=true`, `tx_code` includes `{ "required": true, "length": <n>, "format": "numeric" }`).
- `/health/redis` responses:
  | Feature flag | Result |
  | --- | --- |
  | `OIDC_PRE_AUTH_STORE != redis` | `204 No Content`
  | Redis reachable | `200 OK {"status":"ok"}`
  | Redis failure | `503 Service Unavailable {"status":"unhealthy","error":"..."}`
