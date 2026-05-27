// Client -> Server events
export interface ClientToServerEvents {
  'message:send': (payload: {
    content: string;
    channelId?: string;
    recipientId?: string;
  }) => void;
  'message:read': (payload: { messageId: string }) => void;
  'channel:create': (payload: {
    name: string;
    description?: string;
    isPublic?: boolean;
  }) => void;
  'channel:join': (payload: { channelId: string }) => void;
  'channel:leave': (payload: { channelId: string }) => void;
  'typing:start': (payload: { channelId?: string; recipientId?: string }) => void;
  'typing:stop': (payload: { channelId?: string; recipientId?: string }) => void;
}

// Server -> Client events
export interface ServerToClientEvents {
  'message:new': (payload: {
    message: {
      id: string;
      content: string;
      senderId: string;
      channelId: string | null;
      recipientId: string | null;
      type: string;
      createdAt: string;
    };
    sender: {
      id: string;
      username: string;
      avatarUrl: string | null;
    };
  }) => void;
  'message:ack': (payload: { messageId: string; status: string }) => void;
  'channel:created': (payload: { channel: unknown }) => void;
  'channel:member_joined': (payload: {
    channelId: string;
    user: { id: string; username: string };
  }) => void;
  'channel:member_left': (payload: { channelId: string; userId: string }) => void;
  'user:online': (payload: { userId: string }) => void;
  'user:offline': (payload: { userId: string }) => void;
  'typing:indicator': (payload: {
    userId: string;
    channelId?: string;
    isTyping: boolean;
  }) => void;
  notification: (payload: {
    type: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }) => void;
  error: (payload: { code: string; message: string }) => void;
}

// Socket data attached to each connection
export interface SocketData {
  userId: string;
  username: string;
}
