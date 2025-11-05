'use server';
/**
 * @fileOverview Exchanges a TikTok authorization code for an access token and fetches user info.
 * This flow is designed to be fast, fetching only the essential user profile data and the most recent batch of videos.
 * A separate flow (`fetch-tiktok-history`) is responsible for fetching the complete video history asynchronously.
 * 
 * - exchangeTikTokCode - The main flow function.
 * - ExchangeTikTokCodeInput - Input schema for the flow.
 * - ExchangeTikTokCodeOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import axios from 'axios';

const ExchangeTikTokCodeInputSchema = z.object({
    code: z.string().describe('The authorization code returned from TikTok OAuth.'),
});

export type ExchangeTikTokCodeInput = z.infer<typeof ExchangeTikTokCodeInputSchema>;

const TiktokVideoSchema = z.object({
    id: z.string(),
    title: z.string().optional(),
    cover_image_url: z.string().url().optional(),
    share_url: z.string().url(),
    view_count: z.number().optional(),
    like_count: z.number().optional(),
    comment_count: z.number().optional(),
    share_count: z.number().optional(),
    create_time: z.number().optional(),
});

const ExchangeTikTokCodeOutputSchema = z.object({
    open_id: z.string().describe("The user's unique identifier on TikTok."),
    union_id: z.string().describe("The user's unique identifier across TikTok platforms."),
    access_token: z.string().describe("The access token for subsequent API calls."),
    refresh_token: z.string().describe("The refresh token to obtain new access tokens."),
    expires_in: z.number().describe("The time in seconds until the access token expires."),
    refresh_expires_in: z.number().describe("The time in seconds until the refresh token expires."),
    avatar_url: z.string().url().describe("URL for the user's profile picture."),
    display_name: z.string().describe("The user's public display name."),
    bio_description: z.string().optional().describe("User's profile bio description"),
    is_verified: z.boolean().optional().describe("Indicates if the user is a verified account"),
    profile_deep_link: z.string().url().optional().describe("Deep link to the user's profile"),
    profile_web_link: z.string().url().optional().describe("Web link to the user's profile"),
    follower_count: z.number().describe("The number of followers the user has."),
    following_count: z.number().describe("The number of users the user is following."),
    likes_count: z.number().describe("The number of likes the user has received."),
    video_count: z.number().describe("The total number of videos the user has uploaded."),
    videos: z.array(TiktokVideoSchema).describe("A list of the user's most recent public videos (first page).")
});

export type ExchangeTikTokCodeOutput = z.infer<typeof ExchangeTikTokCodeOutputSchema>;

const TIKTOK_TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';
const TIKTOK_USERINFO_URL = 'https://open.tiktokapis.com/v2/user/info/';
const TIKTOK_VIDEOLIST_URL = 'https://open.tiktokapis.com/v2/video/list/';

export async function exchangeTikTokCode(input: ExchangeTikTokCodeInput): Promise<ExchangeTikTokCodeOutput> {
    return exchangeTikTokCodeFlow(input);
}

const exchangeTikTokCodeFlow = ai.defineFlow(
    {
        name: 'exchangeTikTokCodeFlow',
        inputSchema: ExchangeTikTokCodeInputSchema,
        outputSchema: ExchangeTikTokCodeOutputSchema,
    },
    async ({ code }) => {
        const clientKey = process.env.TIKTOK_CLIENT_KEY;
        const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

        if (!clientKey || !clientSecret) {
            throw new Error('TikTok client key or secret is not configured in environment variables.');
        }

        try {
            // Step 1: Exchange authorization code for an access token
            const tokenParams = new URLSearchParams();
            tokenParams.append('client_key', clientKey);
            tokenParams.append('client_secret', clientSecret);
            tokenParams.append('code', code);
            tokenParams.append('grant_type', 'authorization_code');
            tokenParams.append('redirect_uri', 'https://9000-firebase-studio-1761913155594.cluster-gizzoza7hzhfyxzo5d76y3flkw.cloudworkstations.dev/auth/tiktok/callback');

            const tokenResponse = await axios.post(TIKTOK_TOKEN_URL, tokenParams, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
            
            const { access_token, refresh_token, expires_in, refresh_expires_in, error, error_description, open_id } = tokenResponse.data;
            
            if (error && error.code !== 'ok') { throw new Error(`TikTok API Error: ${error.message || error_description}`); }
            if (!access_token || !open_id) { throw new Error('Failed to retrieve access token or open_id from TikTok.'); }
            
            // Step 2: Use the access token to fetch user information
            const userFields = [
                'open_id','union_id','avatar_url','display_name','bio_description',
                'profile_deep_link','is_verified','follower_count','following_count',
                'likes_count','video_count','profile_web_link'
            ].join(',');
            const userInfoUrlWithParams = `${TIKTOK_USERINFO_URL}?fields=${userFields}`;

            const userInfoResponse = await axios.get(userInfoUrlWithParams, {
                headers: { 'Authorization': `Bearer ${access_token}` },
            });

            if (userInfoResponse.data.error.code !== 'ok') {
                throw new Error(`Failed to fetch user info: ${userInfoResponse.data.error.message}`);
            }
            const userInfo = userInfoResponse.data.data.user;
            
            // Step 3: Use access token to fetch THE FIRST PAGE of the video list
            let videos: any[] = [];
            if (userInfo.video_count > 0) {
                 try {
                    const videoFields = 'id,title,cover_image_url,share_url,view_count,like_count,comment_count,share_count,create_time';
                    
                    const videoListResponse = await axios.post(
                        TIKTOK_VIDEOLIST_URL,
                        { fields: videoFields, max_count: 20 },
                        { 
                            headers: { 
                                'Authorization': `Bearer ${access_token}`,
                                'Content-Type': 'application/json',
                             }
                        }
                    );

                    if (videoListResponse.data.error.code === 'ok' && videoListResponse.data.data.videos) {
                        videos = videoListResponse.data.data.videos;
                    } else {
                        console.warn("Could not fetch initial video list:", videoListResponse.data.error.message);
                    }
                } catch (videoError: any) {
                    console.error("TikTok video fetch failed:", videoError.response?.data || videoError.message);
                }
            }

            return {
                open_id: userInfo.open_id,
                union_id: userInfo.union_id,
                access_token,
                refresh_token,
                expires_in,
                refresh_expires_in,
                avatar_url: userInfo.avatar_url,
                display_name: userInfo.display_name,
                bio_description: userInfo.bio_description,
                is_verified: userInfo.is_verified,
                profile_deep_link: userInfo.profile_deep_link,
                profile_web_link: userInfo.profile_web_link,
                follower_count: userInfo.follower_count,
                following_count: userInfo.following_count,
                likes_count: userInfo.likes_count,
                video_count: userInfo.video_count,
                videos: videos,
            };
        } catch (err: any) {
            if (axios.isAxiosError(err) && err.response) {
                console.error("Axios Error Details:", err.response.data);
                throw new Error(`API Request Failed: ${err.response.status} ${err.response.statusText} - ${JSON.stringify(err.response.data)}`);
            }
            throw err; // Re-throw other errors
        }
    }
);
