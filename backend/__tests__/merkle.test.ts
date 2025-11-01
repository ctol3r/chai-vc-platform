import {
  hash,
  combineHashes,
  buildMerkleTree,
  generateProof,
  verifyProof,
  batchAuditEvents,
} from '../src/lib/merkle';

describe('Merkle Tree', () => {
  const sampleData = [
    { id: '1', event: 'claim.created', userId: 'user1' },
    { id: '2', event: 'claim.verified', userId: 'user2' },
    { id: '3', event: 'vc.issued', userId: 'user3' },
    { id: '4', event: 'proof.verified', userId: 'user4' },
  ];

  describe('hash', () => {
    it('should hash data consistently', () => {
      const data = 'test data';
      const hash1 = hash(data);
      const hash2 = hash(data);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 = 64 hex chars
    });

    it('should produce different hashes for different data', () => {
      const hash1 = hash('data1');
      const hash2 = hash('data2');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('combineHashes', () => {
    it('should combine two hashes', () => {
      const left = hash('left');
      const right = hash('right');
      const combined = combineHashes(left, right);

      expect(combined).toBeTruthy();
      expect(combined).toHaveLength(64);
    });

    it('should be order-dependent', () => {
      const left = hash('left');
      const right = hash('right');

      const combined1 = combineHashes(left, right);
      const combined2 = combineHashes(right, left);

      expect(combined1).not.toBe(combined2);
    });
  });

  describe('buildMerkleTree', () => {
    it('should build tree from array of data', () => {
      const result = buildMerkleTree(sampleData);

      expect(result.root).toBeTruthy();
      expect(result.leaves).toHaveLength(4);
      expect(result.tree).toBeDefined();
      expect(result.timestamp).toBeTruthy();
    });

    it('should handle single item', () => {
      const result = buildMerkleTree([sampleData[0]]);

      expect(result.root).toBeTruthy();
      expect(result.leaves).toHaveLength(1);
    });

    it('should handle odd number of items', () => {
      const oddData = sampleData.slice(0, 3);
      const result = buildMerkleTree(oddData);

      expect(result.root).toBeTruthy();
      expect(result.leaves).toHaveLength(3);
    });

    it('should throw on empty data', () => {
      expect(() => buildMerkleTree([])).toThrow('Cannot build Merkle tree from empty data');
    });
  });

  describe('generateProof and verifyProof', () => {
    it('should generate and verify valid proof', () => {
      const result = buildMerkleTree(sampleData);
      const leafHash = result.leaves[0];

      const proof = generateProof(result.tree, leafHash);

      expect(proof).toBeTruthy();
      expect(proof!.root).toBe(result.root);
      expect(proof!.leaf).toBe(leafHash);
      expect(proof!.path).toBeDefined();

      const isValid = verifyProof(proof!);
      expect(isValid).toBe(true);
    });

    it('should verify all leaves in tree', () => {
      const result = buildMerkleTree(sampleData);

      result.leaves.forEach((leafHash) => {
        const proof = generateProof(result.tree, leafHash);
        expect(proof).toBeTruthy();

        const isValid = verifyProof(proof!);
        expect(isValid).toBe(true);
      });
    });

    it('should fail verification for tampered proof', () => {
      const result = buildMerkleTree(sampleData);
      const leafHash = result.leaves[0];
      const proof = generateProof(result.tree, leafHash);

      // Tamper with root
      proof!.root = hash('tampered');

      const isValid = verifyProof(proof!);
      expect(isValid).toBe(false);
    });

    it('should return null for non-existent leaf', () => {
      const result = buildMerkleTree(sampleData);
      const fakeLeaf = hash('non-existent');

      const proof = generateProof(result.tree, fakeLeaf);
      expect(proof).toBeNull();
    });
  });

  describe('batchAuditEvents', () => {
    it('should batch events and generate proofs', () => {
      const batch = batchAuditEvents(sampleData);

      expect(batch.batchId).toBeTruthy();
      expect(batch.root).toBeTruthy();
      expect(batch.events).toHaveLength(4);
      expect(batch.proofs.size).toBe(4);
      expect(batch.anchored).toBe(false);
    });

    it('should generate verifiable proofs for all events', () => {
      const batch = batchAuditEvents(sampleData);

      sampleData.forEach((event) => {
        const proof = batch.proofs.get(event.id);
        expect(proof).toBeDefined();

        const isValid = verifyProof(proof!);
        expect(isValid).toBe(true);
      });
    });
  });

  describe('Large Batch Performance', () => {
    it('should handle 1000 events efficiently', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: `event-${i}`,
        event: 'test.event',
        userId: `user-${i}`,
        timestamp: new Date().toISOString(),
      }));

      const startTime = Date.now();
      const batch = batchAuditEvents(largeData);
      const duration = Date.now() - startTime;

      expect(batch.root).toBeTruthy();
      expect(batch.events).toHaveLength(1000);
      expect(batch.proofs.size).toBe(1000);
      expect(duration).toBeLessThan(5000); // Should complete in < 5 seconds
    });
  });
});
