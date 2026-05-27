export const EVENTS = {
  // Client -> Server
  MESSAGE_SEND: 'message:send',
  MESSAGE_READ: 'message:read',
  CHANNEL_CREATE: 'channel:create',
  CHANNEL_JOIN: 'channel:join',
  CHANNEL_LEAVE: 'channel:leave',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',

  // Server -> Client
  MESSAGE_NEW: 'message:new',
  MESSAGE_ACK: 'message:ack',
  CHANNEL_CREATED: 'channel:created',
  CHANNEL_MEMBER_JOINED: 'channel:member_joined',
  CHANNEL_MEMBER_LEFT: 'channel:member_left',
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  TYPING_INDICATOR: 'typing:indicator',
  NOTIFICATION: 'notification',
  ERROR: 'error',
} as const;
