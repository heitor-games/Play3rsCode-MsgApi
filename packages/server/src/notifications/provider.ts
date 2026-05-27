import { NotificationPayload } from '@chat/shared';

export interface NotificationProvider {
  name: string;
  send(userId: string, payload: NotificationPayload): Promise<boolean>;
}
