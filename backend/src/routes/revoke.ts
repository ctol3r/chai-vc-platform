import { Router } from "express";
import { store } from "../services/credential_store";

export function revokeRouter() {
  const r = Router();
  
  r.post("/issuer/revoke", async (req, res) => {
    const { credentialId } = req.body || {};
    if (!credentialId) {
      return res.status(400).json({ ok: false, error: "missing_credentialId" });
    }
    
    console.log(`Revoking credential: ${credentialId}`);
    const success = await store.setStatus(credentialId, "revoked");
    console.log(`Revoke success: ${success}`);
    
    const newStatus = await store.getStatus(credentialId);
    console.log(`Verified new status: ${newStatus}`);
    
    if (!success) {
      return res.status(404).json({ ok: false, error: "credential_not_found" });
    }
    
    const auditRef = `audit-${Date.now()}-${credentialId.slice(0, 8)}`;
    
    res.json({ ok: true, credentialId, auditRef, status: newStatus });
  });
  
  return r;
}
