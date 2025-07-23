import React from 'react';

const CredentialDetails: React.FC = () => {
  const fairnessScore = 0.87; // Placeholder for actual score retrieval
  const explanation = 'Score derived from demographic parity analysis';

  return (
    <div>
      <h1>Credential Details</h1>
      <p>
        Fairness score: {' '}
        <span title={explanation}>{(fairnessScore * 100).toFixed(0)}%</span>
      </p>
    </div>
  );
};

export default CredentialDetails;
