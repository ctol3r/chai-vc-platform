import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface CandidateData {
  id: string | string[];
  name: string;
  explanation: string;
}

export default function CredentialDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [candidate, setCandidate] = useState<CandidateData | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/candidate/${id}`)
      .then((res) => res.json())
      .then((data) => setCandidate(data));
  }, [id]);

  if (!candidate) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>{candidate.name}</h1>
      <h2>Why this candidate?</h2>
      <p>{candidate.explanation}</p>
    </div>
  );
}
