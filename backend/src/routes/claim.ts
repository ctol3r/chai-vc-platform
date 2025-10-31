import { Router, Request, Response } from 'express';
import multer from 'multer';
import { isValidNPI } from '../controllers/npiUtil';
import { createClaimJob, getJobStatus, startClaimProcessing, ClaimStatus } from '../lib/jobs';
import { recordClaimSubmission } from './metrics';

const router = Router();

// Configure multer for in-memory storage (for pilot)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// In-memory pilot stores
interface NPILookup {
  npi: string;
  providerName?: string;
  specialty?: string;
  validatedAt: Date;
}

interface ClaimDoc {
  claimId: string;
  filename: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
  content: Buffer;
}

interface BasicClaim {
  claimId: string;
  npi: string;
  patientName?: string;
  claimType?: string;
  amount?: number;
  createdAt: Date;
}

interface AttestationRequest {
  requestId: string;
  claimId: string;
  issuerId?: string;
  requestedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
}

const npiStore = new Map<string, NPILookup>();
const claimDocStore = new Map<string, ClaimDoc>();
const basicClaimStore = new Map<string, BasicClaim>();
const attestationStore = new Map<string, AttestationRequest>();

/**
 * POST /api/npi/lookup
 * Lookup and validate an NPI number
 */
router.post('/npi/lookup', async (req: Request, res: Response) => {
  try {
    const { npi } = req.body;
    
    if (!npi || typeof npi !== 'string') {
      return res.status(400).json({ error: 'NPI is required and must be a string' });
    }
    
    if (!isValidNPI(npi)) {
      return res.status(400).json({ 
        error: 'Invalid NPI format',
        npi,
        valid: false 
      });
    }
    
    // Check if we have cached data
    let lookup = npiStore.get(npi);
    
    if (!lookup) {
      // Create a new lookup entry (in real implementation, would call NPPES API)
      lookup = {
        npi,
        providerName: `Provider ${npi}`,
        specialty: 'General Practice',
        validatedAt: new Date(),
      };
      npiStore.set(npi, lookup);
    }
    
    res.json({
      npi,
      valid: true,
      providerName: lookup.providerName,
      specialty: lookup.specialty,
      validatedAt: lookup.validatedAt,
    });
  } catch (err) {
    console.error('Error in NPI lookup:', err);
    res.status(500).json({ error: 'Internal server error during NPI lookup' });
  }
});

/**
 * POST /api/claim/doc
 * Upload a claim document (multipart/form-data)
 */
router.post('/claim/doc', upload.single('document'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const claimId = req.body.claimId || `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const claimDoc: ClaimDoc = {
      claimId,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date(),
      content: req.file.buffer,
    };
    
    claimDocStore.set(claimId, claimDoc);
    
    // Record metrics
    const startTime = Date.now();
    
    // Create and start job processing
    createClaimJob(claimId);
    startClaimProcessing(claimId);
    
    // Record submission latency
    recordClaimSubmission(Date.now() - startTime);
    
    res.status(201).json({
      claimId,
      filename: claimDoc.filename,
      size: claimDoc.size,
      mimeType: claimDoc.mimeType,
      uploadedAt: claimDoc.uploadedAt,
      status: 'processing',
    });
  } catch (err) {
    console.error('Error uploading claim document:', err);
    res.status(500).json({ error: 'Internal server error during document upload' });
  }
});

/**
 * POST /api/claim/basic
 * Create a basic claim without document upload
 */
router.post('/claim/basic', async (req: Request, res: Response) => {
  try {
    const { npi, patientName, claimType, amount } = req.body;
    
    if (!npi || typeof npi !== 'string') {
      return res.status(400).json({ error: 'NPI is required and must be a string' });
    }
    
    if (!isValidNPI(npi)) {
      return res.status(400).json({ error: 'Invalid NPI format' });
    }
    
    const claimId = req.body.claimId || `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const basicClaim: BasicClaim = {
      claimId,
      npi,
      patientName,
      claimType,
      amount: amount ? parseFloat(amount) : undefined,
      createdAt: new Date(),
    };
    
    basicClaimStore.set(claimId, basicClaim);
    
    // Record metrics
    const startTime = Date.now();
    
    // Create and start job processing
    createClaimJob(claimId);
    startClaimProcessing(claimId);
    
    // Record submission latency
    recordClaimSubmission(Date.now() - startTime);
    
    res.status(201).json({
      claimId,
      npi,
      patientName,
      claimType,
      amount: basicClaim.amount,
      createdAt: basicClaim.createdAt,
      status: 'processing',
    });
  } catch (err) {
    console.error('Error creating basic claim:', err);
    res.status(500).json({ error: 'Internal server error during claim creation' });
  }
});

