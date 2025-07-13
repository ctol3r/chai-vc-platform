import { useRouter } from 'next/router';
import { useState } from 'react';

export default function CredentialDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [message, setMessage] = useState('');

  const handleGrant = async () => {
    const res = await fetch('/api/grant-privileges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credentialId: id })
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Privileges granted and logged on-chain.');
    } else {
      setMessage(data.error || 'Error granting privileges');
    }
  };

  return (
    <div>
      <h1>Credential {id}</h1>
      <button onClick={handleGrant}>Grant Privileges/Hire</button>
      {message && <p>{message}</p>}
    </div>
  );
}
