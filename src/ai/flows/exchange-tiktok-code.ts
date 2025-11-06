
'use server';
/**
 * @fileOverview Exchanges a TikTok authorization code for an access token, fetches user info,
 * and retrieves the user's video list in a single, consolidated flow.
 *
 * - exchangeTikTokCode - The main flow function.
 * - ExchangeTikTokCodeInput - Input schema for the flow.
 * - ExchangeTikTokCodeOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ExchangeTikTokCodeInputSchema = z.object({
    code: z.string().describe('The authorization code returned from TikTok OAuth.'),
    redirect_uri: z.string().url().describe('The exact redirect URI used in the authorization request.'),
    state: z.string().describe('The state parameter returned from TikTok OAuth for security validation.'),
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
    decodedStateUserId: z.string().describe("The user ID decoded from the state parameter."),
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
    videos: z.array(TiktokVideoSchema).describe("A list of the user's recent TikTok videos."),
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
    async ({ code, redirect_uri, state }) => {
        const clientKey = process.env.TIKTOK_CLIENT_KEY;
        const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

        if (!clientKey || !clientSecret) {
            throw new Error('TikTok client key or secret is not configured in environment variables.');
        }

        // Step 1: Decode and validate state
        let decodedState;
        try {
            decodedState = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
            if (!decodedState || !decodedState.userId) {
                throw new Error("Invalid state format.");
            }
        } catch (error) {
            throw new Error("Failed to decode or parse state parameter for security validation.");
        }
        
        const decodedUserId = decodedState.userId;


        try {
            // Step 2: Exchange authorization code for an access token
            const tokenParams = new URLSearchParams();
            tokenParams.append('client_key', clientKey);
            tokenParams.append('client_secret', clientSecret);
            tokenParams.append('code', code);
            tokenParams.append('grant_type', 'authorization_code');
            tokenParams.append('redirect_uri', redirect_uri);

            const tokenResponse = await fetch(TIKTOK_TOKEN_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: tokenParams,
            });
            
            const tokenData = await tokenResponse.json();
            const { access_token, refresh_token, expires_in, refresh_expires_in, error, error_description } = tokenData;

            if (error || !tokenResponse.ok) { 
                throw new Error(`TikTok Token API Error: ${error} - ${error_description || tokenData.error?.message}`); 
            }
            if (!access_token) { throw new Error('Failed to retrieve access token from TikTok.'); }
            
            // Step 3: Use the access token to fetch user information
            const userFields = [
                'open_id','union_id','avatar_url','display_name','bio_description',
                'profile_deep_link','is_verified','follower_count','following_count',
                'likes_count','video_count','profile_web_link'
            ].join(',');
            const userInfoUrlWithParams = `${TIKTOK_USERINFO_URL}?fields=${userFields}`;

            const userInfoResponse = await fetch(userInfoUrlWithParams, {
                headers: { 'Authorization': `Bearer ${access_token}` },
            });

            const userInfoData = await userInfoResponse.json();
            if (userInfoData.error.code !== 'ok') {
                throw new Error(`Failed to fetch user info: ${userInfoData.error.message}`);
            }
            const userInfo = userInfoData.data.user;

            // Step 4: Fetch video list
            const videoFields = [
              "id", "title", "cover_image_url", "share_url", "view_count",
              "like_count", "comment_count", "share_count", "create_time"
            ].join(',');
            
            const videoListUrl = new URL(TIKTOK_VIDEOLIST_URL);
            videoListUrl.searchParams.append('fields', videoFields);

            const videoListResponse = await fetch(videoListUrl.toString(), {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${access_token}`,
              },
            });
            
            const videoListData = await videoListResponse.json();
            
            if (videoListData.error.code !== 'ok' || !videoListData.data) {
              throw new Error(`Failed to fetch video list from TikTok: ${videoListData.error.message}`);
            }
            
            const videos = videoListData.data.videos || [];

            // Step 5: Assemble and return all data
            return {
                decodedStateUserId: decodedUserId,
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
            console.error("Full error in exchangeTikTokCodeFlow:", err);
            throw err;
        }
    }
);
