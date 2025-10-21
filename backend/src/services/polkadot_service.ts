export async function tryAnchor(hash: string): Promise<void> {
  try {
    // Pilot: fire-and-forget logging only, never throw
    // Avoid logging sensitive data; include only short prefix
    const prefix = hash ? hash.slice(0, 12) : 'nohash';
    // eslint-disable-next-line no-console
    console.debug('anchor_attempt_nonblocking', { hashPrefix: prefix });
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.warn('anchor_failed_nonblocking', { message: String(e?.message || e) });
  }
}
