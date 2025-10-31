import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { lookupNPI } from "../services/nppesService";
import { auditLog } from "../controllers/audit";
import { isValidNPI } from "../controllers/npiUtil";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: process.env.UPLOAD_DIR || "/tmp/uploads" });

/**
 * In-memory stores for pilot. Replace with Postgres/Prisma in prod.
 * TODO: Migrate to Prisma Claim and ClaimStatus models
 */
const claims: Record<string, any> = {};
const statuses: Record<string, any> = {};

/**
 * POST /api/npi/lookup
 * Lookup NPI information - integrated with existing NPPES service
 */
router.post("/npi/lookup", async (req, res) => {
  try {
    const { npi } = req.body;
    if (!npi) {
      return res.status(400).json({ error: "missing npi" });
    }

    // Use existing NPI validation and lookup service
    if (!isValidNPI(npi)) {
      return res.status(400).json({ error: "invalid npi format" });
    }

    // Use existing NPPES service (handles caching, DB persistence)
    const provider = await lookupNPI(npi);

    // Format response similar to original stub but with real data
    const info = {
      npi: provider.npi,
      type: provider.enumeration_type || "Type 1",
      name: provider.name || null,
      taxonomy: provider.raw?.results?.[0]?.taxonomies?.map((t: any) => t.code) || [],
      verified: !!provider.name,
      provider,
    };

    await auditLog("system", "npi.lookup.api", { npi });
    return res.json(info);
  } catch (err: any) {
    await auditLog("system", "npi.lookup.api.error", { error: String(err.message) });
    return res.status(500).json({ error: String(err.message) });
  }
});

/**
 * POST /api/claim/doc
 * Upload claim documents (multipart/form-data)
 */
router.post("/claim/doc", upload.any(), async (req, res) => {
  try {
    const npi = req.body.npi;
    if (!npi || !isValidNPI(npi)) {
      return res.status(400).json({ error: "missing or invalid npi" });
    }

    const id = uuidv4();
    const files = (req.files as Express.Multer.File[]).map((f) => ({
      path: f.path,
      original: f.originalname,
      size: f.size,
      mimetype: f.mimetype,
    }));

    claims[id] = {
      id,
      npi,
      files,
      createdAt: Date.now(),
      createdBy: (req as any).user?.id || "anonymous",
    };

    // Create initial status
    const statusId = uuidv4();
    statuses[statusId] = {
      statusId,
      claimId: id,
      level: 1,
      message: "Uploaded",
      timestamp: new Date().toISOString(),
    };

    await auditLog((req as any).user?.id || "anonymous", "claim.doc.upload", {
      claimId: id,
      npi,
      fileCount: files.length,
    });

    return res.json({ claimId: id, statusId });
  } catch (err: any) {
    return res.status(500).json({ error: String(err.message) });
  }
});

/**
 * POST /api/claim/basic
 * Kick off verification workflow
 */
router.post("/claim/basic", async (req, res) => {
  try {
    const { claimId, npi } = req.body;
    if (!claimId) {
      return res.status(400).json({ error: "missing claimId" });
    }

    const claim = claims[claimId];
    if (!claim) {
      return res.status(404).json({ error: "claim not found" });
    }

    // Move to Level 2 OCR/face-match job (enqueue in real system)
    const statusId = uuidv4();
    statuses[statusId] = {
      statusId,
      claimId,
      level: 2,
      message: "OCR & liveness queued",
      timestamp: new Date().toISOString(),
    };

    // Emulate async job: after short delay mark level 2 in this pilot
    setTimeout(() => {
      if (statuses[statusId]) {
        statuses[statusId].message =
          "OCR passed; awaiting issuer attestation (Level 3)";
        statuses[statusId].timestamp = new Date().toISOString();
        // remain level 2 pending issuer attestation
      }
    }, 3000);

    await auditLog((req as any).user?.id || "anonymous", "claim.basic.submit", {
      claimId,
      npi,
      statusId,
    });

    return res.json({ statusId });
  } catch (err: any) {
    return res.status(500).json({ error: String(err.message) });
  }
});

/**
 * GET /api/claim/status
 * Get claim status by statusId
 */
router.get("/claim/status", (req, res) => {
  try {
    const { statusId } = req.query;
    if (!statusId || typeof statusId !== "string") {
      return res.status(400).json({ error: "missing statusId" });
    }

    const s = statuses[statusId];
    if (!s) {
      return res.status(404).json({ error: "not found" });
    }

    return res.json(s);
  } catch (err: any) {
    return res.status(500).json({ error: String(err.message) });
  }
});

/**
 * POST /api/issuer/attest-request
 * ACA-Py / issuer stub for Level 3 attestation
 */
router.post("/issuer/attest-request", async (req, res) => {
  try {
    const { claimId, issuerId } = req.body;
    if (!claimId || !issuerId) {
      return res.status(400).json({ error: "missing claimId or issuerId" });
    }

    const claim = claims[claimId];
    if (!claim) {
      return res.status(404).json({ error: "claim not found" });
    }

    // In pilot, just mark claim for manual attestation and return simulated VC issuance event
    const vc = {
      id: uuidv4(),
      type: "MedicalLicenseVC",
      claimId,
      issuedBy: issuerId,
      issuedAt: new Date().toISOString(),
    };

    // Find any status for claim and bump to level 3
    const sKey = Object.keys(statuses).find(
      (k) => statuses[k].claimId === claimId
    );
    if (sKey) {
      statuses[sKey].level = 3;
      statuses[sKey].message = "Issuer attested - VC issued";
      statuses[sKey].vc = vc;
      statuses[sKey].timestamp = new Date().toISOString();
    }

    await auditLog(issuerId, "issuer.attest", {
      claimId,
      issuerId,
      vcId: vc.id,
    });

    return res.json({ vc });
  } catch (err: any) {
    return res.status(500).json({ error: String(err.message) });
  }
});

export default router;
