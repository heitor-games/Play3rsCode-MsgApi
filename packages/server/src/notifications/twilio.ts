import { NotificationProvider } from './provider';
import { NotificationPayload } from '@chat/shared';
import { logger } from '../utils/logger';

/**
 * Twilio SMS notification provider (STUB).
 *
 * In production, this would use the Twilio SDK:
 *   import twilio from 'twilio';
 *   const client = twilio(accountSid, authToken);
 *   await client.messages.create({ body, to, from });
 */
export class TwilioSMSProvider implements NotificationProvider {
  name = 'twilio-sms';

  async send(userId: string, payload: NotificationPayload): Promise<boolean> {
    logger.info(
      { userId, title: payload.title, provider: this.name },
      '[STUB] Twilio SMS notification would be sent'
    );
    // TODO: Implement real Twilio integration
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //   body: `${payload.title}: ${payload.body}`,
    //   to: userPhoneNumber,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    // });
    return true;
  }
}
