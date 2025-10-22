# 01 — HIPAA Mapping

This document maps technical and administrative safeguards to HIPAA requirements. It focuses on transport, storage, access controls, auditing, and least privilege.

Controls (high level)
- Transport security: TLS 1.3 everywhere (HSTS; AEAD ciphers only).
- Data at rest: AES‑256‑GCM using envelope keys; credential payloads encrypted off‑chain.
- On‑chain data: hash‑only (sha‑256) of canonical VC JSON; no PHI stored on‑chain.
- Access control: RBAC/least‑privilege; scoped OAuth2/OIDC; code owners for sensitive paths.
- Audit: append‑only JSONL logs for issue/present/revoke and NPDB gates; optional on‑chain anchoring of audit hashes.
- Key management: rotation policy (scheduled), KMS backed; keys never leave HSM/KMS.
- Backups/DR: encrypted backups; game‑day drill with checksum verification; RPO/RTO targets.

Evidence
- See Policies, Audit Samples, and DR reports in this binder.