/**
 * GET /api/claim/status
 * Get the status of a claim
 */
router.get('/claim/status', async (req: Request, res: Response) => {
  try {
    const { claimId } = req.query;
    
    if (!claimId || typeof claimId !== 'string') {
      return res.status(400).json({ error: 'claimId query parameter is required' });
    }
    
    const job = getJobStatus(claimId);
    
    if (!job) {
      return res.status(404).json({ error: 'Claim not found', claimId });
    }
    
    // Check if we have associated claim data
    const claimDoc = claimDocStore.get(claimId);
    const basicClaim = basicClaimStore.get(claimId);
    
    res.json({
      claimId,
      status: job.status,
      createdAt: job.createdAt,
      ocrCompletedAt: job.ocrCompletedAt,
      attestationCompletedAt: job.attestationCompletedAt,
      hasDocument: !!claimDoc,
      claimData: basicClaim || (claimDoc ? {
        filename: claimDoc.filename,
        uploadedAt: claimDoc.uploadedAt,
      } : null),
    });
  } catch (err) {
    console.error('Error fetching claim status:', err);
    res.status(500).json({ error: 'Internal server error fetching claim status' });
  }
});

/**
 * POST /api/issuer/attest-request
 * Request attestation for a claim
 */
router.post('/issuer/attest-request', async (req: Request, res: Response) => {
  try {
    const { claimId, issuerId } = req.body;
    
    if (!claimId || typeof claimId !== 'string') {
      return res.status(400).json({ error: 'claimId is required and must be a string' });
    }
    
    // Verify claim exists
    const job = getJobStatus(claimId);
    if (!job) {
      return res.status(404).json({ error: 'Claim not found', claimId });
    }
    
    const requestId = `attest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const attestRequest: AttestationRequest = {
      requestId,
      claimId,
      issuerId: issuerId || 'default-issuer',
      requestedAt: new Date(),
      status: 'pending',
    };
    
    attestationStore.set(requestId, attestRequest);
    
    // In a real implementation, this would trigger an async attestation process
    // For now, we'll simulate immediate acceptance if claim is ready
    if (job.status === ClaimStatus.ATTESTATION_PENDING || job.status === ClaimStatus.OCR_COMPLETE) {
      attestRequest.status = 'processing';
    }
    
    res.status(201).json({
      requestId,
      claimId,
      issuerId: attestRequest.issuerId,
      status: attestRequest.status,
      requestedAt: attestRequest.requestedAt,
    });
  } catch (err) {
    console.error('Error creating attestation request:', err);
    res.status(500).json({ error: 'Internal server error during attestation request' });
  }
});

/**
 * POST /api/did/link
 * Link a DID to a claim and store DID metadata
 * (Stub implementation for pilot)
 */
interface DIDMetadata {
  did: string;
  method?: string; // e.g., 'web', 'ethr', 'key'
  document?: Record<string, any>;
  linkedAt: Date;
}

const didLinkStore = new Map<string, DIDMetadata>();

router.post('/did/link', async (req: Request, res: Response) => {
  try {
    const { claimId, did, metadata } = req.body;
    
    if (!claimId || typeof claimId !== 'string') {
      return res.status(400).json({ error: 'claimId is required and must be a string' });
    }
    
    if (!did || typeof did !== 'string') {
      return res.status(400).json({ error: 'did is required and must be a string' });
    }
    
    // Verify claim exists
    const job = getJobStatus(claimId);
    if (!job) {
      return res.status(404).json({ error: 'Claim not found', claimId });
    }
    
    // Store DID metadata
    const didMetadata: DIDMetadata = {
      did,
      method: metadata?.method || did.split(':')[1],
      document: metadata?.document || {},
      linkedAt: new Date(),
    };
    
    didLinkStore.set(claimId, didMetadata);
    
    // In production, this would also:
    // 1. Resolve the DID document
    // 2. Validate the DID format and method
    // 3. Store DID metadata in the claim record (database)
    // 4. Emit an event for DID linking
    
    res.status(201).json({
      claimId,
      did,
      method: didMetadata.method,
      linkedAt: didMetadata.linkedAt,
      message: 'DID linked successfully (stub)',
    });
  } catch (err) {
    console.error('Error linking DID:', err);
    res.status(500).json({ error: 'Internal server error during DID linking' });
  }
});

export default router;
