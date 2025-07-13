import { useState } from 'react';
import type { NextPage } from 'next';

const CredentialPage: NextPage = () => {
  const [revoked, setRevoked] = useState(false);
  const credentialId = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : '';

  const handleRevoke = async () => {
    if (!credentialId) return;
    try {
      await fetch(`/api/credentials/${credentialId}/revoke`, { method: 'POST' });
      setRevoked(true);
    } catch (e) {
      console.error('Failed to revoke credential', e);
    }
  };

  return (
    <div>
      <h1>Credential Details</h1>
      {revoked ? (
        <p>This credential has been revoked.</p>
      ) : (
        <button onClick={handleRevoke}>Revoke Credential</button>
      )}
    </div>
  );
};

export default CredentialPage;
