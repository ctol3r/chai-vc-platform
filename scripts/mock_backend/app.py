from fastapi import FastAPI, Request
import hashlib, json, os, requests, time

app = FastAPI()

ACA = os.environ.get("ACAPY_ADMIN_ENDPOINT", "http://aca-py:8021")

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/graphql")
async def graphql(req: Request):
    body = await req.json()
    # naive detection of issueCredential from GraphQL query string or body
    q = body.get("query", "") if isinstance(body, dict) else ""
    # try to extract a subjectAccount from variables/input if present
    variables = body.get("variables") if isinstance(body, dict) else {}
    subject = None
    if isinstance(variables, dict):
        inp = variables.get("input") or variables.get("issueCredential") or {}
        subject = inp.get("subjectAccount")
    # fallback: look in string
    if not subject and "subjectAccount" in q:
        # rough parse
        import re
        m = re.search(r'subjectAccount:\"([^\"]+)\"', q)
        if m:
            subject = m.group(1)
    if "issueCredential" in q or (isinstance(body, dict) and "issueCredential" in body.get("query","")):
        # compute a deterministic hash
        hash_source = subject or str(time.time())
        credential_hash = hashlib.sha256(hash_source.encode()).hexdigest()
        # request mock ACA-Py for a proof token (gracefully handle timeouts)
        proof_token = None
        try:
            r = requests.post(f"{ACA}/admin/status_proof", json={"credential_hash": credential_hash}, timeout=3)
            if r.ok:
                proof_token = r.json().get("token")
        except Exception:
            proof_token = f"MOCK-PROOF-{credential_hash[:16]}"
        resp = {
            "data": {
                "issueCredential": {
                    "id": f"demo-{credential_hash[:8]}",
                    "chainTxId": "0x" + credential_hash[:16],
                    "chainStatus": "anchored",
                    "proofToken": proof_token
                }
            }
        }
        return resp
    # default: return a trivial empty data response
    return {"data": {}}
