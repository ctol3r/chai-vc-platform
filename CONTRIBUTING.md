## Commit messages
Follow Conventional Commits (e.g., `feat(runtime): add revoke extrinsic`). See https://www.conventionalcommits.org/.

## Prisma
Local: `npx prisma migrate dev`. CI/Prod: `npx prisma migrate deploy`. Never run `dev` in CI.

## Substrate
If you change a pallet, regenerate weights and commit `weights.rs`. If runtime API changes, bump `spec_version`.

