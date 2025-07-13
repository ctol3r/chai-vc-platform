import { useEffect, useState } from 'react';
import { generateDIDDocument, DIDDocument } from '../../lib/didUtils';

export default function CredentialPage() {
  const [didDoc, setDidDoc] = useState<DIDDocument | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateDIDDocument()
      .then(doc => setDidDoc(doc))
      .catch(e => setError(String(e)));
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!didDoc) return <div>Generating DID&hellip;</div>;
  return (
    <div>
      <h1>DID Document</h1>
      <pre>{JSON.stringify(didDoc, null, 2)}</pre>
    </div>
  );
}
