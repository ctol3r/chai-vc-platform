export interface DIDDocument {
  id: string;
  publicKey: string;
  revokedKeys: string[];
}

export class DIDRegistry {
  private registry: Map<string, DIDDocument> = new Map();

  register(doc: DIDDocument): void {
    this.registry.set(doc.id, { ...doc, revokedKeys: doc.revokedKeys || [] });
  }

  get(id: string): DIDDocument | undefined {
    return this.registry.get(id);
  }

  rotateKeys(id: string, newPublicKey: string): DIDDocument {
    const doc = this.registry.get(id);
    if (!doc) {
      throw new Error(`DID ${id} not found`);
    }
    doc.revokedKeys.push(doc.publicKey);
    doc.publicKey = newPublicKey;
    return doc;
  }
}
