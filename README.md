# Chai VC Platform

Chai VC Platform is an experiment in providing end-to-end verification for healthcare credentials. The goal is to make it simple for employers to confirm a professional's qualifications while giving practitioners control over their data.

## Project Goals

- Provide a proof-of-concept for issuing and verifying healthcare credentials using blockchain technology.
- Offer a minimal hiring portal that allows recruiters to view and validate credentials.
- Explore how an AI matching service can connect available professionals with open positions.

## Architecture Overview

The repository is structured as a collection of small services:

- **Backend** – A Node.js/TypeScript service exposing GraphQL APIs and integrating with a Polkadot blockchain. The backend is where credentials are issued and verified.
- **AI Matcher Service** – A Python microservice that will contain matching algorithms used to pair candidates with jobs.
- **Frontend** – A Next.js (React/TypeScript) application serving the recruiter and candidate interfaces.
- **Infrastructure** – Docker Compose files for local development and basic Kubernetes manifests for deployment.

```
chai-vc-platform/
├── backend/                # GraphQL and blockchain integration
├── ai-matcher-service/     # Python FastAPI service (placeholder)
├── frontend/               # Next.js application
├── k8s/                    # Kubernetes manifests
└── docker-compose.yml      # Compose file for running services locally
```

## Tech Stack

- **Node.js & TypeScript** for the main backend service.
- **Python** (FastAPI) for the AI matcher microservice.
- **React & Next.js** for the web front‑end.
- **Prisma** (planned) for database access, typically backed by PostgreSQL.
- **Docker** and **Kubernetes** for containerized deployment.
- **Polkadot** integration for verifiable credential storage.

Most services in this repository are currently stubs or placeholders. They exist to outline how the project will be organized as development progresses.

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/chai-vc-platform.git
   cd chai-vc-platform
   ```
2. **Install dependencies**
   - For the backend you will eventually need Node.js ≥ 16.
   - The AI matcher service will require Python ≥ 3.9 and FastAPI.
   - Ensure Docker and Docker Compose are installed for local development.
3. **Start the stack locally**
   ```bash
   docker-compose up
   ```
   This will spin up the (currently mostly empty) services defined in `docker-compose.yml`.
4. **Kubernetes deployment**
   Example manifests are located in `k8s/`. They show how each component can be deployed in a cluster.

Because most services are placeholders, the application does not yet provide end‑user functionality. Contributions are welcome as we build out each piece.
