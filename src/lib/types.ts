
import { Timestamp } from 'firebase/firestore';
import { z } from 'zod';

export type TiktokVideo = {
    id: string;
    title?: string;
    cover_image_url?: string;
    share_url: string;
    view_count?: number;
    like_count?: number;
    share_count?: number;
    create_time?: number;
}

export type FollowerHistory = {
    date: string;
    count: number;
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
    profileWebLink?: string;
    accessToken: string;
    refreshToken: string;
    tokenExpiresAt: number;
    refreshTokenExpiresAt: number;
    lastSyncStatus: 'pending' | 'syncing' | 'success' | 'error';
    lastSyncTime?: string;
    lastSyncError?: string;
    followerHistory?: FollowerHistory[];
};

export type SavedVideoIdea = {
    id: string;
    userId: string;
    title: string;
    description: string;
    scriptOutline: string;
    type: 'Evergreen' | 'Trending';
    savedAt: Timestamp; 
};

export interface ContentTask {
  id: string;
  userId: string;
  date: Timestamp;
  platform: string;
  description: string;
  isCompleted: boolean;
  status: 'pending' | 'active';
}

export const GoalSchema = z.object({
  niche: z.string().min(1, "O nicho é obrigatório."),
  followerGoal: z.coerce.number().min(1, "A meta de seguidores é obrigatória."),
  postingFrequency: z.string().min(1, "A frequência de postagem é obrigatória."),
});

export type Goal = z.infer<typeof GoalSchema> & {
    id: string;
    userId: string;
};


export const GenerateGrowthPlanInputSchema = z.object({
  niche: z.string().describe("The creator's primary niche (e.g., 'Fashion', 'Fitness')."),
  country: z.string().describe("The creator's primary country of operation (e.g., 'Brazil')."),
  followers: z.coerce.number().describe('The current number of followers.'),
  followerGoal: z.coerce.number().describe('The target number of followers.'),
  reelsPerMonth: z.number().describe('The number of Reels the creator plans to post per month.'),
  storiesPerMonth: z.number().describe('The number of Stories with a Call-to-Action the creator plans to post per month.'),
  priority: z.string().describe("The creator's main priority ('Reach', 'Conversion', or 'Authority')."),
});
export type GenerateGrowthPlanInput = z.infer<typeof GenerateGrowthPlanInputSchema>;

export const GenerateGrowthPlanOutputSchema = z.object({
  timeToGoal: z.string().describe("An estimated time to reach the follower goal, like '~8 months' or '~1.5 years'."),
  potentialEarnings: z.string().describe("An estimated monthly earnings potential, like 'R$1.5k-R$5k'."),
  weeklyPlan: z.string().describe("A recommended weekly posting plan, like '2 Reels, 3 Stories'."),
});
export type GenerateGrowthPlanOutput = z.infer<typeof GenerateGrowthPlanOutputSchema>;

export type VideoAnalysis = {
    id: string;
    userId: string;
    videoName: string;
    savedAt: Timestamp;
    hookAnalysis: {
        effectiveness: string;
        suggestions: string[];
    };
    technicalQuality: {
        lighting: string;
        audio: string;
        framing: string;
        suggestions: string[];
    };
    pacing: {
        assessment: string;
        suggestions: string[];
    };
    captionSuggestions: string;
    hashtagSuggestions: string[];
};
