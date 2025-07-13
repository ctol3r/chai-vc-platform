import { useState } from 'react';

interface Clinician {
  id: string;
  name: string;
  specialty: string;
}

export default function VerifierSearch() {
  const [specialty, setSpecialty] = useState('');
  const [results, setResults] = useState<Clinician[]>([]);

  async function search() {
    const res = await fetch('/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query($spec: String!) {\n  cliniciansBySpecialty(specialty: $spec) {\n    id\n    name\n    specialty\n  }\n}`,
        variables: { spec: specialty },
      }),
    });
    const json = await res.json();
    setResults(json.data.cliniciansBySpecialty);
  }

  return (
    <div>
      <h1>Verifier Search</h1>
      <input
        value={specialty}
        onChange={(e) => setSpecialty(e.target.value)}
        placeholder="Specialty"
      />
      <button onClick={search}>Search</button>
      <ul>
        {results.map((c) => (
          <li key={c.id}>
            {c.name} - {c.specialty}
          </li>
        ))}
      </ul>
    </div>
  );
}
