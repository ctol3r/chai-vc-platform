export interface Candidate {
  id: string;
  name: string;
  credentials: string[];
  location: string;
}

export interface Watcher {
  id: string;
  credential: string;
  location: string;
  notify: (message: string) => void;
}

/**
 * TalentScoutNotifier stores watchers interested in certain credentials and
 * notifies them when a new matching candidate is registered.
 */
export class TalentScoutNotifier {
  private watchers: Map<string, Watcher> = new Map();

  /**
   * Register a watcher interested in a specific credential and location.
   */
  addWatcher(watcher: Watcher): void {
    this.watchers.set(watcher.id, watcher);
  }

  /**
   * Remove a previously registered watcher.
   */
  removeWatcher(id: string): void {
    this.watchers.delete(id);
  }

  /**
   * Notify watchers about a newly certified candidate.
   */
  notifyNewCredential(candidate: Candidate): void {
    for (const watcher of this.watchers.values()) {
      const matchesCredential = candidate.credentials.includes(watcher.credential);
      const matchesLocation = candidate.location.toLowerCase() === watcher.location.toLowerCase();

      if (matchesCredential && matchesLocation) {
        const message = `New certified ${watcher.credential} in your area: ${candidate.name}`;
        watcher.notify(message);
      }
    }
  }
}
