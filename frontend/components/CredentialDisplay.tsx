import React from 'react';

export interface CredentialDisplayProps {
  credentialName: string;
  holder: string;
  status: string;
}

/**
 * Renders a simple display of a healthcare credential.
 */
export const CredentialDisplay: React.FC<CredentialDisplayProps> = ({ credentialName, holder, status }) => (
  <div className="credential-display">
    <h3>{credentialName}</h3>
    <p><strong>Holder:</strong> {holder}</p>
    <p><strong>Status:</strong> {status}</p>
  </div>
);

export default CredentialDisplay;
