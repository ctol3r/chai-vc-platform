generated-by: Codex 2025-09-26T00:00:00Z
# Release Process (MVP Lock)

## 1. Pre-Release Checklist
- [ ] `git status` clean on `main`
- [ ] Update `docs/RELEASE_NOTES.md` (if applicable)
- [ ] Bump version metadata (package(s), Prisma migrations, etc.)
- [ ] Run gating commands:
  ```bash
  npm ci
  npm run lint || true        # lint may live per workspace
  npm test                    # root hardhat sanity
  cd backend && npm run build && npm test -- --runInBand
  ./scripts/smoke_e2e.sh
  ```
- [ ] Confirm GitHub Actions `build`, `test`, and `smoke-e2e` workflows are green

## 2. Cut & Tag
```bash
VERSION=v1.2.3
BRANCH=release/$VERSION

git checkout -b "$BRANCH"
# commit release notes / version bumps
git commit -am "release: prepare $VERSION"

git tag -a "$VERSION" -m "Release $VERSION"
git push origin "$BRANCH"
git push origin "$VERSION"
```
Create the GitHub release from the pushed tag and attach changelog excerpts + CI badges.

## 3. Deploy
1. Merge the release branch into `main` via PR (required reviewers: `@backend-team`, `@product`).
2. Deploy to staging (auto). Validate:
   - `curl https://staging.chai-vc.com/healthz`
   - `curl https://staging.chai-vc.com/api/metrics | head`
3. Trigger production deploy (manual approval). Monitor:
   - `https://status.chai-vc.com`
   - Grafana dashboard `chai-vc/backend`
   - `smoke-e2e` workflow (must be green post-deploy)

## 4. Required Checks Before Prod Approval
| Check | Location | Owner |
| --- | --- | --- |
| Unit + integration tests | GitHub Actions `test` | `@backend-team` |
| Smoke e2e (`@smoke-e2e`) | GitHub Actions `smoke-e2e` | `@ops-team` |
| Lint/build | GitHub Actions `build` | Repo maintainers |
| Docs updated | PR description + reviewers | `@product` |
| Security scan (`npm audit --production`) | Local / CI artifact | `@security-team` |

## 5. Rollback Procedure
```bash
# Identify previous tag
PREV=v1.2.2

# Revert application deployments
kubectl rollout undo deployment/backend-api -n production
kubectl rollout undo deployment/frontend-app -n production

# Optional: reset database data (if migration shipped)
./backend/scripts/db_rollback.sh --target "$PREV"

# Re-tag main if necessary
git checkout main
git revert --no-commit "$VERSION"
git commit -m "revert: $VERSION hotfix"
```
Validate with:
```bash
curl https://api.chai-vc.com/healthz
curl https://api.chai-vc.com/api/status/cred_test_123 | jq '.status'
./scripts/smoke_e2e.sh
```
Notify `#prod-releases` and create a retro issue labeled `rollback`.

## 6. Post-Release
- Close the milestone and move unfinished issues forward
- Archive CI artifacts (`docs/smoke/<DATE>` when available)
- Update `docs/RELEASE_NOTES.md` with deployment timestamp and owner
- Schedule post-release review with `@product` + `@ops-team`
