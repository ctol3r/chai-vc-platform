import { useEffect, useState } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';

const StatusChangeDashboard = () => {
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const run = async () => {
      const provider = new WsProvider('ws://localhost:9944');
      const api = await ApiPromise.create({ provider });

      unsubscribe = await api.query.system.events((records) => {
        records.forEach(({ event }) => {
          const method = event.method.toLowerCase();
          if (method.includes('status') && method.includes('change')) {
            setEvents((prev) => [...prev, event.method]);
          }
        });
      });
    };

    run();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <div>
      <h1>Status Change Events</h1>
      <ul>
        {events.map((e, i) => (
          <li key={i}>{e}</li>
        ))}
      </ul>
    </div>
  );
};

export default StatusChangeDashboard;
