import React from 'react';
import type { NextPage } from 'next';
import { WalletProofService } from '../../backend/src/crypto/wallet_proof_service';

const CredentialPage: NextPage = () => {
  const service = new WalletProofService();

  const handleGenerateProof = async () => {
    const result = await service.generateProof({
      did: 'did:example:123',
      proofRequest: { selective: ['name', 'license'] },
    });
    alert(`Generated proof: ${result.proof}`);
  };

  return (
    <div>
      <h1>Credential</h1>
      <button onClick={handleGenerateProof}>Generate BBS+ Proof</button>
    </div>
  );
};

export default CredentialPage;
