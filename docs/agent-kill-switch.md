generated-by: Claude 2025-09-26T00:00:00Z
# Agent Kill-Switch SOP

## Purpose
Emergency procedure to pause/disable AI agents (Codex/Claude) from making changes to the repository.

## Kill-Switch Activation
```bash
# Create kill-switch file
echo "STOP_AGENTS=1" > scripts/agent_kill_switch
git add scripts/agent_kill_switch
git commit -m "EMERGENCY: Activate agent kill-switch"
git push origin main
```

## Verification
```bash
# Check if kill-switch is active
if [ -f scripts/agent_kill_switch ] && grep -q "STOP_AGENTS=1" scripts/agent_kill_switch; then
  echo "✅ Kill-switch ACTIVE - Agents are disabled"
else
  echo "❌ Kill-switch INACTIVE - Agents can operate"
fi
```

## Reactivation
```bash
# Remove kill-switch
rm scripts/agent_kill_switch
git add scripts/agent_kill_switch
git commit -m "Deactivate agent kill-switch"
git push origin main
```

## When to Use
- Security incident involving agent behavior
- Compliance violation by agent changes
- Quality issues from agent PRs
- Emergency regulatory response

## Owners
- **Activation Authority**: @cto, @security-team, @legal-compliance
- **Technical Implementation**: @backend-team