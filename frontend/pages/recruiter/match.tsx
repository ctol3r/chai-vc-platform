import { useState } from 'react';

export default function MatchPage() {
  const [jobDescription, setJobDescription] = useState('');
  const [candidateProfile, setCandidateProfile] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [explanation, setExplanation] = useState('');

  const submit = async () => {
    const response = await fetch('/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_description: jobDescription, candidate_profile: candidateProfile }),
    });
    const data = await response.json();
    setScore(data.score);
    setExplanation(data.explanation);
  };

  return (
    <div>
      <h1>Candidate Matcher</h1>
      <textarea
        placeholder="Job description"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />
      <textarea
        placeholder="Candidate profile"
        value={candidateProfile}
        onChange={(e) => setCandidateProfile(e.target.value)}
      />
      <button onClick={submit}>Match</button>
      {score !== null && (
        <div>
          <p>Match Score: {score}</p>
          <p>Explanation: {explanation}</p>
        </div>
      )}
    </div>
  );
}
