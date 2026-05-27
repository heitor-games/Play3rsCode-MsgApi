export declare enum MessageType {
    TEXT = "TEXT",
    IMAGE = "IMAGE",
    SYSTEM = "SYSTEM"
}
export interface Message {
    id: string;
    content: string;
    senderId: string;
    channelId: string | null;
    recipientId: string | null;
    type: MessageType;
    createdAt: Date;
    readAt: Date | null;
}
export interface MessageWithSender extends Message {
    sender: {
        id: string;
        username: string;
        avatarUrl: string | null;
    };
}
export interface SendMessagePayload {
    content: string;
    channelId?: string;
    recipientId?: string;
    type?: MessageType;
}
export interface MessageReadPayload {
    messageId: string;
}
//# sourceMappingURL=message.d.ts.map