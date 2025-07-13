# API Outage

This runbook outlines steps to resolve an unexpected API outage.

1. **Confirm the outage**
   - Check monitoring dashboards and logs to verify errors.
   - Determine whether the outage affects all users or a subset.
2. **Gather logs and metrics**
   - Inspect pod logs for stack traces or error messages:
     ```bash
     kubectl logs deployment/backend
     ```
   - Review recent deployments or configuration changes that may have triggered the issue.
3. **Roll back or redeploy**
   - If a recent deployment is suspected, roll back to the previous stable version:
     ```bash
     kubectl rollout undo deployment/backend
     ```
   - Alternatively, redeploy the current version to clear transient issues:
     ```bash
     kubectl rollout restart deployment/backend
     ```
4. **Verify recovery**
   - Monitor API health endpoints until successful responses return.
   - Notify stakeholders once the API is stable.
