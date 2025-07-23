import { useEffect, useState } from 'react';
import { proposeAllocations } from '../../lib/grants';

const projects = [
  'Local Park Upgrades',
  'Open Source Software',
  'Community Events',
];

export default function GrantsPage() {
  const [allocations, setAllocations] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    const result = proposeAllocations(projects, 100000);
    setAllocations(result);
  }, []);

  return (
    <div>
      <h1>Community Grant Allocations</h1>
      {allocations ? (
        <ul>
          {Object.entries(allocations).map(([name, amount]) => (
            <li key={name}>
              {name}: ${amount.toLocaleString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>Generating proposal...</p>
      )}
    </div>
  );
}
