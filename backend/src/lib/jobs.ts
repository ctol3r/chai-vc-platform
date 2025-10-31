/**
 * Lightweight job simulator for claim processing
 * Simulates OCR and attestation delays for demo purposes
 */

export enum ClaimStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  OCR_COMPLETE = 'ocr_complete',
  ATTESTATION_PENDING = 'attestation_pending',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

export interface ClaimJob {
  claimId: string;
  status: ClaimStatus;
  createdAt: Date;
  ocrCompletedAt?: Date;
  attestationCompletedAt?: Date;
}

// In-memory store for jobs (will be replaced with actual job queue)
const jobStore = new Map<string, ClaimJob>();

/**
 * Create a new claim job
 */
export function createClaimJob(claimId: string): ClaimJob {
  const job: ClaimJob = {
    claimId,
    status: ClaimStatus.PENDING,
    createdAt: new Date(),
  };
  jobStore.set(claimId, job);
  return job;
}

/**
 * Get job status
 */
export function getJobStatus(claimId: string): ClaimJob | null {
  return jobStore.get(claimId) || null;
}

/**
 * Simulate OCR processing delay (2-5 seconds)
 */
async function simulateOCR(claimId: string): Promise<void> {
  const delay = Math.random() * 3000 + 2000; // 2-5 seconds
  await new Promise((resolve) => setTimeout(resolve, delay));
  
  const job = jobStore.get(claimId);
  if (job) {
    job.status = ClaimStatus.OCR_COMPLETE;
    job.ocrCompletedAt = new Date();
    jobStore.set(claimId, job);
    
    // Transition to attestation pending after OCR
    setTimeout(() => {
      const updatedJob = jobStore.get(claimId);
      if (updatedJob) {
        updatedJob.status = ClaimStatus.ATTESTATION_PENDING;
        jobStore.set(claimId, updatedJob);
      }
    }, 500);
  }
}

/**
 * Simulate attestation processing delay (3-7 seconds)
 */
async function simulateAttestation(claimId: string): Promise<void> {
  const delay = Math.random() * 4000 + 3000; // 3-7 seconds
  await new Promise((resolve) => setTimeout(resolve, delay));
  
  const job = jobStore.get(claimId);
  if (job) {
    job.status = ClaimStatus.COMPLETED;
    job.attestationCompletedAt = new Date();
    jobStore.set(claimId, job);
  }
}

/**
 * Start processing a claim job asynchronously
 */
export function startClaimProcessing(claimId: string): void {
  const job = jobStore.get(claimId);
  if (!job) {
    throw new Error(`Claim job ${claimId} not found`);
  }
  
  // Update status to processing
  job.status = ClaimStatus.PROCESSING;
  jobStore.set(claimId, job);
  
  // Start OCR simulation
  simulateOCR(claimId).then(() => {
    // After OCR, start attestation simulation
    simulateAttestation(claimId);
  }).catch((err) => {
    console.error(`Error processing claim ${claimId}:`, err);
    const failedJob = jobStore.get(claimId);
    if (failedJob) {
      failedJob.status = ClaimStatus.REJECTED;
      jobStore.set(claimId, failedJob);
    }
  });
}

/**
 * Mark claim as rejected (for testing/error scenarios)
 */
export function rejectClaim(claimId: string): void {
  const job = jobStore.get(claimId);
  if (job) {
    job.status = ClaimStatus.REJECTED;
    jobStore.set(claimId, job);
  }
}
