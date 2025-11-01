import Queue from "bull";
import { batchAuditEvents, AuditEvent, AnchorBatch } from "../lib/merkle";
import { auditLog } from "../controllers/audit";

/**
 * Anchor Worker
 * Batches audit events and anchors Merkle roots to blockchain
 */

const anchorQueue = new Queue(
  "anchor-batch",
  process.env.REDIS_URL || "redis://127.0.0.1:6379"
);

// In-memory storage for anchored batches (replace with DB in production)
const anchoredBatches: Map<string, AnchorBatch> = new Map();

/**
 * Process anchor batch job
 */
anchorQueue.process(async (job) => {
  const { events } = job.data;

  try {
    console.log(`Processing anchor batch with ${events.length} events...`);

    // Create Merkle batch
    const batch = batchAuditEvents(events);

    // Simulate on-chain anchoring (replace with real blockchain integration)
    const txHash = await anchorToChain(batch.root);
    batch.anchored = true;
    batch.txHash = txHash;

    // Store batch
    anchoredBatches.set(batch.batchId, batch);

    await auditLog("system", "anchor.batch_completed", {
      batchId: batch.batchId,
      root: batch.root,
      eventCount: events.length,
      txHash,
    });

    console.log(`Anchored batch ${batch.batchId} with root ${batch.root}`);

    return {
      success: true,
      batchId: batch.batchId,
      root: batch.root,
      txHash,
    };
  } catch (err: any) {
    await auditLog("system", "anchor.batch_failed", {
      error: err.message,
      eventCount: events.length,
    });

    throw err;
  }
});

/**
 * Simulate blockchain anchoring (stub)
 */
async function anchorToChain(root: string): Promise<string> {
  // In production, this would call Substrate/Ethereum contract
  // For pilot, simulate delay and return mock tx hash
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const txHash = `0x${Buffer.from(root).toString('hex').substring(0, 64)}`;
  console.log(`Anchored root ${root} to chain with tx ${txHash}`);

  return txHash;
}

/**
 * Schedule a batch for anchoring
 */
export async function scheduleAnchorBatch(events: AuditEvent[]): Promise<string> {
  const job = await anchorQueue.add(
    { events },
    {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    }
  );

  return `job-${job.id}`;
}

/**
 * Get anchored batch by ID
 */
export function getAnchoredBatch(batchId: string): AnchorBatch | undefined {
  return anchoredBatches.get(batchId);
}

/**
 * Get all anchored batches
 */
export function getAllAnchoredBatches(): AnchorBatch[] {
  return Array.from(anchoredBatches.values());
}

export { anchorQueue, anchoredBatches };
