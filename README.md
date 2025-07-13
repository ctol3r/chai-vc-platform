# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Grant Privileges Demo

A minimal Express server is provided in `backend/src/server.ts`. It exposes a `/grant-privileges` endpoint that writes a stub employment-offer VC to `employment_offer_vc.json` and appends a hire event to `hire_events.log`.

The frontend page `frontend/pages/grant-privileges.tsx` contains a button that calls this endpoint. Run the server with `node backend/src/server.ts` and visit the page to trigger VC issuance.
