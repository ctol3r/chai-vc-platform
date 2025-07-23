import { useRouter } from 'next/router';
import React from 'react';

/**
 * Displays a risk badge for a credential verification result.
 * If the score is greater than or equal to 0.75 a red flag is shown.
 */
const RiskBadge: React.FC<{ score: number }> = ({ score }) => {
  const highRisk = score >= 0.75;
  const color = highRisk ? '#ff4d4f' : '#52c41a';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 8px',
        borderRadius: '4px',
        backgroundColor: color,
        color: 'white',
        fontWeight: 700,
      }}
    >
      {highRisk && <span style={{ marginRight: 4 }}>🚩</span>}
      {(score * 100).toFixed(0)}%
    </span>
  );
};

/**
 * Credential verification page stub.
 * Expects a `score` query parameter for demonstration purposes.
 */
const CredentialPage: React.FC = () => {
  const router = useRouter();
  const { id, score } = router.query;

  const scoreNum = typeof score === 'string' ? parseFloat(score) : NaN;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Credential {id}</h1>
      {!isNaN(scoreNum) && (
        <div style={{ marginTop: '1rem' }}>
          <h2>Risk Score</h2>
          <RiskBadge score={scoreNum} />
        </div>
      )}
    </div>
  );
};

export default CredentialPage;
