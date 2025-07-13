import { ApiPromise, WsProvider } from '@polkadot/api';

export type StatusChangeCallback = (data: unknown) => void;

/**
 * Subscribe to on-chain status change events.
 * Returns an unsubscribe function that will also disconnect the API.
 */
export async function subscribeToStatusChanges(
  callback: StatusChangeCallback
): Promise<() => Promise<void>> {
  const provider = new WsProvider('ws://localhost:9944');
  const api = await ApiPromise.create({ provider });

  const unsubscribe = await api.query.system.events((records) => {
    records.forEach(({ event }) => {
      const method = event.method.toLowerCase();
      if (method.includes('status') && method.includes('change')) {
        callback(event.data.toJSON());
      }
    });
  });

  return async () => {
    unsubscribe();
    await api.disconnect();
  };
}
