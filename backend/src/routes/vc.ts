import express from "express";
import { v4 as uuidv4 } from "uuid";
import {
  issueSDJWT,
  verifySDJWT,
  selectDisclosures,
  SDJWTClaim,
  SDJWTSalt,
} from "../lib/sdjwt";
import { auditLog } from "../controllers/audit";
import { getSigningKeyPair } from "../lib/ed25519";

const router = express.Router();

// In-memory storage for salts (replace with DB in production)
const saltStorage: Record<string, SDJWTSalt[]> = {};

// Ed25519 keypair (lazy-loaded)
let keyPairCache: Awaited<ReturnType<typeof getSigningKeyPair>> | null = null;

async function getKeys() {
  if (!keyPairCache) {
    keyPairCache = await getSigningKeyPair();
  }
  return keyPairCache;
}

/**
 * POST /api/vc/sd-issue
 * Issue an SD-JWT for a given VC template
 */
router.post("/sd-issue", async (req, res) => {
  try {
    const user = (req as any).user || { id: "system" };
    const { template, claims, issuer, subject } = req.body;

    if (!claims || !Array.isArray(claims)) {
      return res.status(400).json({ error: "claims array required" });
    }

    // Validate claims format
    const validClaims: SDJWTClaim[] = claims.map((c: any) => ({
      key: c.key || c.claim,
      value: c.value,
      selectable: c.selectable !== false, // Default to selectable
    }));

    // Get Ed25519 keypair
    const keys = await getKeys();

    // Issue SD-JWT with Ed25519
    const result = await issueSDJWT(
      validClaims,
      issuer || "https://vitalcv.com",
      subject || user.id,
      keys.privateKeyHex
    );

    // Store salts for this issuance
    const issuanceId = uuidv4();
    saltStorage[issuanceId] = result.salts;

    await auditLog(user.id, "vc.sd-jwt.issue", {
      issuanceId,
      template,
      claimCount: validClaims.length,
      selectableCount: validClaims.filter((c) => c.selectable).length,
    });

    return res.json({
      ok: true,
      issuanceId,
      token: result.token,
      preview: result.preview,
      disclosureCount: result.disclosures.length,
    });
  } catch (err: any) {
    return res.status(500).json({ error: String(err.message) });
  }
});

/**
 * POST /api/vc/sd-verify
 * Verify an SD-JWT and extract disclosed claims
 */
router.post("/sd-verify", async (req, res) => {
  try {
    const user = (req as any).user || { id: "anonymous" };
    const { token, requiredClaims } = req.body;

    if (!token) {
      return res.status(400).json({ error: "token required" });
    }

    // Get Ed25519 public key
    const keys = await getKeys();

    // Verify SD-JWT with Ed25519
    const result = await verifySDJWT(token, keys.publicKeyHex, requiredClaims);

    await auditLog(user.id, "vc.sd-jwt.verify", {
      valid: result.valid,
      claimCount: Object.keys(result.claims).length,
      hasErrors: !!result.errors,
    });

    if (!result.valid) {
      return res.status(400).json({
        ok: false,
        valid: false,
        errors: result.errors,
      });
    }

    return res.json({
      ok: true,
      valid: true,
      claims: result.claims,
      issuer: result.claims.iss,
      subject: result.claims.sub,
    });
  } catch (err: any) {
    return res.status(500).json({ error: String(err.message) });
  }
});

/**
 * POST /api/vc/sd-select
 * Create a selective disclosure for specific claims
 */
router.post("/sd-select", async (req, res) => {
  try {
    const user = (req as any).user || { id: "system" };
    const { token, discloseClaims } = req.body;

    if (!token || !discloseClaims || !Array.isArray(discloseClaims)) {
      return res.status(400).json({ error: "token and discloseClaims array required" });
    }

    // Select specific disclosures
    const selectedToken = selectDisclosures(token, discloseClaims);

    await auditLog(user.id, "vc.sd-jwt.select", {
      disclosedClaims: discloseClaims,
    });

    return res.json({
      ok: true,
      token: selectedToken,
      disclosed: discloseClaims,
    });
  } catch (err: any) {
    return res.status(500).json({ error: String(err.message) });
  }
});

/**
 * GET /api/vc/salts/:issuanceId
 * Retrieve salts for a specific issuance (admin only)
 */
router.get("/salts/:issuanceId", async (req, res) => {
  try {
    const { issuanceId } = req.params;
    const salts = saltStorage[issuanceId];

    if (!salts) {
      return res.status(404).json({ error: "Issuance not found" });
    }

    return res.json({
      ok: true,
      issuanceId,
      salts,
    });
  } catch (err: any) {
    return res.status(500).json({ error: String(err.message) });
  }
});

export default router;
