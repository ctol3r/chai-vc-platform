import React, { useState } from 'react';

export interface RequestFormProps {
  onSubmit: (data: { provider: string; credentialType: string }) => void;
}

/**
 * Basic form used to request a new credential verification.
 */
export const RequestForm: React.FC<RequestFormProps> = ({ onSubmit }) => {
  const [provider, setProvider] = useState('');
  const [credentialType, setCredentialType] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ provider, credentialType });
  };

  return (
    <form onSubmit={handleSubmit} className="request-form">
      <label>
        Provider
        <input
          type="text"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        />
      </label>
      <label>
        Credential Type
        <input
          type="text"
          value={credentialType}
          onChange={(e) => setCredentialType(e.target.value)}
        />
      </label>
      <button type="submit">Request Verification</button>
    </form>
  );
};

export default RequestForm;
