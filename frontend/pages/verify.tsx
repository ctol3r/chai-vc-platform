import React, { useState } from 'react';
export default function Verify() {
  const [id, setId] = useState(''); const [vpToken, setVp] = useState('');
  const [out, setOut] = useState<any>(null); const [loading, setLoading] = useState(false);
  async function getStatus() {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/verifier/credential/${encodeURIComponent(id)}/status`);
      setOut(await res.json());
    } finally { setLoading(false); }
  }
  async function verifyPresentation() {
    setLoading(true);
    try {
      const res = await fetch(`/api/verifier/presentation`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ credentialId: id, vpToken, nonce: 'dev-nonce', audience: 'dev' })
      });
      setOut(await res.json());
    } finally { setLoading(false); }
  }
  return (
    <main style={{padding:24,maxWidth:800,margin:'0 auto'}}>
      <h1>Verifier</h1>
      <label>Credential ID</label>
      <input value={id} onChange={e=>setId(e.target.value)} style={{width:'100%'}} />
      <label>VP Token (optional)</label>
      <textarea value={vpToken} onChange={e=>setVp(e.target.value)} rows={6} style={{width:'100%'}} />
      <div style={{display:'flex',gap:8,marginTop:8}}>
        <button onClick={getStatus} disabled={loading || !id}>Check Status</button>
        <button onClick={verifyPresentation} disabled={loading || !id}>Verify Presentation</button>
      </div>
      <h3>Result</h3>
      <pre style={{background:'#111',color:'#0f0',padding:12,overflow:'auto'}}>{out ? JSON.stringify(out,null,2) : '—'}</pre>
    </main>
  );
}
