import React from 'react';

interface FairnessAuditIndicatorProps {
  biasMitigationApplied: boolean;
}

const FairnessAuditIndicator: React.FC<FairnessAuditIndicatorProps> = ({ biasMitigationApplied }) => {
  if (!biasMitigationApplied) {
    return null;
  }
  return (
    <div style={{ padding: '10px', backgroundColor: '#e0ffe0', border: '1px solid #008000' }}>
      Fairness audit: Bias mitigation applied
    </div>
  );
};

export default FairnessAuditIndicator;
