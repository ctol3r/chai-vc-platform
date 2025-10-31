import express from "express";
import { v4 as uuidv4 } from "uuid";
import { auditLog } from "../controllers/audit";
import { claims, statuses } from "./claimDoc";
import { ttpSeconds, psvAccuracyRatio } from "../instrumentation/metrics";

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

    const startTime = Date.now();

    // Move to Level 2 OCR/face-match job (enqueue in real system)
    const statusId = uuidv4();
    statuses[statusId] = {
      statusId,
      claimId,
      level: 2,
      message: "OCR & liveness queued",
      timestamp: new Date().toISOString(),
      startTime, // Track for TTP calculation
    };

    // Emulate async job: after short delay mark level 2 in this pilot
    setTimeout(() => {
      if (statuses[statusId]) {
        statuses[statusId].message =
          "OCR passed; awaiting issuer attestation (Level 3)";
        statuses[statusId].timestamp = new Date().toISOString();
        
        // Simulate PSV check success (95% accuracy in pilot)
        const psvSuccess = Math.random() < 0.95;
        psvAccuracyRatio.set(psvSuccess ? 0.95 : 0.85);
        
        // If we reach privilege decision (Level 3), track TTP
        if (psvSuccess) {
          statuses[statusId].level = 3;
          statuses[statusId].message = "Privilege decision - approved";
          
          // Calculate time to privilege (in seconds)
          const ttpDuration = (Date.now() - startTime) / 1000;
          ttpSeconds.observe({ status: "success" }, ttpDuration);
        }
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
