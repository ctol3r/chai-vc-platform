import { notifyVerifier } from '../verifier_notification_service';

export function handleSwipe(userId: string, credentialId: string, direction: 'left' | 'right'): void {
  // Handle the swipe event and automatically notify the verifier
  notifyVerifier(userId, credentialId, direction);
}
