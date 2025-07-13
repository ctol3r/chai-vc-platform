import { sendFcmNotification, sendApnsNotification } from '../notifications/push_notification_service';

export interface User {
    id: string;
    fcmToken?: string;
    apnsToken?: string;
}

export class CredentialController {
    async offerCredential(user: User, credentialId: string): Promise<void> {
        // TODO: implement actual credential offer logic

        const title = 'Credential Offer';
        const body = `You have a new credential offer for ${credentialId}.`;

        if (user.fcmToken) {
            await sendFcmNotification(user.fcmToken, title, body);
        }
        if (user.apnsToken) {
            await sendApnsNotification(user.apnsToken, title, body);
        }
    }

    async revokeCredential(user: User, credentialId: string): Promise<void> {
        // TODO: implement actual credential revoke logic

        const title = 'Credential Revoked';
        const body = `Credential ${credentialId} has been revoked.`;

        if (user.fcmToken) {
            await sendFcmNotification(user.fcmToken, title, body);
        }
        if (user.apnsToken) {
            await sendApnsNotification(user.apnsToken, title, body);
        }
    }
}
