import React, { useState } from 'react';

interface Candidate {
  id: number;
  name: string;
  status: string;
  summary: string;
}

const mockCandidates: Candidate[] = [
  { id: 1, name: 'Alice Smith', status: 'pending', summary: 'RN license verification' },
  { id: 2, name: 'Bob Johnson', status: 'approved', summary: 'Employment history check' },
  { id: 3, name: 'Charlie Davis', status: 'pending', summary: 'Background screening' },
];

const Dashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = mockCandidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Verifier Dashboard</h1>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search candidates"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ marginRight: '0.5rem' }}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
        </select>
      </div>
      <ul>
        {filtered.map(c => (
          <li key={c.id} style={{ border: '1px solid #ccc', padding: '0.5rem', marginBottom: '0.5rem' }}>
            <strong>{c.name}</strong> - {c.status}
            <p>{c.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
