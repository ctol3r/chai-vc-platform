import { createHash } from 'crypto';

/**
 * Merkle Tree Implementation for Audit Event Anchoring
 */

export interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
  data?: any;
}

export interface MerkleProof {
  root: string;
  leaf: string;
  path: Array<{ hash: string; position: 'left' | 'right' }>;
}

export interface MerkleBatchResult {
  root: string;
  tree: MerkleNode;
  leaves: string[];
  timestamp: number;
}

/**
 * Hash data using SHA-256
 */
export function hash(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Combine two hashes
 */
export function combineHashes(left: string, right: string): string {
  return hash(left + right);
}

/**
 * Build Merkle tree from data array
 */
export function buildMerkleTree(data: any[]): MerkleBatchResult {
  if (data.length === 0) {
    throw new Error('Cannot build Merkle tree from empty data');
  }

  // Create leaf nodes
  const leaves = data.map((item) => hash(JSON.stringify(item)));
  let currentLevel: MerkleNode[] = leaves.map((leafHash) => ({
    hash: leafHash,
    data: data[leaves.indexOf(leafHash)],
  }));

  // Build tree bottom-up
  while (currentLevel.length > 1) {
    const nextLevel: MerkleNode[] = [];

    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = currentLevel[i + 1];

      if (right) {
        // Combine two nodes
        const parentHash = combineHashes(left.hash, right.hash);
        nextLevel.push({
          hash: parentHash,
          left,
          right,
        });
      } else {
        // Odd node - promote to next level
        nextLevel.push(left);
      }
    }

    currentLevel = nextLevel;
  }

  const root = currentLevel[0];

  return {
    root: root.hash,
    tree: root,
    leaves,
    timestamp: Date.now(),
  };
}

/**
 * Generate Merkle proof for a specific leaf
 */
export function generateProof(tree: MerkleNode, leafHash: string): MerkleProof | null {
  const path: Array<{ hash: string; position: 'left' | 'right' }> = [];

  function findPath(node: MerkleNode, target: string): boolean {
    if (node.hash === target) {
      return true;
    }

    if (!node.left && !node.right) {
      return false; // Leaf node, not a match
    }

    if (node.left && findPath(node.left, target)) {
      if (node.right) {
        path.push({ hash: node.right.hash, position: 'right' });
      }
      return true;
    }

    if (node.right && findPath(node.right, target)) {
      if (node.left) {
        path.push({ hash: node.left.hash, position: 'left' });
      }
      return true;
    }

    return false;
  }

  if (findPath(tree, leafHash)) {
    return {
      root: tree.hash,
      leaf: leafHash,
      path,
    };
  }

  return null;
}

/**
 * Verify a Merkle proof
 */
export function verifyProof(proof: MerkleProof): boolean {
  let currentHash = proof.leaf;

  for (const step of proof.path) {
    if (step.position === 'left') {
      currentHash = combineHashes(step.hash, currentHash);
    } else {
      currentHash = combineHashes(currentHash, step.hash);
    }
  }

  return currentHash === proof.root;
}

/**
 * Batch audit events and create Merkle root
 */
export interface AuditEvent {
  id: string;
  userId: string;
  event: string;
  timestamp: string;
  data?: any;
}

export interface AnchorBatch {
  batchId: string;
  root: string;
  events: AuditEvent[];
  proofs: Map<string, MerkleProof>;
  timestamp: number;
  anchored: boolean;
  txHash?: string;
}

export function batchAuditEvents(events: AuditEvent[]): AnchorBatch {
  const batchId = `batch-${Date.now()}`;

  // Build Merkle tree
  const result = buildMerkleTree(events);

  // Generate proofs for all events
  const proofs = new Map<string, MerkleProof>();
  events.forEach((event, index) => {
    const proof = generateProof(result.tree, result.leaves[index]);
    if (proof) {
      proofs.set(event.id, proof);
    }
  });

  return {
    batchId,
    root: result.root,
    events,
    proofs,
    timestamp: result.timestamp,
    anchored: false,
  };
}
