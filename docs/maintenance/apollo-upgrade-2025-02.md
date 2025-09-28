# Apollo Server Upgrade — February 2025

## Intent
Replace deprecated `apollo-server` v3 packages with the actively maintained `@apollo/server` v4, ensuring the backend GraphQL stack stays within the supported window ahead of issuing/verifier enhancements.

## Context
`apollo-server` and `apollo-server-express` reached end-of-life in 2023. Continuing on v3 blocks security patches and conflicts with TypeScript strict mode. The backend now uses the v4 Express middleware while preserving the existing schema and resolver stubs.

## Assumptions
- Contributors will run `npm install` in `backend/` to refresh `package-lock.json` with the new dependency graph (SAFE profile prevented running it here).
- Existing resolvers remain placeholders; behaviour should stay identical after the transport swap.
- CI workflows updated earlier (Task 6) will install dependencies before running lint/build/test, catching runtime regressions once the lockfile is refreshed.

## Risks & Mitigations
- **Missing type definitions**: Until `@apollo/server` is installed, TypeScript lacks typings → provided temporary ambient declarations in `src/types/apollo-server.d.ts` so the codebase compiles under strict mode.
- **Body parsing changes**: v4 requires explicit JSON middleware → `/graphql` route now uses `express.json()` to mirror previous behaviour.
- **Lockfile drift**: `package-lock.json` needs regeneration post-install → call this out in the PR checklist.

## UX / DevX Notes
- `startApolloServer` now mounts `expressMiddleware` at `/graphql`, maintaining the same endpoint while adopting async context functions.
- Developers launching via `npm run dev` observe no change; the new middleware honours the existing Express app wiring.

## Acceptance Tests (after installing deps)
1. `cd backend && npm install && npm run build` — ensures TypeScript emit with `@apollo/server` present.
2. `npm test -- --runInBand` — validates Jest suites continue to pass once middleware is updated.
3. `curl -s http://localhost:4000/graphql` — returns Apollo landing page disabled (same 405 as before) confirming route registration.

## Deliverables
- `backend/package.json` — swapped deprecated deps for `@apollo/server`.
- `backend/src/graphql/graphql_api_scaffold.ts` — new middleware wiring and typed context.
- `backend/src/server.ts` — removed unused `express` import.
- `backend/src/types/apollo-server.d.ts` — interim type declarations until lockfile is regenerated.
