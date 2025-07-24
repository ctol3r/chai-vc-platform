# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Talent Scouting Notifications

The backend now includes a `TalentScoutNotifier` service that allows recruiters to register interest in specific credentials for a given location. Whenever a new candidate with matching credentials is added, registered watchers receive a notification such as **"New certified X in your area"**.

The notifier is defined in `backend/src/notifications/talent_scout_notifier.ts` and exposes methods to add or remove watchers and send notifications for new credentials.
