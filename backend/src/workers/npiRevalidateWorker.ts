import Queue from "bull";
import { refreshNPI } from "../services/nppesService";
import prisma from "../graphql/prisma_client";
import { auditLog } from "../controllers/audit";

const queue = new Queue("npi-revalidate", process.env.REDIS_URL || "redis://127.0.0.1:6379");

// add a job per NPI with concurrency
queue.process(5, async (job) => {
  const { npi } = job.data;
  try {
    const result = await refreshNPI(npi);
    // if changes -> append to merkle batch for anchor
    // pseudo: MerkleQueue.add({npi, hash: sha256(JSON.stringify(result)), ts: Date.now()})
    await auditLog("system", "npi.revalidate_success", { npi });
    return { ok: true, result };
  } catch (err: any) {
    await auditLog("system", "npi.revalidate_error", {
      npi,
      error: String(err.message),
    });
    throw err;
  }
});

// scheduler: every night run through NPIs older than 30d
export async function scheduleMonthlyRevalidate() {
  try {
    // Note: This assumes a Provider model exists in Prisma schema
    // If not, this will need to be adapted or the model added
    const stale = await prisma.provider.findMany({
      where: {
        last_verified_at: {
          lt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
        },
      },
      select: { npi: true },
    });

    for (const p of stale) {
      await queue.add(
        { npi: p.npi },
        {
          attempts: 3,
          backoff: { type: "exponential", delay: 1000 * 60 },
        }
      );
    }

    await auditLog("system", "npi.revalidate_scheduled", {
      count: stale.length,
    });

    return { scheduled: stale.length };
  } catch (error) {
    // If Provider model doesn't exist yet, log but don't fail
    console.warn(
      "Provider model not found in Prisma schema. Skipping revalidation scheduling.",
      error
    );
    return { scheduled: 0, error: "model_not_found" };
  }
}

// Export queue for external management
export { queue };
