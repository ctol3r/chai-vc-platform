import express from "express";
import {
  scheduleAnchorBatch,
  getAnchoredBatch,
  getAllAnchoredBatches,
} from "../workers/anchorWorker";
import { generateProof, verifyProof, AuditEvent } from "../lib/merkle";
import { auditLog } from "../controllers/audit";

const router = express.Router();

/**
 * POST /api/anchor/batch
 * Schedule a batch of events for anchoring
 */
router.post("/batch", async (req, res) => {
  try {
    const { events } = req.body;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: "events array required" });
    }

    // Validate events structure
    const validEvents: AuditEvent[] = events.map((e: any) => ({
      id: e.id || `event-${Date.now()}-${Math.random()}`,
      userId: e.userId || "system",
      event: e.event,
      timestamp: e.timestamp || new Date().toISOString(),
      data: e.data,
    }));

    const jobId = await scheduleAnchorBatch(validEvents);

    await auditLog((req as any).user?.id || "system", "anchor.batch_scheduled", {
      jobId,
      eventCount: validEvents.length,
    });

    return res.json({
      ok: true,
      jobId,
      eventCount: validEvents.length,
      message: "Batch scheduled for anchoring",
    });
  } catch (err: any) {
    return res.status(500).json({ error: String(err.message) });
  }
});

/**
 * GET /api/anchor/:batchId
 * Get anchored batch details
 */
router.get("/:batchId", (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = getAnchoredBatch(batchId);

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    return res.json({
      ok: true,
      batch: {
        batchId: batch.batchId,
        root: batch.root,
        eventCount: batch.events.length,
        timestamp: batch.timestamp,
        anchored: batch.anchored,
        txHash: batch.txHash,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: String(err.message) });
  }
});

/**
 * GET /api/anchor/proof/:batchId/:eventId
 * Get Merkle proof for a specific event
 */
router.get("/proof/:batchId/:eventId", (req, res) => {
  try {
    const { batchId, eventId } = req.params;
    const batch = getAnchoredBatch(batchId);

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    const proof = batch.proofs.get(eventId);

    if (!proof) {
      return res.status(404).json({ error: "Proof not found for event" });
    }

    return res.json({
      ok: true,
      proof,
      batchId: batch.batchId,
      txHash: batch.txHash,
    });
  } catch (err: any) {
    return res.status(500).json({ error: String(err.message) });
  }
});

/**
 * POST /api/anchor/verify
 * Verify a Merkle proof
 */
router.post("/verify", (req, res) => {
  try {
    const { proof } = req.body;

    if (!proof || !proof.root || !proof.leaf || !proof.path) {
      return res.status(400).json({ error: "Invalid proof format" });
    }

    const isValid = verifyProof(proof);

    return res.json({
      ok: true,
      valid: isValid,
      root: proof.root,
    });
  } catch (err: any) {
    return res.status(500).json({ error: String(err.message) });
  }
});

/**
 * GET /api/anchor/batches
 * List all anchored batches
 */
router.get("/batches", (req, res) => {
  try {
    const batches = getAllAnchoredBatches();

    const summary = batches.map((b) => ({
      batchId: b.batchId,
      root: b.root,
      eventCount: b.events.length,
      timestamp: b.timestamp,
      anchored: b.anchored,
      txHash: b.txHash,
    }));

    return res.json({
      ok: true,
      count: batches.length,
      batches: summary,
    });
  } catch (err: any) {
    return res.status(500).json({ error: String(err.message) });
  }
});

export default router;
