import React, { useState } from 'react';
async function j(url:string){ const r=await fetch(url); const t=r.headers.get('content-type')||''; return t.includes('text')? await r.text(): await r.json(); }
export default function Ops(){
  const [health,setH]=useState<any>(null); const [ready,setR]=useState<any>(null); const [metrics,setM]=useState<string>('');
  return (
    <main style={{padding:24,maxWidth:900,margin:'0 auto'}}>
      <h1>Ops</h1>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <button onClick={async()=>setH(await j('/api/healthz'))}>Health</button>
        <button onClick={async()=>setR(await j('/api/readyz'))}>Ready</button>
        <button onClick={async()=>setM(await j('/api/metrics'))}>Metrics (raw)</button>
      </div>
      <h3>Health</h3><pre>{health?JSON.stringify(health,null,2):'—'}</pre>
      <h3>Ready</h3><pre>{ready?JSON.stringify(ready,null,2):'—'}</pre>
      <h3>Metrics</h3><pre style={{whiteSpace:'pre-wrap'}}>{metrics||'—'}</pre>
    </main>
  );
}
