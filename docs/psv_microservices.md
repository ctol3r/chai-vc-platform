# PSV Microservices Architecture

This document outlines a modular microservices approach for Primary Source Verification (PSV) in the Chai VC Platform. Each step of the verification workflow is encapsulated in its own service and orchestrated centrally using Kubernetes.

## Microservices Overview

- **gateway** – Single entry point that routes external API requests to internal services.
- **psv-api** – Exposes HTTP endpoints for requesting verification operations.
- **source-connector** – Connects to various licensing boards and third-party data sources.
- **verification-worker** – Executes verification jobs asynchronously using a message queue.
- **notification-service** – Sends status updates and verification results.
- **ai-matcher-service** – Reusable component for matching data to credential records.
- **psv-db** – Database storing verification history and job metadata.

## Central Orchestration

All services are deployed into a Kubernetes cluster. The `gateway` service sits in front of the internal API layer, while the `verification-worker` processes tasks pulled from a shared queue. Service discovery and scaling are handled by Kubernetes, ensuring each microservice can be updated independently.

## Local Development

`docker-compose.yml` contains stubbed definitions for these services so developers can spin up the full stack locally.
