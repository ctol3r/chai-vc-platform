from fastapi import APIRouter, HTTPException, Request
import os
import requests

router = APIRouter()

OPA_URL = os.getenv("OPA_URL", "http://localhost:8181/v1/data/chai/authz/allow")
BACKEND_URL = os.getenv("BACKEND_URL", "https://backend-service")
CLIENT_CERT = os.getenv("CLIENT_CERT", "/certs/client.crt")
CLIENT_KEY = os.getenv("CLIENT_KEY", "/certs/client.key")
CA_CERT = os.getenv("CA_CERT", "/certs/ca.crt")

@router.post("/match")
async def match(request: Request):
    # Call OPA to authorize this request
    data = {
        "input": {
            "path": request.url.path,
            "method": request.method,
        }
    }
    try:
        resp = requests.post(OPA_URL, json=data, timeout=2)
        allowed = resp.json().get("result", False)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"OPA error: {exc}")

    if not allowed:
        raise HTTPException(status_code=403, detail="OPA policy denied the request")

    # Example backend call secured with mTLS
    try:
        r = requests.get(
            f"{BACKEND_URL}/health",
            cert=(CLIENT_CERT, CLIENT_KEY),
            verify=CA_CERT,
            timeout=2,
        )
        backend_status = r.json()
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Backend call failed: {exc}")

    return {"status": "ok", "backend": backend_status}
