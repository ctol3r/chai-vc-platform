import { useState } from 'react';

interface NpiResult {
  basic?: {
    first_name?: string;
    last_name?: string;
  };
}

export default function Wallet() {
  const [npi, setNpi] = useState('');
  const [providerName, setProviderName] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [step, setStep] = useState(1);
  const [did, setDid] = useState('');

  const lookupNpi = async () => {
    setLookupError('');
    try {
      const res = await fetch(`https://npiregistry.cms.hhs.gov/api/?number=${npi}&version=2.1`);
      if (!res.ok) throw new Error('NPI lookup failed');
      const data = await res.json();
      const result: NpiResult | undefined = data?.results?.[0];
      if (result?.basic) {
        setProviderName(`${result.basic.first_name ?? ''} ${result.basic.last_name ?? ''}`.trim());
      } else {
        setProviderName('');
        setLookupError('No provider found');
      }
    } catch (err: any) {
      setProviderName('');
      setLookupError(err.message || 'Lookup error');
    }
  };

  const createDid = () => {
    const random = Math.random().toString(36).substring(2, 8);
    setDid(`did:example:${random}`);
    setStep(3);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Wallet</h1>
      {step === 1 && (
        <div>
          <h2>NPI Lookup</h2>
          <input
            type="text"
            value={npi}
            onChange={(e) => setNpi(e.target.value)}
            placeholder="Enter NPI"
          />
          <button onClick={lookupNpi}>Lookup</button>
          {providerName && (
            <p>Provider: {providerName}</p>
          )}
          {lookupError && <p style={{ color: 'red' }}>{lookupError}</p>}
          {providerName && (
            <button onClick={() => setStep(2)}>Continue to DID setup</button>
          )}
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Create DID</h2>
          <p>Click below to generate a Decentralized Identifier for this wallet.</p>
          <button onClick={createDid}>Create DID</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2>DID Created</h2>
          <p>Your new DID:</p>
          <pre>{did}</pre>
        </div>
      )}
    </div>
  );
}
