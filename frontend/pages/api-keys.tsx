import { useEffect, useState } from 'react';

type APIKey = {
  id: string;
  scopes: string[];
  createdAt: string;
  updatedAt: string;
};

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [scopes, setScopes] = useState('');

  const fetchKeys = async () => {
    const res = await fetch('/api/keys');
    if (res.ok) {
      const data = await res.json();
      setKeys(data);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const createKey = async () => {
    const res = await fetch('/api/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scopes: scopes.split(/\s+/).filter(Boolean) })
    });
    if (res.ok) {
      setScopes('');
      await fetchKeys();
    }
  };

  const rotateKey = async (id: string) => {
    await fetch(`/api/keys/${id}/rotate`, { method: 'POST' });
    await fetchKeys();
  };

  const deleteKey = async (id: string) => {
    await fetch(`/api/keys/${id}`, { method: 'DELETE' });
    await fetchKeys();
  };

  return (
    <div>
      <h1>API Keys</h1>
      <div>
        <input
          value={scopes}
          onChange={e => setScopes(e.target.value)}
          placeholder="space separated scopes"
        />
        <button onClick={createKey}>Create</button>
      </div>
      <ul>
        {keys.map(k => (
          <li key={k.id}>
            {k.id} - {k.scopes.join(', ')}
            <button onClick={() => rotateKey(k.id)}>Rotate</button>
            <button onClick={() => deleteKey(k.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
