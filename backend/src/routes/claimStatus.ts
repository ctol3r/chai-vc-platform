import express from "express";
import { statuses } from "./claimDoc";

const router = express.Router();

/**
 * GET /api/claim/status
 * Get claim status by statusId
 */
router.get("/status", (req, res) => {
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

export default router;
