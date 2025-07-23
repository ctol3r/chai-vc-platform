# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Community Grants

This repository now includes a simple prototype for AI-curated community grants.
The backend exposes a `propose_allocations` helper that can use GPT-4 to
recommend how to divide funding among a list of projects. If no `OPENAI_API_KEY`
is provided, it falls back to an even split.

The frontend under `frontend/pages/grants` renders a sample allocation proposal
using this logic.
