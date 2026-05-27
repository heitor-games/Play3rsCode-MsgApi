export interface User {
    id: string;
    email: string;
    username: string;
    avatarUrl: string | null;
    isOnline: boolean;
    lastSeen: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface UserProfile {
    id: string;
    email: string;
    username: string;
    avatarUrl: string | null;
    isOnline: boolean;
    lastSeen: Date;
}
export interface RegisterPayload {
    email: string;
    username: string;
    password: string;
}
export interface LoginPayload {
    email: string;
    password: string;
}
export interface AuthResponse {
    token: string;
    user: UserProfile;
}
//# sourceMappingURL=user.d.ts.map