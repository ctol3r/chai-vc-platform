generated-by: Codex 2025-09-26T00:00:00Z
# Smoke E2E Testing Runbook (MVP Lock)

## Workflow Overview
- **Workflow file**: `.github/workflows/smoke-e2e.yml`
- **Job name**: `smoke`
- **Triggers**: nightly at 03:00 UTC (`cron: "0 3 * * *"`), on every PR, and manual `workflow_dispatch`
- **Runtime**: Ubuntu runner + Node.js 20
- **Script executed**: `npm ci` → `npm run build` → `npx jest --config=jest.config.cjs -t "@smoke-e2e" --runInBand`

## Running the Check Locally
```bash
export PRIVACY_CLIENT_MODE=dev
cd backend
npm ci
npm run build
npx jest --config=jest.config.cjs -t "@smoke-e2e" --runInBand -i
```
Alternatively, run the wrapper script:
```bash
./scripts/smoke_e2e.sh
```

## Interpreting CI Results
| Outcome | Indicators | Action |
| --- | --- | --- |
| ✅ **Success** | Job green, jest reports `1 passed` | No follow-up required. Confirm dashboards if part of release gate. |
| ⚠️ **Failed assertions** | Jest failure with HTTP `404/500` or mismatch | Check backend logs (see Artifacts & Logs). Re-run locally with same command. |
| 🚫 **Setup failure** | `npm ci`/`npm run build` step fails | Investigate dependency drift; re-run locally, open issue if reproducible. |
| ⏹️ **Cancelled/Skipped** | Manual cancel, upstream workflow aborted | Ensure smoke job rerun before merge/deploy. |

## Artifacts & Logs
- GitHub Actions automatically retains the step logs. Click **📝 Smoke E2E → Download logs** for a zipped archive (`smoke/logs.zip`).
- Jest output also appears in the job summary; copy the failure block into the incident ticket.
- When running locally, the wrapper script writes console output to stdout—capture it via `./scripts/smoke_e2e.sh | tee smoke.log` if sharing.

## Owners & Escalation
- **Primary owner**: `@backend-team`
- **Secondary/on-call**: `@ops-team`
- **Slack channel**: `#alerts-production`
- **PagerDuty service**: `chai-vc-smoke`
- Escalate to `@legal-compliance` if failures involve PHI redaction or privacy adapters.

## Triage Checklist (Failure)
1. Re-run the job from Actions with "Run workflow" (use same commit).
2. If still failing, reproduce locally using the commands above.
3. Collect relevant logs (`download logs` or `tee smoke.log`).
4. File/ update the incident in Shortcut (`Team: Backend Ops`, label `smoke-failure`).
5. Notify Slack channel and tag on-call.
6. Once fixed, re-run smoke → ensure green before unpausing deploy pipelines.

## Related References
- [API Examples](../api/README.md)
- [Rollback SOP](rollback-sop.md)
- [Observability Guide](observability.md)
- [Makefile smoke target](../../Makefile)
