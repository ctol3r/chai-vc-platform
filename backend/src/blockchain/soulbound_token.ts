import crypto from 'crypto';

export type Attributes = Record<string, string>;

export interface ProofStep {
  sibling: string;
  isLeft: boolean;
}

function hash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

class MerkleTree {
  private leaves: string[];
  private layers: string[][];
  private indexMap: Map<string, number>;

  constructor(attributes: Attributes) {
    const entries = Object.entries(attributes);
    this.leaves = entries.map(([k, v]) => hash(`${k}:${v}`));
    this.indexMap = new Map(entries.map(([k, v], i) => [`${k}:${v}`, i]));
    this.layers = [this.leaves];

    while (this.layers[this.layers.length - 1].length > 1) {
      const prev = this.layers[this.layers.length - 1];
      const next: string[] = [];
      for (let i = 0; i < prev.length; i += 2) {
        const left = prev[i];
        const right = prev[i + 1] ?? prev[i];
        next.push(hash(left + right));
      }
      this.layers.push(next);
    }
  }

  root(): string {
    return this.layers[this.layers.length - 1][0] || '';
  }

  proof(name: string, value: string): ProofStep[] {
    const key = `${name}:${value}`;
    const startIndex = this.indexMap.get(key);
    if (startIndex === undefined) {
      throw new Error('Attribute not found');
    }
    let index = startIndex;
    const proof: ProofStep[] = [];
    for (let layer = 0; layer < this.layers.length - 1; layer++) {
      const currentLayer = this.layers[layer];
      const isRightNode = index % 2 === 1;
      const pairIndex = isRightNode ? index - 1 : index + 1;
      const sibling = currentLayer[pairIndex] ?? currentLayer[index];
      proof.push({ sibling, isLeft: isRightNode });
      index = Math.floor(index / 2);
    }
    return proof;
  }
}

export class SoulboundToken {
  private attributes: Attributes;
  private tree: MerkleTree;
  public readonly root: string;

  constructor(attributes: Attributes) {
    this.attributes = attributes;
    this.tree = new MerkleTree(attributes);
    this.root = this.tree.root();
  }

  generateDisclosure(attribute: string): { value: string; proof: ProofStep[] } {
    const value = this.attributes[attribute];
    if (value === undefined) {
      throw new Error('Unknown attribute');
    }
    const proof = this.tree.proof(attribute, value);
    return { value, proof };
  }

  static verifyDisclosure(
    root: string,
    attribute: string,
    value: string,
    proof: ProofStep[]
  ): boolean {
    let computed = hash(`${attribute}:${value}`);
    for (const step of proof) {
      if (step.isLeft) {
        computed = hash(step.sibling + computed);
      } else {
        computed = hash(computed + step.sibling);
      }
    }
    return computed === root;
  }
}

export default SoulboundToken;
