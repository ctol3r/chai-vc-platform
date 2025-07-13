import { useState } from 'react';

export default function GrantPrivileges() {
  const [message, setMessage] = useState('');

  async function handleClick() {
    const res = await fetch('http://localhost:3001/grant-privileges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: 'user123' }),
    });
    const data = await res.json();
    setMessage(`VC issued at ${data.vc.issued}`);
  }

  return (
    <div>
      <h1>Grant Privileges</h1>
      <button onClick={handleClick}>Grant Privileges</button>
      {message && <p>{message}</p>}
    </div>
  );
}
