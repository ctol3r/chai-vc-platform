import { useEffect, useState } from 'react';
import { mintSampleCmeToken, WalletEvent } from '../lib/wallet';

export default function Wallet() {
  const [events, setEvents] = useState<WalletEvent[]>([]);

  useEffect(() => {
    const tokenEvent = mintSampleCmeToken();
    setEvents([tokenEvent]);
  }, []);

  return (
    <div>
      <h1>Wallet Timeline</h1>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <span
              style={{
                backgroundColor: '#d4edda',
                padding: '4px',
                borderRadius: '4px',
                marginRight: '8px',
              }}
            >
              CME Badge
            </span>
            <span>{event.label}</span> - <em>{event.timestamp}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}
