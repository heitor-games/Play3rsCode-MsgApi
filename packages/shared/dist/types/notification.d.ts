export declare enum NotificationType {
    MESSAGE = "MESSAGE",
    CHANNEL_INVITE = "CHANNEL_INVITE",
    MENTION = "MENTION",
    SYSTEM = "SYSTEM"
}
export interface NotificationPayload {
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, unknown>;
}
export interface NotificationProvider {
    name: string;
    send(userId: string, payload: NotificationPayload): Promise<boolean>;
}
//# sourceMappingURL=notification.d.ts.map