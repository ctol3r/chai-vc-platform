import { useRouter } from 'next/router';
import { useState } from 'react';
import FetchLicenseButton from '../../components/FetchLicenseButton';

interface Credential {
  id: string;
  issuer: {
    id: string;
    name: string;
    integrated: boolean;
  };
}

export default function CredentialPage() {
  const router = useRouter();
  const { id } = router.query;
  const [license, setLicense] = useState<any>(null);

  // Dummy credential data
  const credential: Credential = {
    id: (id as string) || 'unknown',
    issuer: {
      id: 'issuer1',
      name: 'Sample Issuer',
      integrated: true,
    },
  };

  return (
    <div>
      <h1>Credential {credential.id}</h1>
      <p>Issuer: {credential.issuer.name}</p>
      {credential.issuer.integrated && (
        <FetchLicenseButton issuerId={credential.issuer.id} onFetched={setLicense} />
      )}
      {license && (
        <pre data-testid="license-data">{JSON.stringify(license, null, 2)}</pre>
      )}
    </div>
  );
}
