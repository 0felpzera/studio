
export type TiktokVideo = {
    id: string;
    title?: string;
    cover_image_url?: string;
    share_url: string;
    view_count?: number;
    like_count?: number;
    comment_count?: number;
    share_count?: number;
    create_time?: number;
}

export type TiktokAccount = {
    id: string;
    userId: string;
    username: string;
    avatarUrl: string;
    followerCount: number;
    followingCount: number;
    likesCount: number;
    videoCount: number;
    bioDescription: string;
    isVerified: boolean;
    profileDeepLink: string;
    accessToken: string;
    refreshToken: string;
    tokenExpiresAt: number;
    refreshTokenExpiresAt: number;
    lastSyncStatus: 'pending' | 'syncing' | 'success' | 'error';
    lastSyncError?: string;
};
