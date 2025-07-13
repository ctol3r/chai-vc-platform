# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Push Notifications

The backend now includes a `push_notification_service.ts` module that demonstrates
how to send push notifications using Firebase Cloud Messaging (FCM) and Apple
Push Notification service (APNs). The implementation is a stub that logs the
notification payload. In a production environment you would initialize the
respective SDKs (for example `firebase-admin` or `apn`) with your credentials
and call `sendFCM()` or `sendAPN()` to alert users about credential updates or
new job postings.

