import { useRouter } from 'next/router';
import React from 'react';
import FairnessAuditIndicator from '../../components/FairnessAuditIndicator';

const CredentialPage: React.FC = () => {
  const router = useRouter();
  const { id, biasMitigation } = router.query;

  const biasMitigationApplied = biasMitigation === '1' || biasMitigation === 'true';

  return (
    <div>
      <h1>Credential {id}</h1>
      <FairnessAuditIndicator biasMitigationApplied={biasMitigationApplied} />
      {/* Additional credential details would be rendered here */}
    </div>
  );
};

export default CredentialPage;
