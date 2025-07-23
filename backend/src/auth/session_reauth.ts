export const MAX_AUTH_AGE_MINUTES = 30;

export interface Session {
    lastAuthAt: Date | null;
}

/**
 * Return true if the session must be re-authenticated before executing a privileged action.
 */
export function requiresReauth(session: Session): boolean {
    if (!session.lastAuthAt) {
        return true;
    }
    const now = Date.now();
    const elapsed = now - new Date(session.lastAuthAt).getTime();
    return elapsed > MAX_AUTH_AGE_MINUTES * 60 * 1000;
}
