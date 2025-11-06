'use server';
/**
 * @fileOverview Refreshes a user's TikTok data, including profile stats and video list.
 * It uses a refresh token to get a new access token before fetching data.
 *
 * - refreshTiktokData - The main flow function.
 * - RefreshTiktokDataInput - Input schema for the flow.
 * - RefreshTiktokDataOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { ExchangeTikTokCodeOutput } from './exchange-tiktok-code';

const RefreshTiktokDataInputSchema = z.object({
    refreshToken: z.string().describe('The refresh token from the initial OAuth flow.'),
});

export type RefreshTiktokDataInput = z.infer<typeof RefreshTiktokDataInputSchema>;

// The output is the same as the exchange code flow, as we are fetching the same data.
export type RefreshTiktokDataOutput = ExchangeTikTokCodeOutput;


const TIKTOK_REFRESH_URL = 'https://open.tiktokapis.com/v2/oauth/token/';
const TIKTOK_USERINFO_URL = 'https://open.tiktokapis.com/v2/user/info/';
const TIKTOK_VIDEOLIST_URL = 'https://open.tiktokapis.com/v2/video/list/';


export async function refreshTiktokData(input: RefreshTiktokDataInput): Promise<RefreshTiktokDataOutput> {
    return refreshTiktokDataFlow(input);
}

const refreshTiktokDataFlow = ai.defineFlow(
    {
        name: 'refreshTiktokDataFlow',
        inputSchema: RefreshTiktokDataInputSchema,
        outputSchema: z.custom<RefreshTiktokDataOutput>()
    },
    async ({ refreshToken }) => {
        const clientKey = process.env.TIKTOK_CLIENT_KEY;
        const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

        if (!clientKey || !clientSecret) {
            throw new Error('TikTok client key or secret is not configured in environment variables.');
        }

        try {
            // Step 1: Use the refresh token to get a new access token
            const refreshParams = new URLSearchParams();
            refreshParams.append('client_key', clientKey);
            refreshParams.append('client_secret', clientSecret);
            refreshParams.append('grant_type', 'refresh_token');
            refreshParams.append('refresh_token', refreshToken);

            const tokenResponse = await fetch(TIKTOK_REFRESH_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: refreshParams,
            });

            const tokenData = await tokenResponse.json();
            const { access_token, refresh_token: new_refresh_token, expires_in, refresh_expires_in, error, error_description } = tokenData;

            if (error || !tokenResponse.ok) {
                throw new Error(`TikTok Refresh Token API Error: ${error} - ${error_description || tokenData.error?.message}`);
            }
            if (!access_token) {
                throw new Error('Failed to retrieve new access token from TikTok.');
            }

            // Step 2: Fetch user information with the new token
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

            // Step 3: Fetch video list with the new token
            const videoFields = [
                "id", "title", "cover_image_url", "share_url", "view_count",
                "like_count", "comment_count", "share_count", "create_time"
            ].join(',');
            
            const videoListUrl = new URL(TIKTOK_VIDEOLIST_URL);
            videoListUrl.searchParams.append('fields', videoFields);
            videoListUrl.searchParams.append('max_count', '20');

            const videoListResponse = await fetch(videoListUrl.toString(), {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${access_token}` },
            });

            const videoListData = await videoListResponse.json();
            if (videoListData.error.code !== 'ok') {
                throw new Error(`Failed to fetch video list from TikTok: ${videoListData.error.message}`);
            }

            const videos = videoListData.data?.videos || [];

            // Step 4: Assemble and return all data with the new tokens
            return {
                open_id: userInfo.open_id,
                union_id: userInfo.union_id,
                access_token,
                refresh_token: new_refresh_token,
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
            console.error("Full error in refreshTiktokDataFlow:", err);
            throw err;
        }
    }
);
