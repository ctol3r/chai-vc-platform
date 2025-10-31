import express from "express";
import { v4 as uuidv4 } from "uuid";
import { getACAPayClient, ACAPayStub } from "../lib/acapy";
import { auditLog } from "../controllers/audit";
import Queue from "bull";

const router = express.Router();

// Use stub in development, real client in production
const USE_STUB = process.env.ACAPY_STUB === 'true' || !process.env.ACAPY_URL;
const acapyClient = USE_STUB ? new ACAPayStub() : getACAPayClient();

// Bull queue for credential issuance jobs
const credentialQueue = new Queue(
  'credential-issuance',
  process.env.REDIS_URL || 'redis://127.0.0.1:6379'
);

// In-memory storage for issuance requests (replace with DB in production)
const issuanceRequests: Record<string, any> = {};

/**
 * Process credential issuance jobs
 */
credentialQueue.process(async (job) => {
  const { requestId, connectionId, credDefId, attributes, issuerId } = job.data;

  try {
    // Issue credential via ACA-Py
    const result = await acapyClient.issueCredential({
      connectionId,
      credDefId,
      attributes,
      comment: `VitalCV Credential - Request ${requestId}`,
    });

    // Update request status
    if (issuanceRequests[requestId]) {
      issuanceRequests[requestId].status = 'issued';
      issuanceRequests[requestId].credentialExchangeId = result.credentialExchangeId;
      issuanceRequests[requestId].state = result.state;
    }

    await auditLog(issuerId, 'credential.issued', {
      requestId,
      credentialExchangeId: result.credentialExchangeId,
      credDefId,
    });

    return {
      success: true,
      credentialExchangeId: result.credentialExchangeId,
    };
  } catch (err: any) {
    if (issuanceRequests[requestId]) {
      issuanceRequests[requestId].status = 'failed';
      issuanceRequests[requestId].error = err.message;
    }

    await auditLog(issuerId, 'credential.issuance_failed', {
      requestId,
      error: err.message,
    });

    throw err;
  }
});

/**
 * POST /api/issuer/attest-request
 * Request credential attestation/issuance
 */
router.post("/attest-request", async (req, res) => {
  try {
    const user = (req as any).user || { id: "system" };
    const {
      claimId,
      issuerId,
      connectionId,
      credDefId,
      template,
      attributes,
    } = req.body;

    if (!claimId && !attributes) {
      return res.status(400).json({ error: "claimId or attributes required" });
    }

    const requestId = uuidv4();

    // Create issuance request
    issuanceRequests[requestId] = {
      requestId,
      claimId,
      issuerId: issuerId || user.id,
      template,
      status: 'pending',
      createdAt: new Date().toISOString(),
      createdBy: user.id,
    };

    // Queue credential issuance job
    await credentialQueue.add(
      {
        requestId,
        connectionId: connectionId || 'default-connection',
        credDefId: credDefId || 'default-cred-def',
        attributes: attributes || [
          { name: 'claim_id', value: claimId },
          { name: 'template', value: template || 'default' },
        ],
        issuerId: issuerId || user.id,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      }
    );

    await auditLog(user.id, 'credential.attest_requested', {
      requestId,
      claimId,
      issuerId: issuerId || user.id,
      template,
    });

    return res.json({
      ok: true,
      requestId,
      status: 'pending',
      message: 'Credential issuance queued',
    });
  } catch (err: any) {
    return res.status(500).json({ error: String(err.message) });
  }
});

/**
 * GET /api/issuer/attest-status/:requestId
 * Get attestation request status
 */
router.get("/attest-status/:requestId", (req, res) => {
  try {
    const { requestId } = req.params;
    const request = issuanceRequests[requestId];

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    return res.json({
      ok: true,
      request,
    });
  } catch (err: any) {
    return res.status(500).json({ error: String(err.message) });
  }
});

/**
 * POST /api/issuer/webhook/credential
 * Webhook endpoint for ACA-Py credential events
 */
router.post("/webhook/credential", async (req, res) => {
  try {
    const event = req.body;
    const { state, cred_ex_id: credExId } = event;

    // Find corresponding request
    const request = Object.values(issuanceRequests).find(
      (r: any) => r.credentialExchangeId === credExId
    );

    if (request) {
      request.state = state;
      request.lastWebhookAt = new Date().toISOString();

      if (state === 'done' || state === 'credential-acked') {
        request.status = 'completed';
      } else if (state === 'abandoned' || state === 'declined') {
        request.status = 'failed';
      }

      await auditLog('system', 'credential.webhook_received', {
        requestId: request.requestId,
        state,
        credExId,
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: String(err.message) });
  }
});

/**
 * GET /api/issuer/status
 * Get ACA-Py agent status
 */
router.get("/status", async (req, res) => {
  try {
    const status = await acapyClient.getStatus();
    return res.json({
      ok: true,
      acapy: status,
      stub: USE_STUB,
    });
  } catch (err: any) {
    return res.status(500).json({ error: String(err.message) });
  }
});

/**
 * GET /api/issuer/credential-definitions
 * List available credential definitions
 */
router.get("/credential-definitions", async (req, res) => {
  try {
    const credDefs = await acapyClient.listCredentialDefinitions();
    return res.json({
      ok: true,
      credentialDefinitions: credDefs,
    });
  } catch (err: any) {
    return res.status(500).json({ error: String(err.message) });
  }
});

/**
 * POST /api/issuer/connection/create
 * Create a connection invitation
 */
router.post("/connection/create", async (req, res) => {
  try {
    const { alias } = req.body;
    const invitation = await acapyClient.createInvitation(alias);

    await auditLog((req as any).user?.id || 'system', 'connection.created', {
      connectionId: invitation.connection_id,
      alias,
    });

    return res.json({
      ok: true,
      invitation,
    });
  } catch (err: any) {
    return res.status(500).json({ error: String(err.message) });
  }
});

// Export queue for worker management
export { credentialQueue };
export default router;
