import { useRouter } from 'next/router';
import { useState } from 'react';

interface Proof {
  title: string;
  details: string;
}

interface Credential {
  id: string;
  name: string;
  issuer: string;
  issued: string;
  proofs: Proof[];
}

const sampleCredentials: Record<string, Credential> = {
  '1': {
    id: '1',
    name: 'Board Certification in Surgery',
    issuer: 'Medical Board',
    issued: '2022-01-01',
    proofs: [
      {
        title: 'Medical School Transcript',
        details: 'Verified transcript from university showing completion of medical degree.'
      },
      {
        title: 'Residency Completion',
        details: 'Document verifying completion of accredited residency program.'
      }
    ]
  },
  '2': {
    id: '2',
    name: 'Nursing License',
    issuer: 'State Board of Nursing',
    issued: '2021-06-12',
    proofs: [
      {
        title: 'License Document',
        details: 'Official state issued license document.'
      },
      {
        title: 'Background Check',
        details: 'Proof of completed background check with no findings.'
      }
    ]
  }
};

export default function CredentialProfile() {
  const router = useRouter();
  const { id } = router.query;
  const credential = sampleCredentials[id as string];
  const [openProof, setOpenProof] = useState<string | null>(null);

  if (!credential) {
    return <div>Credential not found.</div>;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h1>{credential.name}</h1>
      <p><strong>Issuer:</strong> {credential.issuer}</p>
      <p><strong>Issued:</strong> {credential.issued}</p>

      <h2>Proofs</h2>
      <ul>
        {credential.proofs.map((proof) => (
          <li key={proof.title} style={{ marginBottom: '0.5rem' }}>
            <button onClick={() => setOpenProof(openProof === proof.title ? null : proof.title)}>
              {proof.title}
            </button>
            {openProof === proof.title && (
              <div style={{ marginTop: '0.25rem', paddingLeft: '1rem' }} className="proof-details">
                <p>{proof.details}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
