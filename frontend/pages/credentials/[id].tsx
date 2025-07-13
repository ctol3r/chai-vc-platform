import { useEffect, useState } from 'react';

export default function CredentialDetail() {
  const [fit, setFit] = useState<number | null>(null);

  useEffect(() => {
    async function fetchFit() {
      try {
        const res = await fetch('http://localhost:8000/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidate_skills: ['react', 'node'],
            job_skills: ['react', 'typescript', 'node']
          })
        });
        const data = await res.json();
        setFit(data.fit);
      } catch (err) {
        console.error(err);
      }
    }
    fetchFit();
  }, []);

  return (
    <div>
      <h1>Credential Detail</h1>
      {fit !== null && (
        <p>Fit: {fit}%</p>
      )}
    </div>
  );
}
