import React, { useState } from 'react';
export default function Issuer() {
  const [subjectId, setSubjectId] = useState(''); const [type, setType] = useState('License');
  const [out, setOut] = useState<any>(null); const [loading, setLoading] = useState(false);
  async function issue() {
    setLoading(true);
    try {
      const res = await fetch(`/api/issuer/credential`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ subjectId, type })
      });
      setOut(await res.json());
    } finally { setLoading(false); }
  }
  return (
    <main style={{padding:24,maxWidth:800,margin:'0 auto'}}>
      <h1>Issuer</h1>
      <label>Subject ID</label>
      <input value={subjectId} onChange={e=>setSubjectId(e.target.value)} style={{width:'100%'}} />
      <label>Type</label>
      <input value={type} onChange={e=>setType(e.target.value)} style={{width:'100%'}} />
      <div style={{marginTop:8}}>
        <button onClick={issue} disabled={loading || !subjectId}>Issue Credential</button>
      </div>
      <h3>Response</h3>
      <pre style={{background:'#111',color:'#0f0',padding:12,overflow:'auto'}}>{out ? JSON.stringify(out,null,2) : '—'}</pre>
    </main>
  );
}
