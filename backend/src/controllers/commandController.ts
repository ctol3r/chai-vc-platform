import express, { Request, Response } from "express";
import fetch from "node-fetch";

import { COMMANDS } from "packages/command-registry";
import { isValidNPI } from "./npiUtil";
import { auditLog } from "./audit";

const router = express.Router();

async function proxyPostJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let json: unknown = null;
  try {
    json = await response.json();
  } catch (error) {
    // swallow JSON parse errors so we can throw a better upstream error below
  }

  if (!response.ok) {
    throw new Error(`upstream ${url} ${response.status}`);
  }

  return json as T;
}

type ParsedCommand = {
  id: string;
  params: Record<string, unknown>;
};

function parseNLtoCommand(text: string | null | undefined): ParsedCommand | null {
  const trimmed = (text || "").trim();
  if (!trimmed) return null;

  const npiMatch = trimmed.match(/(\b[12]\d{9}\b)/);
  if (/\bvalidate npi\b/i.test(trimmed) || npiMatch) {
    return { id: "npi.validate", params: { npi: npiMatch ? npiMatch[1] : "" } };
  }

  if (/(\b(start|new) claim\b)/i.test(trimmed)) {
    return { id: "claim.new", params: {} };
  }

  if (/\bexplain\b/i.test(trimmed)) {
    const parts = trimmed.split(/\s+/);
    return {
      id: "ai.explain",
      params: { subjectType: parts[1] ?? "claim", subjectId: parts[2] ?? "" },
    };
  }

  const found = COMMANDS.find(
    (command) =>
      trimmed.toLowerCase().includes(command.id.split(".")[0].toLowerCase()) ||
      command.title.toLowerCase().includes(trimmed.toLowerCase())
  );

  return found ? { id: found.id, params: {} } : null;
}

async function handleExecuteCommand(
  user: { id: string; roles: string[] },
  id: string,
  params: Record<string, unknown>
) {
  const command = COMMANDS.find((candidate) => candidate.id === id);
  if (!command) throw new Error("unknown_command");

  if (
    command.rolesAllowed &&
    command.rolesAllowed.length > 0 &&
    !command.rolesAllowed.some((role) => user.roles.includes(role))
  ) {
    throw new Error("forbidden");
  }

  if (command.paramsSchema) {
    const parsed = command.paramsSchema.safeParse(params || {});
    if (!parsed.success) {
      throw new Error("invalid_params:" + JSON.stringify(parsed.error.format()));
    }
    params = parsed.data as Record<string, unknown>;
  }

  if (id === "npi.validate") {
    const { npi } = params as { npi: string };
    if (!isValidNPI(npi)) {
      throw new Error("invalid_npi_format");
    }

    const nppesUrl =
      process.env.NPPES_PROXY_URL || `${process.env.BACKEND_BASE_URL}/internal/nppes/lookup`;
    const provider = await proxyPostJson<Record<string, unknown>>(nppesUrl, { npi });

    await auditLog(user.id, "npi.validate", { npi, result: !!provider });
    return { provider };
  }

  if (id === "claim.new") {
    const claim = { id: `temp-${Date.now()}`, status: "started", createdBy: user.id };
    await auditLog(user.id, "claim.new", { claimId: claim.id });
    return { claim };
  }

  if (id === "ai.explain") {
    const { subjectType, subjectId } = params as { subjectType: string; subjectId: string };
    await auditLog(user.id, "ai.explain", { subjectType, subjectId });
    return { summary: `AI explain stub for ${subjectType}/${subjectId}` };
  }

  await auditLog(user.id, "command.exec", { id, params });
  return { ok: true, message: `executed ${id}` };
}

router.post("/parse", async (req: Request, res: Response) => {
  try {
    const { text } = req.body ?? {};
    if (!text) {
      return res.status(400).json({ error: "missing_text" });
    }

    const parsed = parseNLtoCommand(text);
    if (!parsed) {
      return res.json({ ok: false, message: "no_match" });
    }

    return res.json({ ok: true, command: parsed });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown_error";
    return res.status(500).json({ error: message });
  }
});

router.post("/execute", async (req: Request, res: Response) => {
  try {
    const requestWithUser = req as Request & { user?: { id: string; roles: string[] } };
    const user =
      requestWithUser.user ||
      ({ id: "system-test", roles: ["clinician"] } as { id: string; roles: string[] });

    const { id, rawQuery, params } = req.body ?? {};

    let commandId: string | undefined = id;
    let paramObj: Record<string, unknown> | undefined = params;

    if (!commandId && rawQuery) {
      const parsed = parseNLtoCommand(rawQuery);
      if (!parsed) {
        return res.status(400).json({ error: "cannot_parse" });
      }
      commandId = parsed.id;
      paramObj = parsed.params;
    }

    if (!commandId) {
      return res.status(400).json({ error: "missing_command_id" });
    }

    const result = await handleExecuteCommand(user, commandId, paramObj || {});
    return res.json({ ok: true, result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown_error";
    return res.status(400).json({ ok: false, error: message });
  }
});

export default router;

