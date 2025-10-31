import express from "express";
import { v4 as uuidv4 } from "uuid";
import { auditLog } from "../controllers/audit";
import { claims, statuses } from "./claimDoc";

const router = express.Router();

/**
 * POST /api/claim/basic
 * Kick off verification workflow
 */
router.post("/basic", async (req, res) => {
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

export default router;
