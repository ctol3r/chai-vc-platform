import admin from 'firebase-admin';
import apn from 'apn';

// Initialize Firebase Admin SDK for FCM
// In a real application, credentials would be loaded from env vars or a config file
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
});

// APNs provider setup
const apnProvider = new apn.Provider({
    token: {
        key: process.env.APNS_KEY_PATH || '',
        keyId: process.env.APNS_KEY_ID || '',
        teamId: process.env.APNS_TEAM_ID || '',
    },
    production: false,
});

export async function sendFcmNotification(token: string, title: string, body: string) {
    await admin.messaging().send({
        token,
        notification: { title, body },
    });
}

export async function sendApnsNotification(token: string, title: string, body: string) {
    const note = new apn.Notification({
        alert: { title, body },
    });
    await apnProvider.send(note, token);
}
