export async function auditLog(userId: string, action: string, payload: unknown) {
  console.info(`[AUDIT] ${new Date().toISOString()} ${userId} ${action}`, payload);

  // TODO: Persist to audit storage (database, queue, etc.)
  return true;
}

