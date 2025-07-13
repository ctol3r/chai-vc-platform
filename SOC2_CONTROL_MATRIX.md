# SOC 2 Type I Control Matrix

This matrix maps the repository's implemented features to the SOC 2 Trust Services Criteria (TSC). The project is in the early stages and many modules are placeholders. The mapping below reflects how current components relate to Security, Availability, Processing Integrity, Confidentiality and Privacy requirements.

| Feature/Component | Description | Relevant SOC 2 TSC |
|-------------------|-------------|--------------------|
| Blockchain Integration (`backend/src/blockchain`) | Placeholder modules for integrating with Polkadot to store and verify credentials. | Security, Confidentiality, Processing Integrity |
| Credential Controller (`backend/src/controllers`) | API controller scaffold for issuing and managing credentials. | Security, Processing Integrity |
| GraphQL API (`backend/src/graphql`) | Entry point for GraphQL queries and mutations. | Security, Availability |
| AI Matcher Service (`ai-matcher-service/src`) | Python service intended to match applicants to job requirements. | Processing Integrity |
| Kubernetes Manifests (`k8s/`) | Deployment definitions for the backend and AI matcher services. | Availability, Security |
| Docker Compose (`docker-compose.yml`) | Local orchestration for services to aid development and testing. | Availability |
| Tests and CI (`ai-matcher-service/tests`, `backend/__tests__`, `.github/workflows`) | Initial test scaffolds and CI workflow files that lay the groundwork for code quality checks. | Security, Processing Integrity |
| Frontend Pages (`frontend/pages`) | Stub Next.js page for credential display. | Security, Confidentiality |

This control matrix will expand as functionality matures and more explicit controls are implemented in the codebase.
