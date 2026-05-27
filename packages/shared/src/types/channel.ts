export enum ChannelRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export interface Channel {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChannelWithMembers extends Channel {
  members: ChannelMember[];
  _count: { members: number };
}

export interface ChannelMember {
  id: string;
  channelId: string;
  userId: string;
  role: ChannelRole;
  joinedAt: Date;
}

export interface CreateChannelPayload {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface JoinChannelPayload {
  channelId: string;
}

export interface LeaveChannelPayload {
  channelId: string;
}
