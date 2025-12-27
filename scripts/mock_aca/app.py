from fastapi import FastAPI
from pydantic import BaseModel
import hashlib
app = FastAPI()
class ProofRequest(BaseModel):
    credential_hash: str
class VerifyRequest(BaseModel):
    token: str
@app.get("/status")
async def status():
    return {"status":"ok"}
@app.post("/admin/status_proof")
async def issue_status_proof(req: ProofRequest):
    h = hashlib.sha256(req.credential_hash.encode()).hexdigest()[:16]
    token = f"MOCK-PROOF-{h}"
    return {"token": token, "type": "mock", "credential_hash": req.credential_hash}
@app.post("/admin/verify")
async def verify_proof(req: VerifyRequest):
    if req.token.startswith("MOCK-PROOF-"):
        return {"ok": True, "reason": "mock"}
    return {"ok": False, "reason": "invalid token"}
