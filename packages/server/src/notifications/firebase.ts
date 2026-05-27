import { NotificationProvider } from './provider';
import { NotificationPayload } from '@chat/shared';
import { logger } from '../utils/logger';

/**
 * Firebase Cloud Messaging push notification provider (STUB).
 *
 * In production, this would use the Firebase Admin SDK:
 *   import * as admin from 'firebase-admin';
 *   await admin.messaging().send({ token, notification: { title, body }, data });
 */
export class FirebasePushProvider implements NotificationProvider {
  name = 'firebase-push';

  async send(userId: string, payload: NotificationPayload): Promise<boolean> {
    logger.info(
      { userId, title: payload.title, provider: this.name },
      '[STUB] Firebase push notification would be sent'
    );
    // TODO: Implement real Firebase integration
    // const message = {
    //   token: userFcmToken,
    //   notification: { title: payload.title, body: payload.body },
    //   data: payload.data ? Object.fromEntries(
    //     Object.entries(payload.data).map(([k, v]) => [k, String(v)])
    //   ) : undefined,
    // };
    // await admin.messaging().send(message);
    return true;
  }
}
