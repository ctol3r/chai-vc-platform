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
- Added OIDC4VCI router + controller with metadata + pre-authorized code/token endpoints.
- Implemented in-memory `PreAuthorizedCodeService` with nonce binding & replay protection stub.
- Updated express app wiring; new contract tests cover happy path + failure scenarios.

## Tests
- `cd backend && npx jest --coverage --runTestsByPath __tests__/oidc4vci.test.ts`
- Coverage: `controllers/oidc4vci_controller.ts` 92% lines; `services/preAuthorizedCodeService.ts` 87.5% lines.

## Risk Notes
- Service storage is in-memory only; follow-up required for persistent cache/DB.
- Lint/type gates pending full CI invocation.

CI: local jest (subset)
