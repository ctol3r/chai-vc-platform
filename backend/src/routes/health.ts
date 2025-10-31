import express from "express";
import Redis from "ioredis";
import prisma from "../graphql/prisma_client";
import client from "prom-client";

const router = express.Router();

/**
 * GET /api/health
 * Health check endpoint with subchecks for dependencies
 */
router.get("/", async (req, res) => {
  const checks: Record<string, { status: string; message?: string; latency?: number }> = {};
  let overallStatus = "healthy";

  // 1. Redis check
  try {
    const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379");
    const start = Date.now();
    await redis.ping();
    const latency = Date.now() - start;
    checks.redis = { status: "healthy", latency };
    redis.disconnect();
  } catch (err: any) {
    checks.redis = { status: "unhealthy", message: String(err.message) };
    overallStatus = "unhealthy";
  }

  // 2. Database check
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    checks.database = { status: "healthy", latency };
  } catch (err: any) {
    checks.database = { status: "unhealthy", message: String(err.message) };
    overallStatus = "unhealthy";
  }

  // 3. Prometheus metrics check
  try {
    const metrics = await client.register.metrics();
    const hasMetrics = metrics.length > 0;
    checks.prometheus = {
      status: hasMetrics ? "healthy" : "degraded",
      message: hasMetrics ? "Metrics available" : "No metrics registered",
    };
    if (!hasMetrics) {
      overallStatus = overallStatus === "healthy" ? "degraded" : overallStatus;
    }
  } catch (err: any) {
    checks.prometheus = { status: "unhealthy", message: String(err.message) };
    overallStatus = "degraded"; // Metrics failure is not critical
  }

  // 4. Memory check
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024),
  };
  checks.memory = {
    status: memUsageMB.heapUsed < 512 ? "healthy" : "degraded",
    message: `Heap used: ${memUsageMB.heapUsed}MB`,
  };

  // 5. Uptime
  const uptimeSeconds = Math.floor(process.uptime());
  checks.uptime = {
    status: "healthy",
    message: `${uptimeSeconds}s`,
  };

  const statusCode = overallStatus === "healthy" ? 200 : overallStatus === "degraded" ? 200 : 503;

  return res.status(statusCode).json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: uptimeSeconds,
    checks,
    memory: memUsageMB,
  });
});

export default router;
