import express from "express";
import { auditLog } from "./audit";

// placeholder LLM call (internal model adapter)
async function callLLM(prompt: string) {
  return { text: `LLM stub response to: ${prompt}` };
}

// naive PHI redaction — replace patient names, MRNs, dates, SSNs in text bodies.
// In production: use a robust NLP model or regex suite and human review.
function redactPHI(obj: any): any {
  const s = JSON.stringify(obj);
  const redacted = s
    .replace(/\b(\d{3}-\d{2}-\d{4}|\d{9})\b/g, "[REDACTED_SSN]")
    .replace(
      /\b([A-Z][a-z]{2,}\s[A-Z][a-z]{2,})\b/g,
      "[REDACTED_NAME]"
    )
    .replace(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, "[REDACTED_DATE]")
    .replace(/\bMRN[:\s]?\d+\b/gi, "[REDACTED_MRN]");
  try {
    return JSON.parse(redacted);
  } catch {
    return { redacted_text: redacted };
  }
}

const router = express.Router();

router.post("/explain", async (req, res) => {
  try {
    const user = (req as any).user || { id: "system", roles: ["clinician"] };
    const { subjectType, subjectId, allow_phi } = req.body;

    // fetch object from DB
    // const thing = await DB.get(subjectType, subjectId);
    let thing = { id: subjectId, note: "stub content" }; // stub

    const payload =
      allow_phi && user.roles.includes("admin")
        ? thing
        : redactPHI(thing);

    await auditLog(user.id, "ai.explain.request", {
      subjectType,
      subjectId,
      allow_phi: !!allow_phi,
    });

    const llm = await callLLM(`Explain this: ${JSON.stringify(payload)}`);

    await auditLog(user.id, "ai.explain.result", { summary: llm.text });
    return res.json({ ok: true, result: llm.text });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: String(err.message) });
  }
});

router.post("/improve", async (req, res) => {
  try {
    const user = (req as any).user || { id: "system" };
    let { text } = req.body;
    const sanitized = redactPHI({ text });
    await auditLog(user.id, "ai.improve.request", {});
    const llm = await callLLM(
      `Improve writing: ${JSON.stringify(sanitized)}`
    );
    await auditLog(user.id, "ai.improve.result", {});
    return res.json({ ok: true, improved: llm.text });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: String(err.message) });
  }
});

router.post("/autotag", async (req, res) => {
  try {
    const user = (req as any).user || { id: "system" };
    const { claimIds } = req.body;
    // stub: produce tags for each id
    const tags = claimIds.map((id: any) => ({ id, tags: ["low-risk"] }));
    await auditLog(user.id, "ai.autotag", { count: claimIds?.length || 0 });
    return res.json({ ok: true, tags });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: String(err.message) });
  }
});

export default router;
