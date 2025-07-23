export const MAX_AUTH_AGE_MINUTES = 30;

/**
 * Determine if the user should re-authenticate before performing a privileged action.
 * @param lastAuth timestamp of the user's last authentication
 */
export function needsReauthentication(lastAuth: Date | null): boolean {
    if (!lastAuth) {
        return true;
    }
    const now = Date.now();
    const elapsed = now - new Date(lastAuth).getTime();
    return elapsed > MAX_AUTH_AGE_MINUTES * 60 * 1000;
}
