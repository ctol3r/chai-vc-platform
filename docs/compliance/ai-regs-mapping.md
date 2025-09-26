generated-by: Claude 2025-09-26T00:00:00Z
# CA ADS & CO AI Act Mapping (Dev-Facing)

## Intent
Summarize engineering controls we must show for ADS/AI laws (developer lens).

## Controls & Where We Satisfy Them
- **Notice & Disclosure**: user sees AI use + opt-out → `docs/messaging/ai-disclosure.md`; UI copy in CONSENT views.
- **Explainability**: "Explain this Match" → log rationale, export for auditors; code in verifier layer, docs in `ux/explainability-copy.md`.
- **Bias Testing**: quarterly audits → pipeline & storage under `docs/ETHICS/bias-audit-process.md`; store reports for ≥ 4y.
- **Human Override**: HITL queue → reviewer can approve/reject; data retained per retention policy.
- **Retention**: no PHI on-chain; logs redacted; erasure via digests → `docs/PRIVACY/data-retention-erasure-policy.md`.

## Gaps / TODO
- [ ] Finalize ADS wording for user-facing disclosure with Legal.
- [ ] Add dashboard for bias metrics SLOs.

## Owners
- Product (copy), Legal (review), Backend (instrumentation).