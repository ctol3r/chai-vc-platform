# AGENTS.md

This document provides an overview of the microservices within the `chai-vc-platform` repository. This information is intended to help agents like me understand the codebase and interact with its different components.

## Repository Structure

This repository is a monorepo containing several distinct services:

-   `backend/`: A GraphQL API server built with Express, Apollo, and Prisma. This is the primary interface for managing data.
-   `frontend/`: A Next.js application that serves as the user-facing interface.
-   `aca_py_agent/`: A Python-based Aries Cloud Agent (ACA-Py) service for handling verifiable credentials.
-   `bug-bounty/`: A small Flask application for a bug bounty program.

## How to Interact with the Services

### Backend (GraphQL API)

-   **Location:** `backend/`
-   **Setup:** `cd backend && npm install`
-   **Migrations:** `cd backend && ./scripts/run-migrations.sh`
-   **Run (Dev):** `cd backend && npm run dev`

### Frontend

-   **Location:** `frontend/`
-   **Setup:** `cd frontend && npm install`
-   **Run (Dev):** `cd frontend && npm run dev`

### ACA-Py Agent

-   **Location:** `aca_py_agent/`
-   **Setup:** `pip install -r aca_py_agent/requirements.txt`

### Bug Bounty Program

-   **Location:** `bug-bounty/`
-   **Setup:** `pip install -r bug-bounty/requirements.txt`
-   **Run:** `cd bug-bounty && python app.py`